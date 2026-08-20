<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentStatusRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Membership;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));
        $status = strtolower((string) $request->input('status', 'all'));
        $paymentMethod = strtolower((string) $request->input('payment_method', 'all'));
        $perPage = max(1, min($request->integer('per_page', 10), 25));

        $payments = $this->paymentQuery()
            ->when($search !== '', function (Builder $paymentQuery) use ($search): void {
                $paymentQuery->where(function (Builder $subQuery) use ($search): void {
                    $subQuery->where('receipt_number', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%")
                        ->orWhereHas('membership', function (Builder $membershipQuery) use ($search): void {
                            $membershipQuery->where('membership_number', 'like', "%{$search}%")
                                ->orWhereHas('member.user', function (Builder $userQuery) use ($search): void {
                                    $userQuery->where('name', 'like', "%{$search}%")
                                        ->orWhere('email', 'like', "%{$search}%");
                                })
                                ->orWhereHas('membershipPlan', function (Builder $planQuery) use ($search): void {
                                    $planQuery->where('name', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->when(in_array($status, ['pending', 'paid', 'failed', 'refunded'], true), fn (Builder $query) => $query->where('status', $status))
            ->when(in_array($paymentMethod, ['cash', 'gcash', 'maya', 'card'], true), fn (Builder $query) => $query->where('payment_method', $paymentMethod))
            ->latest('paid_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Payments retrieved successfully.',
            'data' => [
                'data' => PaymentResource::collection($payments->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                    'from' => $payments->firstItem(),
                    'to' => $payments->lastItem(),
                ],
                'filters' => [
                    'statuses' => ['pending', 'paid', 'failed', 'refunded'],
                    'payment_methods' => ['cash', 'gcash', 'maya', 'card'],
                ],
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $payment = $this->paymentQuery()->find($id);

        if (! $payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        return response()->json([
            'message' => 'Payment retrieved successfully.',
            'data' => (new PaymentResource($payment))->resolve(),
        ]);
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $payment = DB::transaction(function () use ($request): Payment {
            $membership = Membership::query()->lockForUpdate()->findOrFail($request->validated('membership_id'));
            $status = $request->validated('status');
            $amount = (float) $request->validated('amount');

            if ($status === 'paid') {
                $this->ensureAmountDoesNotOverpay($membership, $amount);
            }

            return Payment::create([
                'membership_id' => $membership->id,
                'receipt_number' => $this->generateReceiptNumber(),
                'amount' => $amount,
                'payment_method' => $request->validated('payment_method'),
                'reference_number' => $request->validated('reference_number'),
                'paid_at' => $request->validated('paid_at'),
                'status' => $status,
                'notes' => $request->validated('notes'),
            ]);
        });

        $payment = $this->paymentQuery()->findOrFail($payment->id);

        return response()->json([
            'message' => 'Payment created successfully.',
            'data' => (new PaymentResource($payment))->resolve(),
        ], 201);
    }

    public function updateStatus(UpdatePaymentStatusRequest $request, int $id): JsonResponse
    {
        $existingPayment = Payment::query()->find($id);

        if (! $existingPayment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        $payment = DB::transaction(function () use ($request, $existingPayment): Payment {
            // Lock the membership first so all paid-total checks for it serialize consistently.
            $membership = Membership::query()->lockForUpdate()->findOrFail($existingPayment->membership_id);
            $payment = Payment::query()->lockForUpdate()->findOrFail($existingPayment->id);
            $nextStatus = $request->validated('status');

            $this->ensureAllowedStatusTransition($payment->status, $nextStatus);

            if ($nextStatus === 'paid') {
                $this->ensureAmountDoesNotOverpay($membership, (float) $payment->amount, $payment->id);
            }

            $updates = ['status' => $nextStatus];
            if ($nextStatus === 'paid') {
                $updates['paid_at'] = $request->validated('paid_at');
            }

            $payment->update($updates);

            return $payment;
        });

        $payment = $this->paymentQuery()->findOrFail($payment->id);

        return response()->json([
            'message' => 'Payment status updated successfully.',
            'data' => (new PaymentResource($payment))->resolve(),
        ]);
    }

    private function paymentQuery(): Builder
    {
        return Payment::query()->with([
            'membership' => function ($membershipQuery): void {
                $membershipQuery
                    ->select(['id', 'member_id', 'membership_plan_id', 'membership_number', 'starts_at', 'ends_at', 'price', 'status'])
                    ->with(['member.user:id,name,email', 'membershipPlan:id,name'])
                    ->withSum([
                        'payments as paid_total' => fn ($paymentQuery) => $paymentQuery->where('status', 'paid'),
                    ], 'amount');
            },
        ]);
    }

    private function ensureAmountDoesNotOverpay(Membership $membership, float $amount, ?int $ignorePaymentId = null): void
    {
        $paidTotal = (float) Payment::query()
            ->where('membership_id', $membership->id)
            ->where('status', 'paid')
            ->when($ignorePaymentId, fn (Builder $query) => $query->whereKeyNot($ignorePaymentId))
            ->lockForUpdate()
            ->sum('amount');
        $remainingBalance = max((float) $membership->price - $paidTotal, 0);

        if ($amount > $remainingBalance + 0.00001) {
            throw ValidationException::withMessages([
                'amount' => ['The payment amount exceeds the remaining membership balance.'],
            ]);
        }
    }

    private function ensureAllowedStatusTransition(string $currentStatus, string $nextStatus): void
    {
        $allowedTransitions = [
            'pending' => ['pending', 'paid', 'failed'],
            'paid' => ['paid', 'failed', 'refunded'],
            'failed' => ['failed', 'pending', 'paid'],
            'refunded' => ['refunded'],
        ];

        if (! in_array($nextStatus, $allowedTransitions[$currentStatus] ?? [], true)) {
            throw ValidationException::withMessages([
                'status' => ["The payment cannot transition from {$currentStatus} to {$nextStatus}."],
            ]);
        }
    }

    private function generateReceiptNumber(): string
    {
        $year = now()->format('Y');
        $prefix = "PAY-{$year}-";
        $latestReceipt = Payment::query()
            ->where('receipt_number', 'like', "{$prefix}%")
            ->lockForUpdate()
            ->orderByDesc('receipt_number')
            ->value('receipt_number');
        $sequence = $latestReceipt ? ((int) substr($latestReceipt, -4)) + 1 : 1;

        do {
            $receiptNumber = $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
            $sequence++;
        } while (Payment::query()->where('receipt_number', $receiptNumber)->exists());

        return $receiptNumber;
    }
}
