<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TrainerAttendanceResource;
use App\Models\Attendance;
use App\Models\Trainer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class TrainerAttendanceController extends Controller
{
    private const REPORTING_TIMEZONE = 'Asia/Manila';

    public function index(Request $request): JsonResponse
    {
        $trainer = $this->authenticatedTrainer($request);

        if (! $trainer) {
            return $this->profileNotFoundResponse();
        }

        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'member_id' => [
                'nullable',
                'integer',
                Rule::exists('members', 'id')->where('trainer_id', $trainer->id),
            ],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'session_state' => ['nullable', Rule::in(['all', 'open', 'completed'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:25'],
            'trainer_id' => ['prohibited'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $perPage = (int) ($filters['per_page'] ?? 10);

        $attendance = $this->trainerAttendanceQuery($trainer)
            ->when($search !== '', function (Builder $attendanceQuery) use ($search): void {
                $attendanceQuery->whereHas('member', function (Builder $memberQuery) use ($search): void {
                    $memberQuery->where(function (Builder $searchQuery) use ($search): void {
                        $searchQuery->where('member_code', 'like', "%{$search}%")
                            ->orWhereHas('user', function (Builder $userQuery) use ($search): void {
                                $userQuery->where(function (Builder $identityQuery) use ($search): void {
                                    $identityQuery->where('name', 'like', "%{$search}%")
                                        ->orWhere('email', 'like', "%{$search}%");
                                });
                            });
                    });
                });
            })
            ->when(isset($filters['member_id']), fn (Builder $query) => $query->where('member_id', $filters['member_id']))
            ->when(isset($filters['date_from']), function (Builder $query) use ($filters): void {
                $query->where('checked_in_at', '>=', $this->manilaDateBoundary($filters['date_from'], false));
            })
            ->when(isset($filters['date_to']), function (Builder $query) use ($filters): void {
                $query->where('checked_in_at', '<=', $this->manilaDateBoundary($filters['date_to'], true));
            })
            ->when(($filters['session_state'] ?? null) === 'open', fn (Builder $query) => $query->whereNull('checked_out_at'))
            ->when(($filters['session_state'] ?? null) === 'completed', fn (Builder $query) => $query->whereNotNull('checked_out_at'))
            ->latest('checked_in_at')
            ->latest('id')
            ->paginate($perPage)
            ->withQueryString();

        return response()->json([
            'message' => 'Trainer attendance retrieved successfully.',
            'data' => [
                'data' => TrainerAttendanceResource::collection($attendance->getCollection())->resolve(),
                'meta' => [
                    'current_page' => $attendance->currentPage(),
                    'last_page' => $attendance->lastPage(),
                    'per_page' => $attendance->perPage(),
                    'total' => $attendance->total(),
                    'from' => $attendance->firstItem(),
                    'to' => $attendance->lastItem(),
                ],
                'filters' => [
                    'session_states' => ['open', 'completed'],
                    'reporting_timezone' => self::REPORTING_TIMEZONE,
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

        $attendance = $this->trainerAttendanceQuery($trainer)->find($id);

        if (! $attendance) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        return response()->json([
            'message' => 'Trainer attendance record retrieved successfully.',
            'data' => (new TrainerAttendanceResource($attendance))->resolve(),
        ]);
    }

    private function authenticatedTrainer(Request $request): ?Trainer
    {
        return $request->user()->trainer()->first();
    }

    private function trainerAttendanceQuery(Trainer $trainer): Builder
    {
        return Attendance::query()
            ->whereHas('member', function (Builder $memberQuery) use ($trainer): void {
                $memberQuery->where('trainer_id', $trainer->id);
            })
            ->with([
                'member' => fn ($memberQuery) => $memberQuery
                    ->select('id', 'user_id', 'member_code')
                    ->with('user:id,name,email'),
            ]);
    }

    private function manilaDateBoundary(string $date, bool $endOfDay): Carbon
    {
        $boundary = Carbon::createFromFormat('Y-m-d', $date, self::REPORTING_TIMEZONE);

        return ($endOfDay ? $boundary->endOfDay() : $boundary->startOfDay())->utc();
    }

    private function profileNotFoundResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'Trainer profile not found.',
        ], 404);
    }
}
