<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'payment_method' => Str::lower((string) $this->input('payment_method', '')),
            'status' => Str::lower((string) $this->input('status', '')),
            'reference_number' => $this->filled('reference_number') ? trim((string) $this->input('reference_number')) : null,
        ]);
    }

    public function rules(): array
    {
        return [
            'membership_id' => ['required', 'integer', Rule::exists('memberships', 'id')],
            'amount' => ['required', 'numeric', 'gt:0', 'decimal:0,2', 'max:99999999.99'],
            'payment_method' => ['required', Rule::in(['cash', 'gcash', 'maya', 'card'])],
            // paid_at is non-nullable in the existing schema, including pending and failed records.
            'paid_at' => ['required', 'date'],
            'status' => ['required', Rule::in(['pending', 'paid', 'failed', 'refunded'])],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
