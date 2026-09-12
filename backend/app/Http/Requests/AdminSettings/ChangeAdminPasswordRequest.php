<?php

namespace App\Http\Requests\AdminSettings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ChangeAdminPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
            'user_id' => ['prohibited'],
            'id' => ['prohibited'],
            'role' => ['prohibited'],
            'permissions' => ['prohibited'],
            'status' => ['prohibited'],
            'token' => ['prohibited'],
            'email' => ['prohibited'],
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $allowed = ['current_password', 'password', 'password_confirmation'];

        foreach (array_diff(array_keys($this->all()), $allowed) as $field) {
            if (! array_key_exists($field, $this->rules())) {
                $validator->errors()->add($field, 'This field is not allowed.');
            }
        }
    }
}
