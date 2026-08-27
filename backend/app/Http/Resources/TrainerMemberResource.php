<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class TrainerMemberResource extends JsonResource
{
    /**
     * Transform the resource into a Trainer-safe Member representation.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $member = $this->resource;
        $latestMembership = $member->relationLoaded('latestMembership') ? $member->latestMembership : null;
        $membershipPlan = $latestMembership?->membershipPlan;
        $name = $member->user?->name;
        $latestCheckIn = $member->attendance_max_checked_in_at
            ? Carbon::parse($member->attendance_max_checked_in_at)->toISOString()
            : null;

        return [
            'id' => $member->id,
            'member_code' => $member->member_code,
            'name' => $name,
            'email' => $member->user?->email,
            'status' => $member->status,
            'membership' => $latestMembership ? [
                'id' => $latestMembership->id,
                'membership_number' => $latestMembership->membership_number,
                'status' => $this->effectiveMembershipStatus($latestMembership),
                'starts_at' => $latestMembership->starts_at?->toISOString(),
                'ends_at' => $latestMembership->ends_at?->toISOString(),
                'plan' => $membershipPlan ? [
                    'id' => $membershipPlan->id,
                    'name' => $membershipPlan->name,
                ] : null,
            ] : null,
            'attendance' => [
                'total_visits' => (int) ($member->attendance_count ?? 0),
                'latest_check_in' => $latestCheckIn,
            ],
        ];
    }

    private function effectiveMembershipStatus($membership): string
    {
        if ($membership->status === 'active' && $membership->ends_at?->isPast()) {
            return 'expired';
        }

        return (string) $membership->status;
    }
}
