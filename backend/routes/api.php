<?php

use App\Http\Controllers\Api\MembershipPlanController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\MemberController;
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

Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::put('/members/{id}', [MemberController::class, 'update']);
    Route::delete('/members/{id}', [MemberController::class, 'destroy']);
});
