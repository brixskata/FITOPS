<?php

namespace App\Http\Resources;

use App\Models\Equipment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class EquipmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Equipment $equipment */
        $equipment = $this->resource;

        return [
            'id' => $equipment->id,
            'name' => $equipment->name,
            'asset_code' => $equipment->asset_code,
            'category' => $equipment->category,
            'category_label' => Str::headline((string) $equipment->category),
            'brand' => $equipment->brand,
            'model' => $equipment->model,
            'condition' => $equipment->condition,
            'condition_label' => Str::headline((string) $equipment->condition),
            'status' => $equipment->status,
            'status_label' => Str::headline((string) $equipment->status),
            'last_maintenance_at' => $equipment->last_maintenance_at?->toISOString(),
            'next_maintenance_at' => $equipment->next_maintenance_at?->toISOString(),
            'maintenance_status' => $this->maintenanceStatus($equipment),
            'maintenance_notes' => $equipment->maintenance_notes,
            'notes' => $equipment->notes,
            'created_at' => $equipment->created_at?->toISOString(),
            'updated_at' => $equipment->updated_at?->toISOString(),
        ];
    }

    protected function maintenanceStatus(Equipment $equipment): string
    {
        if ($equipment->status === 'under_maintenance') {
            return 'under_maintenance';
        }

        if (! $equipment->next_maintenance_at) {
            return 'none';
        }

        $now = Carbon::now();

        if ($equipment->next_maintenance_at->isBefore($now)) {
            return 'overdue';
        }

        if ($equipment->next_maintenance_at->lessThanOrEqualTo($now->copy()->addDays(Equipment::DUE_SOON_DAYS))) {
            return 'due_soon';
        }

        return 'scheduled';
    }
}
