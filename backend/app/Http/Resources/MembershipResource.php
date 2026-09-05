<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $member = $this->whenLoaded('member');
        $plan = $this->whenLoaded('membershipPlan');
        $status = $this->effectiveStatus();

        return [
            'id' => $this->id,
            'membership_number' => $this->membership_number,
            'member' => $member ? [
                'id' => $member->id,
                'name' => $member->user?->name,
                'email' => $member->user?->email,
            ] : null,
            'membership_plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'duration_days' => $plan->duration_days,
                'price' => $plan->price,
            ] : null,
            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'price' => $this->price,
            'cost' => $this->cost,
            'status' => $status,
            'auto_renew' => (bool) $this->auto_renew,
            'payments_count' => (int) ($this->payments_count ?? 0),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function effectiveStatus(): string
    {
        if ($this->status === 'active' && $this->ends_at?->isPast()) {
            return 'expired';
        }

        return $this->status;
    }
}
