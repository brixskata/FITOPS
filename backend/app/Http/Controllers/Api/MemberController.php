<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Member\StoreMemberRequest;
use App\Http\Requests\Member\UpdateMemberRequest;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use App\Models\Membership;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));
        $status = strtolower((string) $request->input('status', 'all'));
        $membership = trim((string) $request->input('membership', 'all'));
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min($perPage, 25));

        $query = Member::query()
            ->with(['user.roles', 'trainer.user:id,name', 'latestMembership.membershipPlan'])
            ->when($search !== '', function ($memberQuery) use ($search): void {
                $memberQuery->where(function ($subQuery) use ($search): void {
                    $subQuery->where('member_code', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('memberships.membershipPlan', function ($membershipQuery) use ($search): void {
                            $membershipQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['active', 'inactive', 'suspended'], true), fn ($memberQuery) => $memberQuery->where('status', $status))
            ->when($membership !== '' && $membership !== 'all', function ($memberQuery) use ($membership): void {
                if ($membership === 'No Membership') {
                    $memberQuery->whereDoesntHave('memberships');

                    return;
                }

                $memberQuery->whereHas('memberships.membershipPlan', function ($membershipQuery) use ($membership): void {
                    $membershipQuery->where('name', $membership);
                });
            })
            ->latest('joined_at')
            ->latest('id');

        $members = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'message' => 'Members retrieved successfully.',
            'data' => [
                'data' => collect($members->items())
                    ->map(fn (Member $member) => (new MemberResource($member))->resolve())
                    ->values(),
                'meta' => [
                    'current_page' => $members->currentPage(),
                    'last_page' => $members->lastPage(),
                    'per_page' => $members->perPage(),
                    'total' => $members->total(),
                    'from' => $members->firstItem(),
                    'to' => $members->lastItem(),
                ],
                'filters' => [
                    'memberships' => $this->membershipOptions(),
                    'statuses' => ['active', 'inactive', 'suspended'],
                ],
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $member = Member::query()
            ->with(['user.roles', 'trainer.user:id,name', 'memberships.membershipPlan', 'latestMembership.membershipPlan'])
            ->find($id);

        if (! $member) {
            return response()->json([
                'message' => 'Member not found.',
            ], 404);
        }

        return response()->json([
            'message' => 'Member retrieved successfully.',
            'data' => (new MemberResource($member))->resolve(),
        ]);
    }

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $member = DB::transaction(function () use ($request): Member {
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
            ]);

            $user->assignRole('Member');

            return $user->member()->create([
                'member_code' => $request->validated('member_code') ?: $this->generateMemberCode(),
                'trainer_id' => $request->validated('trainer_id'),
                'phone' => $request->validated('phone'),
                'gender' => $request->validated('gender'),
                'date_of_birth' => $request->validated('date_of_birth'),
                'address' => $request->validated('address'),
                'emergency_contact_name' => $request->validated('emergency_contact_name'),
                'emergency_contact_phone' => $request->validated('emergency_contact_phone'),
                'height' => $request->validated('height'),
                'weight' => $request->validated('weight'),
                'joined_at' => now(),
                'status' => $request->validated('status', 'active'),
            ]);
        });

        $member->load(['user.roles', 'trainer.user:id,name', 'latestMembership.membershipPlan']);

        return response()->json([
            'message' => 'Member created successfully.',
            'data' => (new MemberResource($member))->resolve(),
        ], 201);
    }

    public function update(UpdateMemberRequest $request, int $id): JsonResponse
    {
        $member = Member::query()->with('user')->find($id);

        if (! $member) {
            return response()->json([
                'message' => 'Member not found.',
            ], 404);
        }

        DB::transaction(function () use ($request, $member): void {
            $user = $member->user;

            $user->fill([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
            ]);

            if ($request->filled('password')) {
                $user->password = Hash::make($request->validated('password'));
            }

            $user->save();

            $member->fill([
                'member_code' => $request->validated('member_code') ?: $member->member_code,
                'trainer_id' => $request->validated('trainer_id'),
                'phone' => $request->validated('phone'),
                'gender' => $request->validated('gender'),
                'date_of_birth' => $request->validated('date_of_birth'),
                'address' => $request->validated('address'),
                'emergency_contact_name' => $request->validated('emergency_contact_name'),
                'emergency_contact_phone' => $request->validated('emergency_contact_phone'),
                'height' => $request->validated('height'),
                'weight' => $request->validated('weight'),
                'status' => $request->validated('status'),
            ]);

            $member->save();
        });

        $member->load(['user.roles', 'trainer.user:id,name', 'latestMembership.membershipPlan']);

        return response()->json([
            'message' => 'Member updated successfully.',
            'data' => (new MemberResource($member))->resolve(),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $member = Member::query()->with('user')->find($id);

        if (! $member) {
            return response()->json([
                'message' => 'Member not found.',
            ], 404);
        }

        DB::transaction(function () use ($member): void {
            $member->user?->tokens()->delete();
            $member->user?->delete();

            if ($member->exists()) {
                $member->delete();
            }
        });

        return response()->json([
            'message' => 'Member deleted successfully.',
        ]);
    }

    protected function generateMemberCode(): string
    {
        return 'MBR-' . now()->format('ymdHis') . '-' . Str::upper(Str::random(4));
    }

    /**
     * Get membership filter options for the UI.
     *
     * @return array<int, string>
     */
    protected function membershipOptions(): array
    {
        $membershipOptions = Membership::query()
            ->with('membershipPlan:id,name')
            ->get()
            ->pluck('membershipPlan.name')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        if (Member::query()->doesntHave('memberships')->exists()) {
            array_unshift($membershipOptions, 'No Membership');
        }

        return $membershipOptions;
    }
}
