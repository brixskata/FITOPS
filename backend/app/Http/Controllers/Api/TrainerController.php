<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Trainer\StoreTrainerRequest;
use App\Http\Requests\Trainer\UpdateTrainerRequest;
use App\Http\Requests\Trainer\UpdateTrainerStatusRequest;
use App\Http\Resources\TrainerResource;
use App\Models\Trainer;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TrainerController extends Controller
{
    /**
     * Return all Trainer profiles for Admin management, including inactive profiles.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $search = trim((string) $request->input('search', ''));
        $status = strtolower((string) $request->input('status', 'all'));
        $perPage = max(1, min($request->integer('per_page', 10), 25));

        $trainers = Trainer::query()
            ->with('user:id,name,email')
            ->withCount('members')
            ->when($search !== '', function ($trainerQuery) use ($search): void {
                $trainerQuery->where(function ($subQuery) use ($search): void {
                    $subQuery->where('employee_code', 'like', "%{$search}%")
                        ->orWhere('specialization', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($userQuery) use ($search): void {
                            $userQuery->where('name', 'like', "%{$search}%");
                        });
                });
            })
            ->when(in_array($status, ['active', 'inactive'], true), fn ($trainerQuery) => $trainerQuery->where('status', $status))
            ->orderBy('employee_code')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Admin Trainers retrieved successfully.',
            'data' => [
                'data' => TrainerResource::collection($trainers->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $trainers->currentPage(),
                    'last_page' => $trainers->lastPage(),
                    'per_page' => $trainers->perPage(),
                    'total' => $trainers->total(),
                    'from' => $trainers->firstItem(),
                    'to' => $trainers->lastItem(),
                ],
                'filters' => [
                    'statuses' => ['active', 'inactive'],
                ],
            ],
        ]);
    }

    public function adminShow(int $id): JsonResponse
    {
        $trainer = Trainer::query()
            ->withCount('members')
            ->with([
                'user:id,name,email',
                'members' => fn ($memberQuery) => $memberQuery
                    ->select('id', 'user_id', 'trainer_id', 'status')
                    ->with('user:id,name,email'),
            ])
            ->find($id);

        if (! $trainer) {
            return response()->json(['message' => 'Trainer not found.'], 404);
        }

        return response()->json([
            'message' => 'Trainer retrieved successfully.',
            'data' => (new TrainerResource($trainer))->resolve(),
        ]);
    }

    public function adminStore(StoreTrainerRequest $request): JsonResponse
    {
        $trainer = DB::transaction(function () use ($request): Trainer {
            $user = User::create([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
                'password' => Hash::make($request->validated('password')),
            ]);

            $user->assignRole('Trainer');

            return $user->trainer()->create([
                'employee_code' => $request->validated('employee_code'),
                'specialization' => $request->validated('specialization'),
                'bio' => $request->validated('bio'),
                'experience_years' => $request->validated('experience_years'),
                'hire_date' => $request->validated('hire_date'),
                'status' => $request->validated('status'),
            ]);
        });

        $trainer->load('user:id,name,email')->loadCount('members');

        return response()->json([
            'message' => 'Trainer created successfully.',
            'data' => (new TrainerResource($trainer))->resolve(),
        ], 201);
    }

    public function adminUpdate(UpdateTrainerRequest $request, int $id): JsonResponse
    {
        $trainer = Trainer::query()->with('user')->find($id);

        if (! $trainer) {
            return response()->json(['message' => 'Trainer not found.'], 404);
        }

        DB::transaction(function () use ($request, $trainer): void {
            $trainer->user->fill([
                'name' => $request->validated('name'),
                'email' => $request->validated('email'),
            ]);

            if ($request->filled('password')) {
                $trainer->user->password = Hash::make($request->validated('password'));
            }

            $trainer->user->save();
            $trainer->update([
                'employee_code' => $request->validated('employee_code'),
                'specialization' => $request->validated('specialization'),
                'bio' => $request->validated('bio'),
                'experience_years' => $request->validated('experience_years'),
                'hire_date' => $request->validated('hire_date'),
                'status' => $request->validated('status'),
            ]);
        });

        $trainer->load('user:id,name,email')->loadCount('members');

        return response()->json([
            'message' => 'Trainer updated successfully.',
            'data' => (new TrainerResource($trainer))->resolve(),
        ]);
    }

    public function adminUpdateStatus(UpdateTrainerStatusRequest $request, int $id): JsonResponse
    {
        $trainer = Trainer::query()->find($id);

        if (! $trainer) {
            return response()->json(['message' => 'Trainer not found.'], 404);
        }

        $trainer->update(['status' => $request->validated('status')]);
        $trainer->load('user:id,name,email')->loadCount('members');

        return response()->json([
            'message' => 'Trainer status updated successfully.',
            'data' => (new TrainerResource($trainer))->resolve(),
        ]);
    }

    /**
     * Return active Trainer profiles available for Admin member assignment.
     */
    public function index(): JsonResponse
    {
        $trainers = Trainer::query()
            ->select(['id', 'user_id', 'employee_code', 'status'])
            ->with('user:id,name')
            ->where('status', 'active')
            ->orderBy('employee_code')
            ->get()
            ->map(fn (Trainer $trainer) => [
                'id' => $trainer->id,
                'name' => $trainer->user?->name,
                'employee_code' => $trainer->employee_code,
                'status' => $trainer->status,
            ])
            ->values();

        return response()->json([
            'message' => 'Trainers retrieved successfully.',
            'data' => $trainers,
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $trainer = $this->authenticatedTrainer($request, true);

        if (! $trainer) {
            return $this->profileNotFoundResponse();
        }

        return response()->json([
            'message' => 'Trainer dashboard retrieved successfully.',
            'data' => [
                'trainer' => $this->trainerData($trainer),
                'summary' => [
                    'total_members' => $trainer->members->count(),
                ],
                'members' => $trainer->members->map(fn ($member) => [
                    'id' => $member->id,
                    'member_code' => $member->member_code,
                    'name' => $member->user?->name,
                    'email' => $member->user?->email,
                    'status' => $member->status,
                    'membership' => [
                        'status' => $member->latestMembership?->status,
                        'status_label' => $member->latestMembership?->status
                            ? Str::headline((string) $member->latestMembership->status)
                            : 'No Membership',
                        'plan_name' => $member->latestMembership?->membershipPlan?->name,
                        'starts_at' => $member->latestMembership?->starts_at?->toDateString(),
                        'ends_at' => $member->latestMembership?->ends_at?->toDateString(),
                    ],
                    'attendance' => [
                        'total_visits' => $member->attendance->count(),
                        'latest_check_in' => $member->attendance->first()?->checked_in_at?->toISOString(),
                    ],
                ])->values(),
            ],
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        $trainer = $this->authenticatedTrainer($request);

        if (! $trainer) {
            return $this->profileNotFoundResponse();
        }

        return response()->json([
            'message' => 'Trainer profile retrieved successfully.',
            'data' => [
                'trainer' => $this->trainerData($trainer),
            ],
        ]);
    }

    protected function authenticatedTrainer(Request $request, bool $withMembers = false): ?Trainer
    {
        $query = Trainer::query()
            ->with('user:id,name,email')
            ->where('user_id', $request->user()->id);

        if ($withMembers) {
            $query->with([
                'members' => fn ($memberQuery) => $memberQuery
                    ->select('id', 'user_id', 'trainer_id', 'member_code', 'status')
                    ->with([
                        'user:id,name,email',
                        'latestMembership.membershipPlan:id,name',
                        'attendance' => fn ($attendanceQuery) => $attendanceQuery
                            ->select('id', 'member_id', 'checked_in_at')
                            ->latest('checked_in_at'),
                    ]),
            ]);
        }

        return $query->first();
    }

    protected function trainerData(Trainer $trainer): array
    {
        return [
            'id' => $trainer->id,
            'employee_code' => $trainer->employee_code,
            'name' => $trainer->user?->name,
            'email' => $trainer->user?->email,
            'specialization' => $trainer->specialization,
            'biography' => $trainer->bio,
            'experience_years' => $trainer->experience_years,
            'hire_date' => $trainer->hire_date?->toDateString(),
            'status' => $trainer->status,
        ];
    }

    protected function profileNotFoundResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Trainer profile not found.',
        ], 404);
    }
}
