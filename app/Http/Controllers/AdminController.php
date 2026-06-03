<?php

namespace App\Http\Controllers;

use App\Models\HealthAssessment;
use App\Models\User;

class AdminController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();
        $totalAssessments = HealthAssessment::count();
        $assessmentsByType = HealthAssessment::selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        return inertia('Admin/Dashboard', [
            'totalUsers' => $totalUsers,
            'totalAssessments' => $totalAssessments,
            'assessmentsByType' => $assessmentsByType,
        ]);
    }
}
