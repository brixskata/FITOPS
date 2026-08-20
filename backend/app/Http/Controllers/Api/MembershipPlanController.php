<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipPlan\StoreMembershipPlanRequest;
use App\Http\Requests\MembershipPlan\UpdateMembershipPlanRequest;
use App\Http\Requests\MembershipPlan\UpdateMembershipPlanStatusRequest;
use App\Http\Resources\MembershipPlanResource;
use App\Models\MembershipPlan;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MembershipPlanController extends Controller
{
    /**
     * Return all Membership Plans for Admin management, including inactive plans.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));
        $status = strtolower((string) $request->input('status', 'all'));
        $perPage = max(1, min($request->integer('per_page', 10), 25));

        $membershipPlans = MembershipPlan::query()
            ->withCount('memberships')
            ->when($search !== '', function ($planQuery) use ($search): void {
                $planQuery->where(function ($subQuery) use ($search): void {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), fn ($planQuery) => $planQuery->where('status', $status))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Membership plans retrieved successfully.',
            'data' => [
                'data' => MembershipPlanResource::collection($membershipPlans->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $membershipPlans->currentPage(),
                    'last_page' => $membershipPlans->lastPage(),
                    'per_page' => $membershipPlans->perPage(),
                    'total' => $membershipPlans->total(),
                    'from' => $membershipPlans->firstItem(),
                    'to' => $membershipPlans->lastItem(),
                ],
                'filters' => [
                    'statuses' => ['active', 'inactive'],
                ],
            ],
        ]);
    }

    public function adminShow(int $id): JsonResponse
    {
        $membershipPlan = MembershipPlan::query()
            ->withCount('memberships')
            ->find($id);

        if (! $membershipPlan) {
            return response()->json(['message' => 'Membership plan not found.'], 404);
        }

        return response()->json([
            'message' => 'Membership plan retrieved successfully.',
            'data' => (new MembershipPlanResource($membershipPlan))->resolve(),
        ]);
    }

    public function adminStore(StoreMembershipPlanRequest $request): JsonResponse
    {
        $membershipPlan = MembershipPlan::create($request->validated());
        $membershipPlan->loadCount('memberships');

        return response()->json([
            'message' => 'Membership plan created successfully.',
            'data' => (new MembershipPlanResource($membershipPlan))->resolve(),
        ], 201);
    }

    public function adminUpdate(UpdateMembershipPlanRequest $request, int $id): JsonResponse
    {
        $membershipPlan = MembershipPlan::query()->find($id);

        if (! $membershipPlan) {
            return response()->json(['message' => 'Membership plan not found.'], 404);
        }

        $membershipPlan->update($request->validated());
        $membershipPlan->loadCount('memberships');

        return response()->json([
            'message' => 'Membership plan updated successfully.',
            'data' => (new MembershipPlanResource($membershipPlan))->resolve(),
        ]);
    }

    public function adminUpdateStatus(UpdateMembershipPlanStatusRequest $request, int $id): JsonResponse
    {
        $membershipPlan = MembershipPlan::query()->find($id);

        if (! $membershipPlan) {
            return response()->json(['message' => 'Membership plan not found.'], 404);
        }

        $membershipPlan->update(['status' => $request->validated('status')]);
        $membershipPlan->loadCount('memberships');

        return response()->json([
            'message' => 'Membership plan status updated successfully.',
            'data' => (new MembershipPlanResource($membershipPlan))->resolve(),
        ]);
    }

    public function index(): JsonResponse
    {
        $membershipPlans = MembershipPlan::query()
            ->latest()
            ->paginate(10);

        return response()->json([
            'message' => 'Membership plans retrieved successfully.',
            'data' => $membershipPlans,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $membershipPlan = MembershipPlan::query()->find($id);

        if (! $membershipPlan) {
            return response()->json([
                'message' => 'Membership plan not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Membership plan retrieved successfully.',
            'data' => $membershipPlan,
        ]);
    }

    public function store(StoreMembershipPlanRequest $request): JsonResponse
    {
        $membershipPlan = MembershipPlan::create($request->validated());

        return response()->json([
            'message' => 'Membership plan created successfully.',
            'data' => $membershipPlan,
        ], 201);
    }

    public function update(UpdateMembershipPlanRequest $request, int $id): JsonResponse
    {
        $membershipPlan = MembershipPlan::query()->find($id);

        if (! $membershipPlan) {
            return response()->json([
                'message' => 'Membership plan not found.',
            ], 404);
        }

        $membershipPlan->update($request->validated());

        return response()->json([
            'message' => 'Membership plan updated successfully.',
            'data' => $membershipPlan->fresh(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $membershipPlan = MembershipPlan::query()->find($id);

        if (! $membershipPlan) {
            return response()->json([
                'message' => 'Membership plan not found.',
            ], 404);
        }

        if ($membershipPlan->memberships()->exists()) {
            return response()->json([
                'message' => 'Membership plan cannot be deleted because memberships already reference it.',
            ], 409);
        }

        try {
            $membershipPlan->delete();
        } catch (QueryException $exception) {
            return response()->json([
                'message' => 'Membership plan cannot be deleted because memberships already reference it.',
            ], 409);
        }

        return response()->json([
            'message' => 'Membership plan deleted successfully.',
        ]);
    }
}
