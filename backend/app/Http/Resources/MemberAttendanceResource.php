<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberAttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'checked_in_at' => $this->checked_in_at?->toISOString(),
            'checked_out_at' => $this->checked_out_at?->toISOString(),
            'session_state' => $this->checked_out_at === null ? 'open' : 'completed',
            'duration' => $this->durationInSeconds(),
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
