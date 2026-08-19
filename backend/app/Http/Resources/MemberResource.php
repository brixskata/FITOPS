<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class MemberResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $latestMembership = $this->whenLoaded('latestMembership');
        $membershipPlan = $latestMembership?->membershipPlan;
        $fullName = (string) ($this->user?->name ?? '');
        $trainer = $this->relationLoaded('trainer') ? $this->trainer : null;

        return [
            'id' => $this->id,
            'member_code' => $this->member_code,
            'name' => $fullName,
            'email' => $this->user?->email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'address' => $this->address,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'height' => $this->height,
            'weight' => $this->weight,
            'status' => $this->status,
            'status_label' => Str::headline((string) $this->status),
            'joined_at' => $this->joined_at?->toISOString(),
            'joined_date' => $this->joined_at?->format('M d, Y'),
            'avatar_initials' => $this->buildInitials($fullName),
            'trainer_id' => $this->trainer_id,
            'trainer' => $trainer ? [
                'id' => $trainer->id,
                'name' => $trainer->user?->name,
                'employee_code' => $trainer->employee_code,
                'status' => $trainer->status,
            ] : null,
            'membership' => [
                'id' => $latestMembership?->id,
                'number' => $latestMembership?->membership_number,
                'status' => $latestMembership?->status,
                'status_label' => $latestMembership?->status ? Str::headline((string) $latestMembership->status) : 'No Membership',
                'plan_name' => $membershipPlan?->name ?? 'No Membership',
                'starts_at' => $latestMembership?->starts_at?->toDateString(),
                'ends_at' => $latestMembership?->ends_at?->toDateString(),
                'price' => $latestMembership?->price,
            ],
        ];
    }

    protected function buildInitials(string $fullName): string
    {
        $initials = collect(explode(' ', trim($fullName)))
            ->filter()
            ->map(fn (string $part) => Str::upper(Str::substr($part, 0, 1)))
            ->take(2)
            ->implode('');

        return $initials !== '' ? $initials : 'M';
    }
}
