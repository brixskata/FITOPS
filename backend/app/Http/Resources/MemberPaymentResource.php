<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberPaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $membership = $this->membership;
        $plan = $membership?->membershipPlan;

        return [
            'id' => $this->id,
            'receipt_number' => $this->receipt_number,
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'reference_number' => $this->reference_number,
            'paid_at' => $this->paid_at?->toISOString(),
            'status' => $this->status,
            'membership' => $membership ? [
                'membership_number' => $membership->membership_number,
                'plan_name' => $plan?->name,
                'status' => $membership->status,
                'starts_at' => $membership->starts_at?->toISOString(),
                'ends_at' => $membership->ends_at?->toISOString(),
            ] : null,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
