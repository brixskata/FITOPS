<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reports\ReportFiltersRequest;
use App\Models\Member;
use App\Models\Membership;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class ReportsController extends Controller
{
    private const REPORTING_TIMEZONE = 'Asia/Manila';

    public function overview(ReportFiltersRequest $request): JsonResponse
    {
        [$from, $to] = $this->period($request);
        $paid = Payment::query()->where('payments.status', 'paid')->whereBetween('payments.paid_at', [$from, $to]);
        $sales = (clone $paid)
            ->join('memberships', 'memberships.id', '=', 'payments.membership_id')
            ->join('membership_plans', 'membership_plans.id', '=', 'memberships.membership_plan_id')
            ->select(['membership_plans.id as plan_id', 'membership_plans.name as plan_name'])
            ->selectRaw('COUNT(payments.id) as memberships_sold')
            ->selectRaw('COALESCE(SUM(payments.amount), 0) as revenue')
            ->selectRaw('COALESCE(SUM(memberships.cost), 0) as cost')
            ->selectRaw('COALESCE(SUM(payments.amount - memberships.cost), 0) as profit')
            ->groupBy('membership_plans.id', 'membership_plans.name')
            ->orderBy('membership_plans.name')
            ->get()
            ->map(fn (object $row): array => [
                'plan_id' => (int) $row->plan_id,
                'plan_name' => $row->plan_name,
                'memberships_sold' => (int) $row->memberships_sold,
                'revenue' => $this->money($row->revenue),
                'cost' => $this->money($row->cost),
                'profit' => $this->money($row->profit),
            ])->values()->all();

        $revenue = (float) (clone $paid)->sum('payments.amount');
        $cost = (float) (clone $paid)->join('memberships', 'memberships.id', '=', 'payments.membership_id')->sum('memberships.cost');

        return response()->json([
            'message' => 'Reports retrieved successfully.',
            'data' => [
                'period' => [
                    'date_from' => $this->manilaDate($request->validated('date_from'), true),
                    'date_to' => $this->manilaDate($request->validated('date_to'), false),
                    'timezone' => self::REPORTING_TIMEZONE,
                ],
                'summary' => [
                    'total_revenue' => $this->money($revenue),
                    'total_cost' => $this->money($cost),
                    'gross_profit' => $this->money($revenue - $cost),
                    'total_members' => Member::query()->count(),
                ],
                'membership_sales' => $sales,
            ],
        ]);
    }

    private function period(ReportFiltersRequest $request): array
    {
        $today = Carbon::now(self::REPORTING_TIMEZONE);
        $from = $request->validated('date_from')
            ? Carbon::createFromFormat('Y-m-d', $request->validated('date_from'), self::REPORTING_TIMEZONE)->startOfDay()
            : $today->copy()->startOfMonth()->startOfDay();
        $to = $request->validated('date_to')
            ? Carbon::createFromFormat('Y-m-d', $request->validated('date_to'), self::REPORTING_TIMEZONE)->endOfDay()
            : $today->copy()->endOfDay();
        return [$from->utc(), $to->utc()];
    }

    private function manilaDate(?string $value, bool $from): string
    {
        if ($value) return $value;
        $today = Carbon::now(self::REPORTING_TIMEZONE);
        return ($from ? $today->copy()->startOfMonth() : $today)->toDateString();
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
