<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;

class AdminDashboardController extends Controller
{
    private const REPORTING_TIMEZONE = 'Asia/Manila';

    public function index(): JsonResponse
    {
        $today = Carbon::now(self::REPORTING_TIMEZONE);
        $todayStart = $today->copy()->startOfDay()->utc();
        $todayEnd = $today->copy()->endOfDay()->utc();
        $monthStart = $today->copy()->startOfMonth()->utc();
        $monthEnd = $today->copy()->endOfMonth()->utc();
        $todayAttendance = $this->attendanceBetween($todayStart, $todayEnd);
        $thisMonthAttendance = $this->attendanceBetween($monthStart, $monthEnd);

        $membershipStatistics = Membership::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->whereIn('status', ['active', 'expired', 'cancelled'])
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $paymentStatistics = Payment::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->whereIn('status', ['paid', 'pending', 'failed', 'refunded'])
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        $averageDuration = Attendance::query()
            ->whereNotNull('checked_in_at')
            ->whereNotNull('checked_out_at')
            ->selectRaw('AVG(TIMESTAMPDIFF(SECOND, checked_in_at, checked_out_at)) as average_duration')
            ->value('average_duration');

        return response()->json([
            'message' => 'Admin dashboard retrieved successfully.',
            'data' => [
                'summary' => [
                    'total_members' => Member::query()->count(),
                    'active_members' => Member::query()->where('status', 'active')->count(),
                    'active_memberships' => Membership::query()->where('status', 'active')->count(),
                    'today_attendance' => $todayAttendance,
                    'currently_checked_in' => Attendance::query()->whereNull('checked_out_at')->count(),
                    'paid_revenue' => $this->formatAmount(Payment::query()->where('status', 'paid')->sum('amount')),
                ],
                'membership_statistics' => [
                    'active' => (int) ($membershipStatistics['active'] ?? 0),
                    'expired' => (int) ($membershipStatistics['expired'] ?? 0),
                    'cancelled' => (int) ($membershipStatistics['cancelled'] ?? 0),
                ],
                'attendance_statistics' => [
                    'today' => $todayAttendance,
                    'this_month' => $thisMonthAttendance,
                    'average_visit_duration_seconds' => $averageDuration === null
                        ? null
                        : round((float) $averageDuration, 2),
                ],
                'payment_statistics' => [
                    'paid_count' => (int) ($paymentStatistics['paid'] ?? 0),
                    'pending_count' => (int) ($paymentStatistics['pending'] ?? 0),
                    'failed_count' => (int) ($paymentStatistics['failed'] ?? 0),
                    'refunded_count' => (int) ($paymentStatistics['refunded'] ?? 0),
                ],
                'recent_members' => $this->recentMembers(),
                'recent_payments' => $this->recentPayments(),
                'trends' => $this->trends($today),
                'reporting_timezone' => self::REPORTING_TIMEZONE,
            ],
        ]);
    }

    private function attendanceBetween(Carbon $start, Carbon $end): int
    {
        return Attendance::query()
            ->whereBetween('checked_in_at', [$start, $end])
            ->count();
    }

    private function recentMembers(): array
    {
        return Member::query()
            ->select(['id', 'user_id', 'member_code', 'status', 'created_at'])
            ->with('user:id,name,email')
            ->latest('created_at')
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Member $member): array => [
                'id' => $member->id,
                'name' => $member->user?->name,
                'email' => $member->user?->email,
                'member_code' => $member->member_code,
                'status' => $member->status,
                'created_at' => $member->created_at?->toISOString(),
            ])
            ->values()
            ->all();
    }

    private function recentPayments(): array
    {
        return Payment::query()
            ->select(['id', 'receipt_number', 'amount', 'payment_method', 'status', 'paid_at'])
            ->latest('paid_at')
            ->latest('id')
            ->limit(5)
            ->get()
            ->map(fn (Payment $payment): array => [
                'id' => $payment->id,
                'receipt_number' => $payment->receipt_number,
                'amount' => $this->formatAmount($payment->amount),
                'payment_method' => $payment->payment_method,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at?->toISOString(),
            ])
            ->values()
            ->all();
    }

    private function trends(Carbon $today): array
    {
        $firstDay = $today->copy()->subDays(6)->startOfDay();
        $lastDay = $today->copy()->endOfDay();
        $startUtc = $firstDay->copy()->utc();
        $endUtc = $lastDay->copy()->utc();

        $attendanceByDate = Attendance::query()
            ->whereBetween('checked_in_at', [$startUtc, $endUtc])
            ->selectRaw("DATE(CONVERT_TZ(checked_in_at, '+00:00', '+08:00')) as reporting_date, COUNT(*) as aggregate")
            ->groupBy('reporting_date')
            ->pluck('aggregate', 'reporting_date');

        $revenueByDate = Payment::query()
            ->where('status', 'paid')
            ->whereBetween('paid_at', [$startUtc, $endUtc])
            ->selectRaw("DATE(CONVERT_TZ(paid_at, '+00:00', '+08:00')) as reporting_date, SUM(amount) as aggregate")
            ->groupBy('reporting_date')
            ->pluck('aggregate', 'reporting_date');

        $dates = Collection::times(7, fn (int $offset): string => $firstDay->copy()->addDays($offset - 1)->format('Y-m-d'));

        return [
            'attendance' => $dates->map(fn (string $date): array => [
                'date' => $date,
                'count' => (int) ($attendanceByDate[$date] ?? 0),
            ])->values()->all(),
            'revenue' => $dates->map(fn (string $date): array => [
                'date' => $date,
                'amount' => $this->formatAmount($revenueByDate[$date] ?? 0),
            ])->values()->all(),
        ];
    }

    private function formatAmount(mixed $amount): string
    {
        return number_format((float) $amount, 2, '.', '');
    }
}
