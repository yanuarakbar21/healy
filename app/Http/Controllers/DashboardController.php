<?php

namespace App\Http\Controllers;

use App\Models\HealthArticle;
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

        $latestTips = HealthArticle::orderBy('published_at', 'desc')
            ->take(6)
            ->get(['id', 'title', 'title_id', 'slug', 'description', 'description_id', 'image_url', 'source', 'source_url', 'category', 'published_at']);

        return inertia('Dashboard', [
            'profile' => $user->profile,
            'latestAssessments' => $latest,
            'latestTips' => $latestTips,
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
