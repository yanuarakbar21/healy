<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProfileController;

Route::middleware('supabase.auth')->group(function () {
    Route::post('/assessments/bmi', [AssessmentController::class, 'calculateBMI']);
    Route::post('/assessments/diabetes', [AssessmentController::class, 'calculateDiabetes']);
    Route::post('/assessments/stress', [AssessmentController::class, 'calculateStress']);
    Route::get('/assessments/history', [AssessmentController::class, 'history']);
    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::get('/chat/history', [ChatController::class, 'history']);
    Route::put('/profile', [ProfileController::class, 'update']);
});
