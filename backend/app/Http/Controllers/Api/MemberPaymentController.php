<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberPaymentResource;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class MemberPaymentController extends Controller
{
    private const REPORTING_TIMEZONE = 'Asia/Manila';

    public function index(Request $request): JsonResponse
    {
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return $this->memberProfileNotFoundResponse();
        }

        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'payment_method' => ['nullable', Rule::in(['cash', 'gcash', 'maya', 'card'])],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:25'],
            'member_id' => ['prohibited'],
            'user_id' => ['prohibited'],
            'trainer_id' => ['prohibited'],
        ]);

        $payments = $this->paymentQuery($member)
            ->when(isset($filters['status']), fn (Builder $query) => $query->where('status', $filters['status']))
            ->when(isset($filters['payment_method']), fn (Builder $query) => $query->where('payment_method', $filters['payment_method']))
            ->when(isset($filters['date_from']), function (Builder $query) use ($filters): void {
                $query->where('paid_at', '>=', $this->manilaDateBoundary($filters['date_from'], false));
            })
            ->when(isset($filters['date_to']), function (Builder $query) use ($filters): void {
                $query->where('paid_at', '<=', $this->manilaDateBoundary($filters['date_to'], true));
            })
            ->latest('paid_at')
            ->latest('id')
            ->paginate((int) ($filters['per_page'] ?? 10), ['*'], 'page', (int) ($filters['page'] ?? 1))
            ->withQueryString();

        return response()->json([
            'message' => 'Member payments retrieved successfully.',
            'data' => [
                'data' => MemberPaymentResource::collection($payments->getCollection())->resolve(),
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
                    'reporting_timezone' => self::REPORTING_TIMEZONE,
                ],
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return $this->memberProfileNotFoundResponse();
        }

        $payment = $this->paymentQuery($member)->whereKey($id)->first();

        if (! $payment) {
            return response()->json(['message' => 'Payment not found.'], 404);
        }

        return response()->json([
            'message' => 'Member payment retrieved successfully.',
            'data' => (new MemberPaymentResource($payment))->resolve(),
        ]);
    }

    private function authenticatedMember(Request $request): ?Member
    {
        return $request->user()->member()->first();
    }

    private function paymentQuery(Member $member): Builder
    {
        return Payment::query()
            ->whereHas('membership', function (Builder $query) use ($member): void {
                $query->where('member_id', $member->id);
            })
            ->with([
                'membership' => function ($membershipQuery): void {
                    $membershipQuery
                        ->select(['id', 'member_id', 'membership_plan_id', 'membership_number', 'starts_at', 'ends_at', 'status'])
                        ->with('membershipPlan:id,name');
                },
            ]);
    }

    private function manilaDateBoundary(string $date, bool $endOfDay): Carbon
    {
        $boundary = Carbon::createFromFormat('Y-m-d', $date, self::REPORTING_TIMEZONE);

        return ($endOfDay ? $boundary->endOfDay() : $boundary->startOfDay())->utc();
    }

    private function memberProfileNotFoundResponse(): JsonResponse
    {
        return response()->json(['message' => 'Member profile not found.'], 404);
    }
}
