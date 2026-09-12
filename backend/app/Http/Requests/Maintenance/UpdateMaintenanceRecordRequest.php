<?php

namespace App\Http\Requests\Maintenance;

use App\Models\Equipment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateMaintenanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'maintenance_type' => strtolower(trim((string) $this->input('maintenance_type', ''))),
            'status' => strtolower(trim((string) $this->input('status', ''))),
        ]);
    }

    public function rules(): array
    {
        return [
            'equipment_id' => ['required', 'integer', Rule::exists('equipment', 'id')],
            'maintenance_date' => ['required', 'date'],
            'maintenance_type' => ['required', 'string', 'max:50', Rule::in(['preventive', 'repair', 'inspection', 'cleaning', 'replacement', 'other'])],
            'description' => ['required', 'string', 'max:5000'],
            'cost' => ['required', 'numeric', 'min:0', 'decimal:0,2', 'max:99999999.99'],
            'status' => ['required', 'string', 'max:30', Rule::in(['scheduled', 'in_progress', 'completed', 'cancelled'])],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->hasAny(['equipment_id', 'maintenance_date', 'status'])) {
                return;
            }

            $equipment = Equipment::query()->find($this->integer('equipment_id'));
            $status = (string) $this->input('status');
            $date = Carbon::parse($this->input('maintenance_date'));

            if ($equipment?->status === 'retired' && in_array($status, ['scheduled', 'in_progress'], true)) {
                $validator->errors()->add('equipment_id', 'Retired equipment cannot have new scheduled or in-progress maintenance.');
            }

            if (in_array($status, ['completed', 'in_progress'], true) && $date->isFuture()) {
                $validator->errors()->add('maintenance_date', 'Completed or in-progress maintenance cannot use a future date.');
            }
        });
    }
}
