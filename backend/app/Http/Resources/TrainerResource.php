<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $assignedMembers = null;

        if ($this->relationLoaded('members')) {
            $assignedMembers = $this->members->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->user?->name,
                'email' => $member->user?->email,
                'status' => $member->status,
            ])->values()->all();
        }

        return [
            'id' => $this->id,
            'name' => $this->user?->name,
            'email' => $this->user?->email,
            'employee_code' => $this->employee_code,
            'specialization' => $this->specialization,
            'biography' => $this->bio,
            'experience_years' => $this->experience_years,
            'hire_date' => $this->hire_date?->toDateString(),
            'status' => $this->status,
            'assigned_members_count' => (int) ($this->assigned_members_count ?? $this->members_count ?? ($this->relationLoaded('members') ? $this->members->count() : 0)),
            ...($assignedMembers !== null ? ['assigned_members' => $assignedMembers] : []),
        ];
    }
}
