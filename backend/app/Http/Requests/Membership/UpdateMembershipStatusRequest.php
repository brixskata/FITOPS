<?php

namespace App\Http\Requests\Membership;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateMembershipStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => Str::lower((string) $this->input('status', '')),
        ]);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['active', 'expired', 'cancelled'])],
        ];
    }
}
