<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\CheckInRequest;
use App\Http\Requests\Attendance\CheckOutRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Membership;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    private const REPORTING_TIMEZONE = 'Asia/Manila';

    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:255'],
            'member_id' => ['nullable', 'integer', Rule::exists('members', 'id')],
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'session_state' => ['nullable', Rule::in(['all', 'open', 'completed'])],
            'trainer_id' => ['nullable', 'integer', Rule::exists('trainers', 'id')],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:25'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $search = trim((string) ($filters['search'] ?? ''));
        $perPage = (int) ($filters['per_page'] ?? 10);

        $attendance = $this->attendanceQuery()
            ->when($search !== '', function (Builder $attendanceQuery) use ($search): void {
                $attendanceQuery->whereHas('member.user', function (Builder $userQuery) use ($search): void {
                    $userQuery->where(function (Builder $nameQuery) use ($search): void {
                        $nameQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            })
            ->when(isset($filters['member_id']), fn (Builder $query) => $query->where('member_id', $filters['member_id']))
            ->when(isset($filters['trainer_id']), function (Builder $query) use ($filters): void {
                $query->whereHas('member', fn (Builder $memberQuery) => $memberQuery->where('trainer_id', $filters['trainer_id']));
            })
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
            'message' => 'Attendance records retrieved successfully.',
            'data' => [
                'data' => AttendanceResource::collection($attendance->getCollection())->resolve(),
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

    public function show(int $id): JsonResponse
    {
        $attendance = $this->attendanceQuery()->find($id);

        if (! $attendance) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        return response()->json([
            'message' => 'Attendance record retrieved successfully.',
            'data' => (new AttendanceResource($attendance))->resolve(),
        ]);
    }

    public function checkIn(CheckInRequest $request): JsonResponse
    {
        $checkedInAt = $this->parseAttendanceTimestamp($request->validated('checked_in_at'));
        $this->ensureTimestampIsNotUnreasonablyFuture($checkedInAt, 'checked_in_at');

        $attendance = DB::transaction(function () use ($request, $checkedInAt): Attendance {
            $member = Member::query()
                ->lockForUpdate()
                ->findOrFail($request->validated('member_id'));

            if ($member->status !== 'active') {
                throw ValidationException::withMessages([
                    'member_id' => ['Only active members can be checked in.'],
                ]);
            }

            $hasEligibleMembership = Membership::query()
                ->where('member_id', $member->id)
                ->where('status', 'active')
                ->where('starts_at', '<=', $checkedInAt)
                ->where('ends_at', '>', $checkedInAt)
                ->exists();

            if (! $hasEligibleMembership) {
                throw ValidationException::withMessages([
                    'member_id' => ['This member does not have an active membership for the selected check-in time.'],
                ]);
            }

            $hasOpenSession = Attendance::query()
                ->where('member_id', $member->id)
                ->whereNull('checked_out_at')
                ->exists();

            if ($hasOpenSession) {
                $memberName = $member->user()->value('name') ?? 'This member';

                throw new HttpResponseException(response()->json([
                    'message' => "{$memberName} is already checked in.",
                ], 409));
            }

            return Attendance::create([
                'member_id' => $member->id,
                'checked_in_at' => $checkedInAt,
                'recorded_by_user_id' => $request->user()->id,
                'notes' => $request->validated('notes'),
            ]);
        });

        $attendance = $this->attendanceQuery()->findOrFail($attendance->id);

        return response()->json([
            'message' => 'Member checked in successfully.',
            'data' => (new AttendanceResource($attendance))->resolve(),
        ], 201);
    }

    public function checkOut(CheckOutRequest $request, int $id): JsonResponse
    {
        if (! Attendance::query()->whereKey($id)->exists()) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        $checkedOutAt = $this->parseAttendanceTimestamp($request->validated('checked_out_at'));
        $this->ensureTimestampIsNotUnreasonablyFuture($checkedOutAt, 'checked_out_at');

        $attendance = DB::transaction(function () use ($request, $id, $checkedOutAt): Attendance {
            $attendance = Attendance::query()->lockForUpdate()->findOrFail($id);

            if ($attendance->checked_out_at !== null) {
                throw new HttpResponseException(response()->json([
                    'message' => 'Attendance session is already checked out.',
                ], 409));
            }

            if ($checkedOutAt->lessThanOrEqualTo($attendance->checked_in_at)) {
                throw ValidationException::withMessages([
                    'checked_out_at' => ['The check-out time must be after the check-in time.'],
                ]);
            }

            // The existing MariaDB schema gives the first TIMESTAMP column an
            // implicit ON UPDATE clause. Rewriting the original value prevents
            // checkout from changing the historical check-in timestamp.
            $updates = [
                'checked_in_at' => $attendance->checked_in_at,
                'checked_out_at' => $checkedOutAt,
            ];
            if ($request->exists('notes')) {
                $updates['notes'] = $request->validated('notes');
            }

            // Use a query update so checked_in_at is included even though its
            // value is unchanged from Eloquent's perspective.
            Attendance::query()->whereKey($attendance->id)->update($updates);
            $attendance->refresh();

            return $attendance;
        });

        $attendance = $this->attendanceQuery()->findOrFail($attendance->id);

        return response()->json([
            'message' => 'Member checked out successfully.',
            'data' => (new AttendanceResource($attendance))->resolve(),
        ]);
    }

    private function attendanceQuery(): Builder
    {
        return Attendance::query()->with([
            'member.user:id,name,email',
            'recordedByUser:id,name',
        ]);
    }

    private function parseAttendanceTimestamp(?string $value): Carbon
    {
        if ($value === null || trim($value) === '') {
            return now()->utc();
        }

        $hasExplicitTimezone = preg_match('/(?:Z|[+-]\d{2}:?\d{2})$/i', trim($value)) === 1;

        return Carbon::parse(
            $value,
            $hasExplicitTimezone ? null : self::REPORTING_TIMEZONE,
        )->utc();
    }

    private function ensureTimestampIsNotUnreasonablyFuture(Carbon $timestamp, string $field): void
    {
        if ($timestamp->greaterThan(now()->utc()->addMinutes(5))) {
            throw ValidationException::withMessages([
                $field => ['The attendance timestamp cannot be more than five minutes in the future.'],
            ]);
        }
    }

    private function manilaDateBoundary(string $date, bool $endOfDay): Carbon
    {
        $boundary = Carbon::createFromFormat('Y-m-d', $date, self::REPORTING_TIMEZONE);

        return ($endOfDay ? $boundary->endOfDay() : $boundary->startOfDay())->utc();
    }
}
