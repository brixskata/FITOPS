<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerMemberResource;
use App\Models\Member;
use App\Models\Trainer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TrainerMembersController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $trainer = $this->authenticatedTrainer($request);

        if (! $trainer) {
            return $this->profileNotFoundResponse();
        }

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(['all', 'active', 'inactive', 'suspended'])],
            'membership_status' => ['nullable', Rule::in(['all', 'active', 'expired', 'cancelled'])],
            'member_id' => [
                'nullable',
                'integer',
                Rule::exists('members', 'id')->where('trainer_id', $trainer->id),
            ],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:25'],
            'trainer_id' => ['prohibited'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $status = strtolower((string) ($filters['status'] ?? 'all'));
        $membershipStatus = strtolower((string) ($filters['membership_status'] ?? 'all'));
        $perPage = (int) ($filters['per_page'] ?? 10);

        $members = $this->trainerMembersQuery($trainer)
            ->when($search !== '', function (Builder $memberQuery) use ($search): void {
                $memberQuery->where(function (Builder $searchQuery) use ($search): void {
                    $searchQuery->where('member_code', 'like', "%{$search}%")
                        ->orWhereHas('user', function (Builder $userQuery) use ($search): void {
                            $userQuery->where(function (Builder $identityQuery) use ($search): void {
                                $identityQuery->where('name', 'like', "%{$search}%")
                                    ->orWhere('email', 'like', "%{$search}%");
                            });
                        });
                });
            })
            ->when($status !== 'all', fn (Builder $query) => $query->where('status', $status))
            ->when(isset($filters['member_id']), fn (Builder $query) => $query->whereKey($filters['member_id']))
            ->when($membershipStatus !== 'all', function (Builder $query) use ($membershipStatus): void {
                $this->applyMembershipStatusFilter($query, $membershipStatus);
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Trainer members retrieved successfully.',
            'data' => [
                'data' => TrainerMemberResource::collection($members->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $members->currentPage(),
                    'last_page' => $members->lastPage(),
                    'per_page' => $members->perPage(),
                    'total' => $members->total(),
                    'from' => $members->firstItem(),
                    'to' => $members->lastItem(),
                ],
                'filters' => [
                    'statuses' => ['active', 'inactive', 'suspended'],
                    'membership_statuses' => ['active', 'expired', 'cancelled'],
                ],
            ],
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $trainer = $this->authenticatedTrainer($request);

        if (! $trainer) {
            return $this->profileNotFoundResponse();
        }

        $member = $this->trainerMembersQuery($trainer)->find($id);

        if (! $member) {
            return response()->json(['message' => 'Member not found.'], 404);
        }

        return response()->json([
            'message' => 'Trainer member retrieved successfully.',
            'data' => (new TrainerMemberResource($member))->resolve(),
        ]);
    }

    private function authenticatedTrainer(Request $request): ?Trainer
    {
        return $request->user()->trainer()->first();
    }

    private function trainerMembersQuery(Trainer $trainer): Builder
    {
        return Member::query()
            ->where('trainer_id', $trainer->id)
            ->with([
                'user:id,name,email',
                'latestMembership' => fn ($membershipQuery) => $membershipQuery
                    ->select('memberships.id', 'memberships.member_id', 'memberships.membership_plan_id', 'memberships.membership_number', 'memberships.starts_at', 'memberships.ends_at', 'memberships.status')
                    ->with('membershipPlan:id,name'),
            ])
            ->withCount('attendance')
            ->withMax('attendance', 'checked_in_at');
    }

    private function applyMembershipStatusFilter(Builder $query, string $status): void
    {
        $query->whereHas('latestMembership', function (Builder $membershipQuery) use ($status): void {
            if ($status === 'active') {
                $membershipQuery
                    ->where('status', 'active')
                    ->where('ends_at', '>', now());

                return;
            }

            if ($status === 'expired') {
                $membershipQuery->where(function (Builder $statusQuery): void {
                    $statusQuery->where('status', 'expired')
                        ->orWhere(function (Builder $activeQuery): void {
                            $activeQuery->where('status', 'active')
                                ->where('ends_at', '<=', now());
                        });
                });

                return;
            }

            $membershipQuery->where('status', $status);
        });
    }

    private function profileNotFoundResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Trainer profile not found.',
        ], 404);
    }
}
