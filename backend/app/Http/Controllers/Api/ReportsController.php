<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\ReportFiltersRequest;
use App\Models\Attendance;
use App\Models\Equipment;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class ReportsController extends Controller
{
    private const REPORTING_TIMEZONE = 'Asia/Manila';
    private const UPCOMING_EXPIRATION_DAYS = 30;

    public function overview(ReportFiltersRequest $request): JsonResponse
    {
        [$dateFrom, $dateTo, $dateFromUtc, $dateToUtc] = $this->reportingPeriod($request);
        $groupBy = $request->validated('group_by', 'day');

        return response()->json([
            'message' => 'Reports retrieved successfully.',
            'data' => [
                'period' => [
                    'date_from' => $dateFrom->toDateString(),
                    'date_to' => $dateTo->toDateString(),
                    'timezone' => self::REPORTING_TIMEZONE,
                    'group_by' => $groupBy,
                ],
                'summary' => $this->summary($dateFromUtc, $dateToUtc),
                'members' => $this->membersReport($dateFromUtc, $dateToUtc, $groupBy),
                'memberships' => $this->membershipsReport($dateFromUtc, $dateToUtc),
                'revenue' => $this->revenueReport($dateFromUtc, $dateToUtc, $groupBy),
                'attendance' => $this->attendanceReport($dateFromUtc, $dateToUtc, $groupBy, $dateFrom, $dateTo),
                'equipment' => $this->equipmentReport(),
            ],
        ]);
    }

    /**
     * The summary intentionally mixes current-state and period metrics:
     * member, active-membership, and equipment values describe the current
     * workspace; revenue and check-ins describe the selected period.
     *
     * @return array<string, int|string>
     */
    private function summary(Carbon $dateFromUtc, Carbon $dateToUtc): array
    {
        $equipmentMaintenance = $this->equipmentMaintenanceCounts();

        return [
            'total_members' => Member::query()->count(),
            'active_members' => Member::query()->where('status', 'active')->count(),
            'inactive_members' => Member::query()->where('status', 'inactive')->count(),
            'suspended_members' => Member::query()->where('status', 'suspended')->count(),
            'active_memberships' => Membership::query()
                ->where('status', 'active')
                ->where('ends_at', '>', now())
                ->count(),
            'paid_revenue' => $this->formatAmount(
                Payment::query()
                    ->where('status', 'paid')
                    ->whereBetween('paid_at', [$dateFromUtc, $dateToUtc])
                    ->sum('amount'),
            ),
            'total_check_ins' => Attendance::query()
                ->whereBetween('checked_in_at', [$dateFromUtc, $dateToUtc])
                ->count(),
            'equipment_needing_attention' => $equipmentMaintenance['equipment_needing_attention'],
        ];
    }

    /**
     * Member trends use the explicit joined_at registration timestamp. Null
     * joined_at records are intentionally excluded from the time series.
     *
     * @return array<string, mixed>
     */
    private function membersReport(Carbon $dateFromUtc, Carbon $dateToUtc, string $groupBy): array
    {
        return [
            'status_distribution' => $this->distribution(
                Member::query(),
                'status',
                ['active', 'inactive', 'suspended'],
            ),
            'new_members_over_time' => $this->timeSeries(
                Member::query()
                    ->whereNotNull('joined_at')
                    ->whereBetween('joined_at', [$dateFromUtc, $dateToUtc]),
                'joined_at',
                $groupBy,
                'COUNT(*)',
                'count',
            ),
        ];
    }

    /**
     * Membership cohort metrics use memberships whose starts_at falls within
     * the selected period. Status values use the current effective status;
     * active records whose ends_at has passed are treated as expired, matching
     * the existing MembershipController filtering behavior.
     *
     * @return array<string, mixed>
     */
    private function membershipsReport(Carbon $dateFromUtc, Carbon $dateToUtc): array
    {
        $periodMemberships = Membership::query()
            ->whereBetween('starts_at', [$dateFromUtc, $dateToUtc]);

        $byPlan = (clone $periodMemberships)
            ->join('membership_plans', 'membership_plans.id', '=', 'memberships.membership_plan_id')
            ->select([
                'membership_plans.id as plan_id',
                'membership_plans.name as plan_name',
            ])
            ->selectRaw('COUNT(memberships.id) as count')
            ->selectRaw('COALESCE(SUM(memberships.price), 0) as total_value')
            ->groupBy('membership_plans.id', 'membership_plans.name')
            ->orderByDesc('count')
            ->get()
            ->map(fn (object $row): array => [
                'plan_id' => (int) $row->plan_id,
                'plan_name' => $row->plan_name,
                'count' => (int) $row->count,
                'total_value' => $this->formatAmount($row->total_value),
            ])
            ->values()
            ->all();

        $upcomingUntil = now()->addDays(self::UPCOMING_EXPIRATION_DAYS);
        $upcomingQuery = Membership::query()
            ->join('members', 'members.id', '=', 'memberships.member_id')
            ->join('users', 'users.id', '=', 'members.user_id')
            ->where('memberships.status', 'active')
            ->whereBetween('memberships.ends_at', [now(), $upcomingUntil]);
        $upcomingExpirationCount = (clone $upcomingQuery)->count('memberships.id');
        $upcomingExpirations = $upcomingQuery
            ->select([
                'memberships.id',
                'memberships.membership_number',
                'memberships.ends_at',
                'users.name as member_name',
            ])
            ->orderBy('memberships.ends_at')
            ->limit(25)
            ->get()
            ->map(fn (object $row): array => [
                'id' => (int) $row->id,
                'membership_number' => $row->membership_number,
                'member_name' => $row->member_name,
                'ends_at' => Carbon::parse($row->ends_at)->utc()->toISOString(),
            ])
            ->values()
            ->all();

        return [
            'started_membership_status_distribution' => $this->startedMembershipStatusDistribution($periodMemberships),
            'started_memberships_by_plan' => $byPlan,
            'upcoming_expirations' => [
                'window_days' => self::UPCOMING_EXPIRATION_DAYS,
                'count' => $upcomingExpirationCount,
                'items' => $upcomingExpirations,
            ],
            'started_auto_renew_distribution' => $this->distribution(
                clone $periodMemberships,
                'auto_renew',
                [0, 1],
                fn (mixed $value): string => (int) $value === 1 ? 'enabled' : 'disabled',
            ),
        ];
    }

    /**
     * Payment lifecycle counts use created_at, which represents when the
     * payment record entered the system. Paid revenue and paid-payment trends
     * use paid_at and only include records whose current status is paid.
     *
     * @return array<string, mixed>
     */
    private function revenueReport(Carbon $dateFromUtc, Carbon $dateToUtc, string $groupBy): array
    {
        $periodLifecyclePayments = Payment::query()->whereBetween('created_at', [$dateFromUtc, $dateToUtc]);
        $periodPaidPayments = Payment::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$dateFromUtc, $dateToUtc]);

        $revenueByPlan = (clone $periodPaidPayments)
            ->join('memberships', 'memberships.id', '=', 'payments.membership_id')
            ->join('membership_plans', 'membership_plans.id', '=', 'memberships.membership_plan_id')
            ->where('payments.status', 'paid')
            ->select([
                'membership_plans.id as plan_id',
                'membership_plans.name as plan_name',
            ])
            ->selectRaw('COUNT(payments.id) as paid_payment_count')
            ->selectRaw('COALESCE(SUM(payments.amount), 0) as total_paid_revenue')
            ->groupBy('membership_plans.id', 'membership_plans.name')
            ->orderByDesc('total_paid_revenue')
            ->get()
            ->map(fn (object $row): array => [
                'plan_id' => (int) $row->plan_id,
                'plan_name' => $row->plan_name,
                'paid_payment_count' => (int) $row->paid_payment_count,
                'total_paid_revenue' => $this->formatAmount($row->total_paid_revenue),
            ])
            ->values()
            ->all();

        $paymentMethods = (clone $periodLifecyclePayments)
            ->select('payment_method')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('COALESCE(SUM(amount), 0) as total_amount')
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_amount")
            ->groupBy('payment_method')
            ->orderByDesc('count')
            ->get()
            ->map(fn (object $row): array => [
                'payment_method' => $row->payment_method,
                'count' => (int) $row->count,
                'total_amount' => $this->formatAmount($row->total_amount),
                'paid_amount' => $this->formatAmount($row->paid_amount),
            ])
            ->values()
            ->all();

        return [
            'total_paid_revenue' => $this->formatAmount(
                (clone $periodPaidPayments)->sum('amount'),
            ),
            'paid_payment_count' => (clone $periodPaidPayments)->count(),
            'pending_payment_count' => (clone $periodLifecyclePayments)->where('status', 'pending')->count(),
            'failed_payment_count' => (clone $periodLifecyclePayments)->where('status', 'failed')->count(),
            'refunded_payment_count' => (clone $periodLifecyclePayments)->where('status', 'refunded')->count(),
            'revenue_over_time' => $this->timeSeries(
                clone $periodPaidPayments,
                'paid_at',
                $groupBy,
                'COALESCE(SUM(amount), 0)',
                'amount',
                true,
            ),
            'payment_method_distribution' => $paymentMethods,
            'revenue_by_plan' => $revenueByPlan,
        ];
    }

    /**
     * Return effective status counts for memberships that started in the
     * selected period. The database does not keep status-change history.
     *
     * @param Builder<Membership> $query
     * @return array<string, int>
     */
    private function startedMembershipStatusDistribution(Builder $query): array
    {
        $row = $query
            ->selectRaw("SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled")
            ->selectRaw("SUM(CASE WHEN status = 'expired' OR (status = 'active' AND ends_at <= ?) THEN 1 ELSE 0 END) as expired", [now()])
            ->selectRaw("SUM(CASE WHEN status = 'active' AND ends_at > ? THEN 1 ELSE 0 END) as active", [now()])
            ->first();

        return [
            'active' => (int) ($row->active ?? 0),
            'expired' => (int) ($row->expired ?? 0),
            'cancelled' => (int) ($row->cancelled ?? 0),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function attendanceReport(
        Carbon $dateFromUtc,
        Carbon $dateToUtc,
        string $groupBy,
        Carbon $dateFrom,
        Carbon $dateTo,
    ): array {
        $periodAttendance = Attendance::query()
            ->whereBetween('checked_in_at', [$dateFromUtc, $dateToUtc]);

        $averageDuration = (clone $periodAttendance)
            ->whereNotNull('checked_in_at')
            ->whereNotNull('checked_out_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, checked_in_at, checked_out_at)) as average_duration_seconds')
            ->value('average_duration_seconds');

        $periodDays = max(1, $dateFrom->diffInDays($dateTo) + 1);
        $totalCheckIns = (clone $periodAttendance)->count();

        $peakHour = (clone $periodAttendance)
            ->selectRaw("HOUR(CONVERT_TZ(checked_in_at, '+00:00', '+08:00')) as reporting_hour")
            ->selectRaw('COUNT(*) as count')
            ->groupBy('reporting_hour')
            ->orderByDesc('count')
            ->orderBy('reporting_hour')
            ->first();

        return [
            'total_check_ins' => $totalCheckIns,
            'unique_members' => (clone $periodAttendance)->distinct('member_id')->count('member_id'),
            'average_check_ins_per_day' => round($totalCheckIns / $periodDays, 2),
            'average_completed_visit_duration_minutes' => $averageDuration === null
                ? null
                : round(((float) $averageDuration) / 60, 2),
            'open_sessions' => Attendance::query()->whereNull('checked_out_at')->count(),
            'attendance_over_time' => $this->timeSeries(
                clone $periodAttendance,
                'checked_in_at',
                $groupBy,
                'COUNT(*)',
                'count',
            ),
            'peak_check_in_hour' => $peakHour ? [
                'hour' => (int) $peakHour->reporting_hour,
                'count' => (int) $peakHour->count,
            ] : null,
        ];
    }

    /**
     * Equipment is a current-state report and intentionally ignores the
     * selected historical period. Maintenance status follows EquipmentResource:
     * under maintenance takes precedence, then no schedule, overdue, due soon,
     * and scheduled. There is no maintenance history in the current schema.
     *
     * @return array<string, mixed>
     */
    private function equipmentReport(): array
    {
        $maintenanceCounts = $this->equipmentMaintenanceCounts();

        return [
            'total_equipment' => Equipment::query()->count(),
            'category_distribution' => $this->distribution(
                Equipment::query(),
                'category',
                ['cardio', 'strength', 'free_weights', 'functional', 'accessories', 'other'],
            ),
            'condition_distribution' => $this->distribution(
                Equipment::query(),
                'condition',
                ['excellent', 'good', 'fair', 'poor', 'damaged'],
            ),
            'status_distribution' => $this->distribution(
                Equipment::query(),
                'status',
                ['operational', 'under_maintenance', 'out_of_service', 'retired'],
            ),
            'maintenance_status_distribution' => $maintenanceCounts['maintenance_status_distribution'],
            'equipment_needing_attention' => $maintenanceCounts['equipment_needing_attention'],
        ];
    }

    /**
     * @return array<string, int>
     */
    private function equipmentMaintenanceCounts(): array
    {
        $now = now();
        $dueSoonUntil = $now->copy()->addDays(Equipment::DUE_SOON_DAYS);
        $row = Equipment::query()
            ->selectRaw("SUM(CASE WHEN status = 'under_maintenance' THEN 1 ELSE 0 END) as under_maintenance")
            ->selectRaw("SUM(CASE WHEN status != 'under_maintenance' AND next_maintenance_at IS NULL THEN 1 ELSE 0 END) as none")
            ->selectRaw("SUM(CASE WHEN status != 'under_maintenance' AND next_maintenance_at IS NOT NULL AND next_maintenance_at < ? THEN 1 ELSE 0 END) as overdue", [$now])
            ->selectRaw("SUM(CASE WHEN status != 'under_maintenance' AND next_maintenance_at BETWEEN ? AND ? THEN 1 ELSE 0 END) as due_soon", [$now, $dueSoonUntil])
            ->selectRaw("SUM(CASE WHEN status != 'under_maintenance' AND next_maintenance_at > ? THEN 1 ELSE 0 END) as scheduled", [$dueSoonUntil])
            ->first();

        $distribution = [
            'none' => (int) ($row->none ?? 0),
            'scheduled' => (int) ($row->scheduled ?? 0),
            'due_soon' => (int) ($row->due_soon ?? 0),
            'overdue' => (int) ($row->overdue ?? 0),
            'under_maintenance' => (int) ($row->under_maintenance ?? 0),
        ];

        return [
            'maintenance_status_distribution' => $distribution,
            'equipment_needing_attention' => $distribution['due_soon']
                + $distribution['overdue']
                + $distribution['under_maintenance'],
        ];
    }

    /**
     * @param Builder<\Illuminate\Database\Eloquent\Model> $query
     * @param array<int, int|string> $values
     * @param callable(mixed): string|null $labeler
     * @return array<string, int>
     */
    private function distribution(Builder $query, string $column, array $values, ?callable $labeler = null): array
    {
        $rows = $query
            ->select($column)
            ->selectRaw('COUNT(*) as count')
            ->whereIn($column, $values)
            ->groupBy($column)
            ->get()
            ->keyBy($column);

        $result = [];
        foreach ($values as $value) {
            $key = $labeler ? $labeler($value) : (string) $value;
            $row = $rows->get($value);
            $result[$key] = $row ? (int) $row->count : 0;
        }

        return $result;
    }

    /**
     * @param Builder<\Illuminate\Database\Eloquent\Model> $query
     * @return array<int, array{period: string, count?: int, amount?: string}>
     */
    private function timeSeries(
        Builder $query,
        string $column,
        string $groupBy,
        string $aggregate,
        string $valueKey,
        bool $formatAsAmount = false,
    ): array {
        $expression = $groupBy === 'month'
            ? "DATE_FORMAT(CONVERT_TZ({$column}, '+00:00', '+08:00'), '%Y-%m')"
            : "DATE(CONVERT_TZ({$column}, '+00:00', '+08:00'))";

        return $query
            ->selectRaw("{$expression} as period")
            ->selectRaw("{$aggregate} as aggregate")
            ->groupBy('period')
            ->orderBy('period')
            ->get()
            ->map(function (object $row) use ($valueKey, $formatAsAmount): array {
                return [
                    'period' => (string) $row->period,
                    $valueKey => $formatAsAmount
                        ? $this->formatAmount($row->aggregate)
                        : (int) $row->aggregate,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array{0: Carbon, 1: Carbon, 2: Carbon, 3: Carbon}
     */
    private function reportingPeriod(ReportFiltersRequest $request): array
    {
        $today = Carbon::now(self::REPORTING_TIMEZONE);
        $dateFrom = $request->validated('date_from')
            ? Carbon::createFromFormat('Y-m-d', $request->validated('date_from'), self::REPORTING_TIMEZONE)->startOfDay()
            : $today->copy()->startOfMonth()->startOfDay();
        $dateTo = $request->validated('date_to')
            ? Carbon::createFromFormat('Y-m-d', $request->validated('date_to'), self::REPORTING_TIMEZONE)->endOfDay()
            : $today->copy()->endOfDay();

        return [$dateFrom, $dateTo, $dateFrom->copy()->utc(), $dateTo->copy()->utc()];
    }

    private function formatAmount(mixed $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
