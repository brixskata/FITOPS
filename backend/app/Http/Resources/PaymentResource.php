<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $membership = $this->membership;
        $member = $membership?->member;
        $plan = $membership?->membershipPlan;
        $membershipPrice = (float) ($membership?->price ?? 0);
        $paidTotal = (float) ($membership?->paid_total ?? 0);

        return [
            'id' => $this->id,
            'receipt_number' => $this->receipt_number,
            'membership' => $membership ? [
                'id' => $membership->id,
                'membership_number' => $membership->membership_number,
                'price' => $membership->price,
                'status' => $membership->status,
                'starts_at' => $membership->starts_at?->toISOString(),
                'ends_at' => $membership->ends_at?->toISOString(),
            ] : null,
            'member' => $member ? [
                'id' => $member->id,
                'name' => $member->user?->name,
                'email' => $member->user?->email,
            ] : null,
            'membership_plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
            ] : null,
            'amount' => $this->amount,
            'payment_method' => $this->payment_method,
            'reference_number' => $this->reference_number,
            'paid_at' => $this->paid_at?->toISOString(),
            'status' => $this->status,
            'notes' => $this->notes,
            'membership_price' => $membershipPrice,
            'paid_total' => $paidTotal,
            'outstanding_balance' => max($membershipPrice - $paidTotal, 0),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
