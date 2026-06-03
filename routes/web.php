<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProfileController;

Route::get('/', function () {
    return inertia('Welcome');
});

Route::get('/login', function () {
    return inertia('Auth/Login');
})->name('login');

Route::get('/register', function () {
    return inertia('Auth/Register');
})->name('register');

Route::post('/api/auth/callback', [AuthController::class, 'callback'])->withoutMiddleware([\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class]);
Route::get('/api/auth/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('supabase.auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments.index');
    Route::get('/assessments/bmi', [AssessmentController::class, 'bmi'])->name('assessments.bmi');
    Route::get('/assessments/diabetes', [AssessmentController::class, 'diabetes'])->name('assessments.diabetes');
    Route::get('/assessments/stress', [AssessmentController::class, 'stress'])->name('assessments.stress');
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::get('/admin', [\App\Http\Controllers\AdminController::class, 'index'])
        ->name('admin.dashboard');
});
