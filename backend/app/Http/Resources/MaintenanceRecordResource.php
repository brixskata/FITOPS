<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaintenanceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $equipment = $this->resource->relationLoaded('equipment')
            ? $this->resource->equipment
            : null;

        return [
            'id' => $this->id,
            'equipment' => $equipment ? [
                'id' => $equipment->id,
                'name' => $equipment->name,
                'asset_code' => $equipment->asset_code,
                'brand' => $equipment->brand,
                'model' => $equipment->model,
            ] : null,
            'equipment_id' => $this->equipment_id,
            'maintenance_date' => $this->maintenance_date?->toDateString(),
            'maintenance_type' => $this->maintenance_type,
            'status' => $this->status,
            'cost' => $this->cost,
            'description' => $this->description,
            'notes' => $this->notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
