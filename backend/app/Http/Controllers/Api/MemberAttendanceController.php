<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberAttendanceResource;
use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class MemberAttendanceController extends Controller
{
    private const REPORTING_TIMEZONE = 'Asia/Manila';

    public function index(Request $request): JsonResponse
    {
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $filters = $request->validate([
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'session_state' => ['nullable', Rule::in(['all', 'open', 'completed'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:25'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $attendance = Attendance::query()
            ->where('member_id', $member->id)
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
            ->paginate((int) ($filters['per_page'] ?? 10))
            ->withQueryString();

        return response()->json([
            'message' => 'Member attendance retrieved successfully.',
            'data' => [
                'data' => MemberAttendanceResource::collection($attendance->getCollection())->resolve(),
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
        $member = $this->authenticatedMember($request);

        if (! $member) {
            return response()->json(['message' => 'Member profile not found.'], 404);
        }

        $attendance = Attendance::query()
            ->where('member_id', $member->id)
            ->find($id);

        if (! $attendance) {
            return response()->json(['message' => 'Attendance record not found.'], 404);
        }

        return response()->json([
            'message' => 'Member attendance record retrieved successfully.',
            'data' => (new MemberAttendanceResource($attendance))->resolve(),
        ]);
    }

    private function authenticatedMember(Request $request): ?Member
    {
        return $request->user()->member()->first();
    }

    private function manilaDateBoundary(string $date, bool $endOfDay): Carbon
    {
        $boundary = Carbon::createFromFormat('Y-m-d', $date, self::REPORTING_TIMEZONE);

        return ($endOfDay ? $boundary->endOfDay() : $boundary->startOfDay())->utc();
    }
}
