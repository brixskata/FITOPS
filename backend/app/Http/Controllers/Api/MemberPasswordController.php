<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MemberPassword\ChangeMemberPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MemberPasswordController extends Controller
{
    public function update(ChangeMemberPasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->validated('current_password'), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'The current password is incorrect.',
            ]);
        }

        $user->password = Hash::make($request->validated('password'));
        $user->save();

        // Keep the current Sanctum session active; token revocation is not an
        // established password-change policy in this application.
        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }
}
