<?php

namespace App\Http\Requests\AdminSettings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAdminProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],
            'id' => ['prohibited'],
            'role' => ['prohibited'],
            'permissions' => ['prohibited'],
            'status' => ['prohibited'],
            'password' => ['prohibited'],
            'token' => ['prohibited'],
            'email_verified_at' => ['prohibited'],
        ];
    }

    protected function withValidator(Validator $validator): void
    {
        $allowed = ['name', 'email'];

        foreach (array_diff(array_keys($this->all()), $allowed) as $field) {
            if (! array_key_exists($field, $this->rules())) {
                $validator->errors()->add($field, 'This field is not allowed.');
            }
        }
    }
}
