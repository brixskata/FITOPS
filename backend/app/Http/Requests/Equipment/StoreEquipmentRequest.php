<?php

namespace App\Http\Requests\Equipment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'asset_code' => $this->filled('asset_code') ? trim((string) $this->input('asset_code')) : null,
            'category' => Str::lower((string) $this->input('category', '')),
            'condition' => Str::lower((string) $this->input('condition', '')),
            'status' => Str::lower((string) $this->input('status', '')),
        ]);
    }

    /**
     * @return array<string, array<int, mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'asset_code' => ['nullable', 'string', 'max:50', Rule::unique('equipment', 'asset_code')],
            'category' => ['required', Rule::in(['cardio', 'strength', 'free_weights', 'functional', 'accessories', 'other'])],
            'brand' => ['nullable', 'string', 'max:255'],
            'model' => ['nullable', 'string', 'max:255'],
            'condition' => ['required', Rule::in(['excellent', 'good', 'fair', 'poor', 'damaged'])],
            'status' => ['required', Rule::in(['operational', 'under_maintenance', 'out_of_service', 'retired'])],
            'last_maintenance_at' => ['nullable', 'date'],
            'next_maintenance_at' => ['nullable', 'date', 'after_or_equal:last_maintenance_at'],
            'maintenance_notes' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
