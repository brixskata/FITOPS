<?php

use App\Http\Controllers\Api\MembershipPlanController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/membership-plans', [MembershipPlanController::class, 'index']);
    Route::get('/membership-plans/{id}', [MembershipPlanController::class, 'show']);
    Route::post('/membership-plans', [MembershipPlanController::class, 'store']);
    Route::put('/membership-plans/{id}', [MembershipPlanController::class, 'update']);
    Route::delete('/membership-plans/{id}', [MembershipPlanController::class, 'destroy']);
});
