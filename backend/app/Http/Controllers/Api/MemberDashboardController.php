<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MemberDashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $member = Member::query()
            ->with([
                'user:id,name,email,updated_at',
                'latestMembership.membershipPlan:id,name',
                'memberships' => fn ($query) => $query
                    ->select('id', 'member_id', 'membership_plan_id', 'membership_number', 'starts_at', 'ends_at', 'price', 'status')
                    ->with([
                        'membershipPlan:id,name',
                        'payments' => fn ($paymentQuery) => $paymentQuery
                            ->select('id', 'membership_id', 'receipt_number', 'amount', 'payment_method', 'paid_at', 'status')
                            ->latest('paid_at'),
                    ]),
                'attendance' => fn ($query) => $query
                    ->select('id', 'member_id', 'checked_in_at', 'checked_out_at', 'created_at')
                    ->latest('checked_in_at'),
            ])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $member) {
            return response()->json([
                'message' => 'Member profile not found.',
            ], 404);
        }

        $membership = $member->latestMembership;
        $attendance = $member->attendance;
        $payments = $member->memberships
            ->flatMap(fn ($item) => $item->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'date' => $payment->paid_at?->format('M d, Y'),
                'description' => ($item->membershipPlan?->name ?? 'Membership') . ' payment',
                'method' => Str::headline((string) $payment->payment_method),
                'amount' => (float) $payment->amount,
                'status' => Str::headline((string) $payment->status),
            ]))
            ->sortByDesc(fn (array $payment) => $payment['id'])
            ->values();

        $monthlyAttendance = $attendance->filter(
            fn ($record) => $record->checked_in_at?->isCurrentMonth()
        )->count();
        $totalVisits = $attendance->count();
        $trainingHours = $attendance->sum(function ($record): float {
            if (! $record->checked_in_at || ! $record->checked_out_at) {
                return 0;
            }

            return $record->checked_in_at->diffInMinutes($record->checked_out_at) / 60;
        });

        $daysRemaining = $membership?->ends_at
            ? max(0, Carbon::today()->diffInDays(Carbon::parse($membership->ends_at), false))
            : 0;
        $membershipProgress = $this->membershipProgress($membership);

        return response()->json([
            'message' => 'Member dashboard retrieved successfully.',
            'data' => [
                'profile' => [
                    'name' => $member->user?->name,
                    'email' => $member->user?->email,
                    'member_code' => $member->member_code,
                    'phone' => $member->phone,
                    'gender' => $member->gender,
                    'date_of_birth' => $member->date_of_birth?->toDateString(),
                    'address' => $member->address,
                    'status' => $member->status,
                    'joined_at' => $member->joined_at?->format('F d, Y'),
                    'avatar_initials' => $this->initials($member->user?->name),
                ],
                'membership' => $membership ? [
                    'plan' => $membership->membershipPlan?->name,
                    'status' => Str::headline((string) $membership->status),
                    'membership_number' => $membership->membership_number,
                    'started' => $membership->starts_at?->format('F d, Y'),
                    'renewal_date' => $membership->ends_at?->format('F d, Y'),
                    'days_remaining' => $daysRemaining,
                    'progress' => $membershipProgress,
                ] : null,
                'attendance' => [
                    'total_visits' => $totalVisits,
                    'monthly_visits' => $monthlyAttendance,
                    'current_streak' => $this->currentStreak($attendance),
                    'training_hours' => round($trainingHours, 1),
                ],
                'payments' => $payments->take(5)->values(),
                'achievements' => $this->achievements($attendance),
                'activity' => $this->activity($attendance, $payments, $member),
                'schedule' => [],
            ],
        ]);
    }

    protected function membershipProgress($membership): int
    {
        if (! $membership || ! $membership->starts_at || ! $membership->ends_at) {
            return 0;
        }

        $start = Carbon::parse($membership->starts_at);
        $end = Carbon::parse($membership->ends_at);
        $totalDays = max(1, $start->diffInDays($end));
        $elapsedDays = min($totalDays, max(0, $start->diffInDays(Carbon::today(), false)));

        return (int) round(($elapsedDays / $totalDays) * 100);
    }

    protected function currentStreak($attendance): int
    {
        $dates = $attendance
            ->map(fn ($record) => $record->checked_in_at?->toDateString())
            ->filter()
            ->unique()
            ->sortDesc()
            ->values();

        if ($dates->isEmpty()) {
            return 0;
        }

        $cursor = Carbon::today();
        if ($dates->first() !== $cursor->toDateString()) {
            $cursor->subDay();
            if ($dates->first() !== $cursor->toDateString()) {
                return 0;
            }
        }

        $streak = 0;
        foreach ($dates as $date) {
            if ($date !== $cursor->toDateString()) {
                break;
            }
            $streak++;
            $cursor->subDay();
        }

        return $streak;
    }

    protected function achievements($attendance): array
    {
        $first = $attendance->last();
        $totalVisits = $attendance->count();
        $streak = $this->currentStreak($attendance);
        $earlyBird = $attendance->contains(fn ($record) => $record->checked_in_at?->hour < 8);

        return [
            ['label' => 'First Workout', 'detail' => $first ? 'Unlocked ' . $first->checked_in_at->format('M d') : 'Complete your first visit', 'icon' => 'target', 'unlocked' => $totalVisits > 0],
            ['label' => '7-Day Streak', 'detail' => $streak >= 7 ? 'Unlocked today' : max(0, 7 - $streak) . ' days to unlock', 'icon' => 'flame', 'unlocked' => $streak >= 7],
            ['label' => '30 Visits', 'detail' => $totalVisits >= 30 ? 'Unlocked' : max(0, 30 - $totalVisits) . ' visits to unlock', 'icon' => 'trophy', 'unlocked' => $totalVisits >= 30],
            ['label' => 'Early Bird', 'detail' => $earlyBird ? 'Unlocked' : 'Check in before 8 AM', 'icon' => 'sunrise', 'unlocked' => $earlyBird],
        ];
    }

    protected function activity($attendance, $payments, Member $member): array
    {
        $items = $attendance->take(3)->map(fn ($record) => [
            'title' => 'Checked in',
            'detail' => $record->checked_in_at?->format('M d, Y · g:i A'),
            'icon' => 'check',
            'date' => $record->checked_in_at?->timestamp ?? 0,
        ])->all();

        foreach ($payments->take(2) as $payment) {
            $items[] = [
                'title' => 'Payment recorded',
                'detail' => $payment['description'] . ' · ' . $payment['date'],
                'icon' => 'card',
                'date' => $payment['id'],
            ];
        }

        $items[] = [
            'title' => 'Profile updated',
            'detail' => 'Personal details · ' . $member->updated_at?->format('M d, Y'),
            'icon' => 'user',
            'date' => $member->updated_at?->timestamp ?? 0,
        ];

        return collect($items)->sortByDesc('date')->take(4)->map(fn ($item) => collect($item)->except('date')->all())->values()->all();
    }

    protected function initials(?string $name): string
    {
        return collect(explode(' ', trim((string) $name)))
            ->filter()
            ->map(fn (string $part) => Str::upper(Str::substr($part, 0, 1)))
            ->take(2)
            ->implode('') ?: 'M';
    }
}
