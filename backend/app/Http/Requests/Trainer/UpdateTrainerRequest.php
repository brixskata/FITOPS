<?php

namespace App\Http\Requests\Trainer;

use App\Models\Trainer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateTrainerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => Str::lower((string) $this->input('status', 'active')),
            'employee_code' => trim((string) $this->input('employee_code', '')),
        ]);
    }

    public function rules(): array
    {
        $trainer = Trainer::query()->with('user:id')->find($this->route('id'));

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($trainer?->user_id),
            ],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            'employee_code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('trainers', 'employee_code')->ignore($trainer?->id),
            ],
            'specialization' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'experience_years' => ['nullable', 'integer', 'min:0', 'max:100'],
            'hire_date' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ];
    }
}
