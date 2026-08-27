<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberMembershipResource;
use App\Models\Member;
use App\Models\Membership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberMembershipController extends Controller
{
    public function current(Request $request): JsonResponse
    {
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return $this->memberProfileNotFoundResponse();
        }

        $membership = $member->latestMembership()
            ->with('membershipPlan:id,name,duration_days,price')
            ->first();

        if (! $membership) {
            return response()->json(['message' => 'No membership found.'], 404);
        }

        return response()->json([
            'message' => 'Current membership retrieved successfully.',
            'data' => (new MemberMembershipResource($membership))->resolve(),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return $this->memberProfileNotFoundResponse();
        }

        $filters = $request->validate([
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:25'],
            'member_id' => ['prohibited'],
            'user_id' => ['prohibited'],
            'trainer_id' => ['prohibited'],
        ]);

        $memberships = Membership::query()
            ->where('member_id', $member->id)
            ->with('membershipPlan:id,name,duration_days,price')
            ->latest('starts_at')
            ->latest('id')
            ->paginate((int) ($filters['per_page'] ?? 10))
            ->withQueryString();

        return response()->json([
            'message' => 'Memberships retrieved successfully.',
            'data' => [
                'data' => MemberMembershipResource::collection($memberships->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $memberships->currentPage(),
                    'last_page' => $memberships->lastPage(),
                    'per_page' => $memberships->perPage(),
                    'total' => $memberships->total(),
                    'from' => $memberships->firstItem(),
                    'to' => $memberships->lastItem(),
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

        $membership = Membership::query()
            ->where('member_id', $member->id)
            ->with('membershipPlan:id,name,duration_days,price')
            ->find($id);

        if (! $membership) {
            return response()->json(['message' => 'Membership record not found.'], 404);
        }

        return response()->json([
            'message' => 'Membership record retrieved successfully.',
            'data' => (new MemberMembershipResource($membership))->resolve(),
        ]);
    }

    private function authenticatedMember(Request $request): ?Member
    {
        return $request->user()->member()->first();
    }

    private function memberProfileNotFoundResponse(): JsonResponse
    {
        return response()->json(['message' => 'Member profile not found.'], 404);
    }
}
