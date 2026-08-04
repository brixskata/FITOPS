<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MembershipPlan\StoreMembershipPlanRequest;
use App\Http\Requests\MembershipPlan\UpdateMembershipPlanRequest;
use App\Models\MembershipPlan;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;

class MembershipPlanController extends Controller
{
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
