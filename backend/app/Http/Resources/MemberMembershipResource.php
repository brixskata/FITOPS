<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class MemberMembershipResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $plan = $this->whenLoaded('membershipPlan');

        return [
            'id' => $this->id,
            'membership_number' => $this->membership_number,
            'status' => $this->effectiveStatus(),
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'price' => $this->price,
            'days_remaining' => $this->daysRemaining(),
            'membership_plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'duration_days' => $plan->duration_days,
                'price' => $plan->price,
            ] : null,
            'auto_renew' => (bool) $this->auto_renew,
        ];
    }

    private function effectiveStatus(): string
    {
        if ($this->status === 'active' && $this->ends_at?->isPast()) {
            return 'expired';
        }

        return (string) $this->status;
    }

    private function daysRemaining(): int
    {
        if (! $this->ends_at) {
            return 0;
        }

        return max(0, Carbon::today()->diffInDays(Carbon::parse($this->ends_at), false));
    }
}
