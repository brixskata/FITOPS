<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrainerController extends Controller
{
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
