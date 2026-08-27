<?php

use App\Http\Controllers\Api\MembershipPlanController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AdminDashboardController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MemberAttendanceController;
use App\Http\Controllers\Api\MemberDashboardController;
use App\Http\Controllers\Api\MemberMembershipController;
use App\Http\Controllers\Api\MemberPaymentController;
use App\Http\Controllers\Api\MemberPasswordController;
use App\Http\Controllers\Api\MemberProfileController;
use App\Http\Controllers\Api\MembershipController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\TrainerAttendanceController;
use App\Http\Controllers\Api\TrainerMembersController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::middleware('role:Member')->group(function () {
        Route::get('/member/dashboard', [MemberDashboardController::class, 'show']);
        Route::get('/member/attendance', [MemberAttendanceController::class, 'index']);
        Route::get('/member/attendance/{id}', [MemberAttendanceController::class, 'show'])->whereNumber('id');
        Route::get('/member/membership', [MemberMembershipController::class, 'current']);
        Route::get('/member/memberships', [MemberMembershipController::class, 'index']);
        Route::get('/member/memberships/{id}', [MemberMembershipController::class, 'show'])->whereNumber('id');
        Route::get('/member/payments', [MemberPaymentController::class, 'index']);
        Route::get('/member/payments/{id}', [MemberPaymentController::class, 'show'])->whereNumber('id');
        Route::get('/member/profile', [MemberProfileController::class, 'show']);
        Route::patch('/member/profile', [MemberProfileController::class, 'update']);
        Route::patch('/member/password', [MemberPasswordController::class, 'update']);
    });

    Route::middleware('role:Trainer')->group(function () {
        Route::get('/trainer/dashboard', [TrainerController::class, 'dashboard']);
        Route::get('/trainer/profile', [TrainerController::class, 'profile']);
        Route::get('/trainer/attendance', [TrainerAttendanceController::class, 'index']);
        Route::get('/trainer/attendance/{id}', [TrainerAttendanceController::class, 'show'])->whereNumber('id');
        Route::get('/trainer/members', [TrainerMembersController::class, 'index']);
        Route::get('/trainer/members/{id}', [TrainerMembersController::class, 'show'])->whereNumber('id');
    });

    Route::get('/membership-plans', [MembershipPlanController::class, 'index']);
    Route::get('/membership-plans/{id}', [MembershipPlanController::class, 'show']);
    Route::post('/membership-plans', [MembershipPlanController::class, 'store']);
    Route::put('/membership-plans/{id}', [MembershipPlanController::class, 'update']);
    Route::delete('/membership-plans/{id}', [MembershipPlanController::class, 'destroy']);
});

Route::middleware(['auth:sanctum', 'role:Admin'])->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index']);
    Route::get('/admin/attendance', [AttendanceController::class, 'index']);
    Route::post('/admin/attendance/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('/admin/attendance/{id}/check-out', [AttendanceController::class, 'checkOut'])->whereNumber('id');
    Route::get('/admin/attendance/{id}', [AttendanceController::class, 'show'])->whereNumber('id');
    Route::get('/admin/payments', [PaymentController::class, 'index']);
    Route::get('/admin/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/admin/payments', [PaymentController::class, 'store']);
    Route::patch('/admin/payments/{id}/status', [PaymentController::class, 'updateStatus']);
    Route::get('/admin/memberships', [MembershipController::class, 'index']);
    Route::get('/admin/memberships/{id}', [MembershipController::class, 'show']);
    Route::post('/admin/memberships', [MembershipController::class, 'store']);
    Route::put('/admin/memberships/{id}', [MembershipController::class, 'update']);
    Route::patch('/admin/memberships/{id}/status', [MembershipController::class, 'updateStatus']);
    Route::post('/admin/memberships/{id}/renew', [MembershipController::class, 'renew']);
    Route::get('/admin/membership-plans', [MembershipPlanController::class, 'adminIndex']);
    Route::get('/admin/membership-plans/{id}', [MembershipPlanController::class, 'adminShow']);
    Route::post('/admin/membership-plans', [MembershipPlanController::class, 'adminStore']);
    Route::put('/admin/membership-plans/{id}', [MembershipPlanController::class, 'adminUpdate']);
    Route::patch('/admin/membership-plans/{id}/status', [MembershipPlanController::class, 'adminUpdateStatus']);
    Route::get('/admin/trainers', [TrainerController::class, 'adminIndex']);
    Route::get('/admin/trainers/{id}', [TrainerController::class, 'adminShow']);
    Route::post('/admin/trainers', [TrainerController::class, 'adminStore']);
    Route::put('/admin/trainers/{id}', [TrainerController::class, 'adminUpdate']);
    Route::patch('/admin/trainers/{id}/status', [TrainerController::class, 'adminUpdateStatus']);
    Route::get('/trainers', [TrainerController::class, 'index']);
    Route::get('/members', [MemberController::class, 'index']);
    Route::get('/members/{id}', [MemberController::class, 'show']);
    Route::post('/members', [MemberController::class, 'store']);
    Route::put('/members/{id}', [MemberController::class, 'update']);
    Route::delete('/members/{id}', [MemberController::class, 'destroy']);
});
