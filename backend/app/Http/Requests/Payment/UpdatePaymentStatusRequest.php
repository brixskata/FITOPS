<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdatePaymentStatusRequest extends FormRequest
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
            'status' => ['required', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'paid_at' => ['nullable', 'date', 'required_if:status,paid'],
        ];
    }
}
