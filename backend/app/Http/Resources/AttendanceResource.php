<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $member = $this->whenLoaded('member');
        $recordedBy = $this->whenLoaded('recordedByUser');

        return [
            'id' => $this->id,
            'member' => $member ? [
                'id' => $member->id,
                'name' => $member->user?->name,
                'email' => $member->user?->email,
            ] : null,
            'checked_in_at' => $this->checked_in_at?->toISOString(),
            'checked_out_at' => $this->checked_out_at?->toISOString(),
            'session_state' => $this->checked_out_at === null ? 'open' : 'completed',
            'duration' => $this->durationInSeconds(),
            'recorded_by' => $recordedBy ? [
                'id' => $recordedBy->id,
                'name' => $recordedBy->name,
            ] : null,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function durationInSeconds(): ?int
    {
        if (! $this->checked_in_at || ! $this->checked_out_at) {
            return null;
        }

        return (int) $this->checked_in_at->diffInSeconds($this->checked_out_at, true);
    }
}
