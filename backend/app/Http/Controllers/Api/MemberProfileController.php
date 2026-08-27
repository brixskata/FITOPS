<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MemberProfile\UpdateMemberProfileRequest;
use App\Http\Resources\MemberProfileResource;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return $this->profileNotFoundResponse();
        }

        $member->load('user:id,name,email');

        return response()->json([
            'message' => 'Member profile retrieved successfully.',
            'data' => (new MemberProfileResource($member))->resolve(),
        ]);
    }

    public function update(UpdateMemberProfileRequest $request): JsonResponse
    {
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return $this->profileNotFoundResponse();
        }

        $validated = $request->validated();

        DB::transaction(function () use ($member, $validated): void {
            $member->user()->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);

            $member->update([
                'phone' => $validated['phone'] ?? null,
                'address' => $validated['address'] ?? null,
                'emergency_contact_name' => $validated['emergency_contact_name'] ?? null,
                'emergency_contact_phone' => $validated['emergency_contact_phone'] ?? null,
            ]);
        });

        $member->refresh()->load('user:id,name,email');

        return response()->json([
            'message' => 'Member profile updated successfully.',
            'data' => (new MemberProfileResource($member))->resolve(),
        ]);
    }

    private function authenticatedMember(Request $request): ?Member
    {
        return $request->user()->member()->first();
    }

    private function profileNotFoundResponse(): JsonResponse
    {
        return response()->json(['message' => 'Member profile not found.'], 404);
    }
}
