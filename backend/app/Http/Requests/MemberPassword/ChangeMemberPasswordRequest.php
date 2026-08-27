<?php

namespace App\Http\Requests\MemberPassword;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ChangeMemberPasswordRequest extends FormRequest
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
            'member_id' => ['prohibited'],
            'trainer_id' => ['prohibited'],
            'email' => ['prohibited'],
            'role' => ['prohibited'],
            'status' => ['prohibited'],
            'token' => ['prohibited'],
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
