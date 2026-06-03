<?php

namespace App\Http\Controllers;

use App\Models\HealthAssessment;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $assessments = HealthAssessment::where('user_id', $user->id)
            ->orderBy('taken_at', 'desc')
            ->get();

        $latest = $assessments->groupBy('type')->map(fn ($items) => $items->first());
        $historyByType = $assessments->groupBy('type');

        return inertia('Dashboard', [
            'profile' => $user->profile,
            'latestAssessments' => $latest,
            'historyByType' => $historyByType->map(fn ($items, $type) => [
                'type' => $type,
                'data' => $items->map(fn ($a) => [
                    'score' => $a->score,
                    'category' => $a->category,
                    'taken_at' => $a->taken_at,
                ])->values(),
            ])->values(),
        ]);
    }
}
