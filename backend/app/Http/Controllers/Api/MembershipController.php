<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Membership\RenewMembershipRequest;
use App\Http\Requests\Membership\StoreMembershipRequest;
use App\Http\Requests\Membership\UpdateMembershipRequest;
use App\Http\Requests\Membership\UpdateMembershipStatusRequest;
use App\Http\Resources\MembershipResource;
use App\Models\Membership;
use App\Models\MembershipPlan;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MembershipController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));
        $status = strtolower((string) $request->input('status', 'all'));
        $perPage = max(1, min($request->integer('per_page', 10), 25));

        $memberships = Membership::query()
            ->with([
                'member.user:id,name,email',
                'membershipPlan:id,name,duration_days,price',
            ])
            ->withCount('payments')
            ->when($search !== '', function (Builder $membershipQuery) use ($search): void {
                $membershipQuery->where(function (Builder $subQuery) use ($search): void {
                    $subQuery->where('membership_number', 'like', "%{$search}%")
                        ->orWhereHas('member.user', function (Builder $userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('membershipPlan', function (Builder $planQuery) use ($search): void {
                            $planQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['active', 'expired', 'cancelled'], true), function (Builder $membershipQuery) use ($status): void {
                $this->applyStatusFilter($membershipQuery, $status);
            })
            ->latest('starts_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Memberships retrieved successfully.',
            'data' => [
                'data' => MembershipResource::collection($memberships->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $memberships->currentPage(),
                    'last_page' => $memberships->lastPage(),
                    'per_page' => $memberships->perPage(),
                    'total' => $memberships->total(),
                    'from' => $memberships->firstItem(),
                    'to' => $memberships->lastItem(),
                ],
                'filters' => [
                    'statuses' => ['active', 'expired', 'cancelled'],
                ],
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $membership = $this->membershipQuery()->find($id);

        if (! $membership) {
            return response()->json(['message' => 'Membership not found.'], 404);
        }

        return response()->json([
            'message' => 'Membership retrieved successfully.',
            'data' => (new MembershipResource($membership))->resolve(),
        ]);
    }

    public function store(StoreMembershipRequest $request): JsonResponse
    {
        $membership = DB::transaction(function () use ($request): Membership {
            $plan = MembershipPlan::query()->findOrFail($request->validated('membership_plan_id'));
            $startsAt = Carbon::parse($request->validated('starts_at'));
            $endsAt = $startsAt->copy()->addDays($plan->duration_days);

            $this->ensureNoActiveOverlap($request->validated('member_id'), $startsAt, $endsAt);

            return Membership::create([
                'member_id' => $request->validated('member_id'),
                'membership_plan_id' => $plan->id,
                'membership_number' => $this->generateMembershipNumber(),
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'price' => $plan->price,
                'cost' => $plan->cost,
                'status' => $endsAt->isPast() ? 'expired' : 'active',
                'auto_renew' => $request->boolean('auto_renew'),
            ]);
        });

        $membership = $this->membershipQuery()->findOrFail($membership->id);

        return response()->json([
            'message' => 'Membership created successfully.',
            'data' => (new MembershipResource($membership))->resolve(),
        ], 201);
    }

    public function update(UpdateMembershipRequest $request, int $id): JsonResponse
    {
        $membership = Membership::query()->find($id);

        if (! $membership) {
            return response()->json(['message' => 'Membership not found.'], 404);
        }

        DB::transaction(function () use ($request, $membership): void {
            $updates = $request->validated();

            if (array_key_exists('starts_at', $updates)) {
                $startsAt = Carbon::parse($updates['starts_at']);
                $endsAt = $startsAt->copy()->addDays($membership->membershipPlan()->value('duration_days'));

                if ($endsAt->lessThanOrEqualTo($startsAt)) {
                    throw ValidationException::withMessages([
                        'starts_at' => ['The membership end date must be after its start date.'],
                    ]);
                }

                if ($membership->status === 'active') {
                    $this->ensureNoActiveOverlap($membership->member_id, $startsAt, $endsAt, $membership->id);
                }

                $updates['starts_at'] = $startsAt;
                $updates['ends_at'] = $endsAt;

                if ($membership->status === 'active' && $endsAt->isPast()) {
                    $updates['status'] = 'expired';
                }
            }

            $membership->update($updates);
        });

        $membership = $this->membershipQuery()->findOrFail($membership->id);

        return response()->json([
            'message' => 'Membership updated successfully.',
            'data' => (new MembershipResource($membership))->resolve(),
        ]);
    }

    public function updateStatus(UpdateMembershipStatusRequest $request, int $id): JsonResponse
    {
        $membership = Membership::query()->find($id);

        if (! $membership) {
            return response()->json(['message' => 'Membership not found.'], 404);
        }

        $status = $request->validated('status');

        if ($status === 'active') {
            if ($membership->ends_at->isPast()) {
                throw ValidationException::withMessages([
                    'status' => ['An expired membership cannot be reactivated. Renew it to create a new active membership.'],
                ]);
            }

            $this->ensureNoActiveOverlap($membership->member_id, $membership->starts_at, $membership->ends_at, $membership->id);
        }

        $membership->update(['status' => $status]);
        $membership = $this->membershipQuery()->findOrFail($membership->id);

        return response()->json([
            'message' => 'Membership status updated successfully.',
            'data' => (new MembershipResource($membership))->resolve(),
        ]);
    }

    public function renew(RenewMembershipRequest $request, int $id): JsonResponse
    {
        $membership = Membership::query()->with('membershipPlan')->find($id);

        if (! $membership) {
            return response()->json(['message' => 'Membership not found.'], 404);
        }

        if ($membership->membershipPlan->status !== 'active') {
            throw ValidationException::withMessages([
                'membership_plan_id' => ['This membership plan is inactive and cannot be used for renewal.'],
            ]);
        }

        $renewedMembership = DB::transaction(function () use ($membership): Membership {
            $startsAt = $membership->ends_at->greaterThan(now())
                ? $membership->ends_at->copy()
                : now();
            $endsAt = $startsAt->copy()->addDays($membership->membershipPlan->duration_days);

            $this->ensureNoActiveOverlap($membership->member_id, $startsAt, $endsAt);

            return Membership::create([
                'member_id' => $membership->member_id,
                'membership_plan_id' => $membership->membership_plan_id,
                'membership_number' => $this->generateMembershipNumber(),
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'price' => $membership->membershipPlan->price,
                'cost' => $membership->membershipPlan->cost,
                'status' => 'active',
                'auto_renew' => $membership->auto_renew,
            ]);
        });

        $renewedMembership = $this->membershipQuery()->findOrFail($renewedMembership->id);

        return response()->json([
            'message' => 'Membership renewed successfully.',
            'data' => (new MembershipResource($renewedMembership))->resolve(),
        ], 201);
    }

    private function membershipQuery(): Builder
    {
        return Membership::query()
            ->with([
                'member.user:id,name,email',
                'membershipPlan:id,name,duration_days,price',
            ])
            ->withCount('payments');
    }

    private function applyStatusFilter(Builder $query, string $status): void
    {
        if ($status === 'active') {
            $query->where('status', 'active')->where('ends_at', '>', now());

            return;
        }

        if ($status === 'expired') {
            $query->where(function (Builder $statusQuery): void {
                $statusQuery->where('status', 'expired')
                    ->orWhere(function (Builder $activeQuery): void {
                        $activeQuery->where('status', 'active')->where('ends_at', '<=', now());
                    });
            });

            return;
        }

        $query->where('status', $status);
    }

    private function ensureNoActiveOverlap(int $memberId, Carbon $startsAt, Carbon $endsAt, ?int $ignoreMembershipId = null): void
    {
        $overlapExists = Membership::query()
            ->where('member_id', $memberId)
            ->where('status', 'active')
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->when($ignoreMembershipId, fn (Builder $query) => $query->whereKeyNot($ignoreMembershipId))
            ->exists();

        if ($overlapExists) {
            throw ValidationException::withMessages([
                'starts_at' => ['The member already has an active membership that overlaps this period.'],
            ]);
        }
    }

    private function generateMembershipNumber(): string
    {
        $year = now()->format('Y');
        $prefix = "MEM-{$year}-";

        $latestNumber = Membership::query()
            ->where('membership_number', 'like', "{$prefix}%")
            ->lockForUpdate()
            ->orderByDesc('membership_number')
            ->value('membership_number');

        $nextSequence = $latestNumber
            ? ((int) substr($latestNumber, -4)) + 1
            : 1;

        do {
            $membershipNumber = $prefix . str_pad((string) $nextSequence, 4, '0', STR_PAD_LEFT);
            $nextSequence++;
        } while (Membership::query()->where('membership_number', $membershipNumber)->exists());

        return $membershipNumber;
    }
}
