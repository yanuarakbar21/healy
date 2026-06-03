<?php

namespace App\Http\Controllers;

use App\Models\HealthAssessment;
use App\Services\Assessments\AssessmentRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AssessmentController extends Controller
{
    public function index()
    {
        return inertia('Assessments/Index');
    }

    public function bmi()
    {
        $profile = auth()->user()->profile;
        return inertia('Assessments/BMI', [
            'profileHeight' => $profile->height_cm,
            'profileWeight' => $profile->weight_kg,
        ]);
    }

    public function diabetes()
    {
        return inertia('Assessments/Diabetes');
    }

    public function stress()
    {
        return inertia('Assessments/Stress');
    }

    public function calculateBMI(Request $request, AssessmentRegistry $registry)
    {
        $data = $request->validate([
            'height_cm' => 'required|numeric|min:50|max:300',
            'weight_kg' => 'required|numeric|min:10|max:500',
        ]);

        $engine = $registry->get('bmi');
        $result = $engine->calculate($data);

        $assessment = HealthAssessment::create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'type' => 'bmi',
            'score' => $result->score,
            'category' => $result->category,
            'responses' => $data,
            'recommendation' => $result->recommendation,
        ]);

        return response()->json($assessment);
    }

    public function calculateDiabetes(Request $request, AssessmentRegistry $registry)
    {
        $data = $request->validate([
            'age_group' => 'required|integer|min:1|max:5',
            'family_history' => 'required|in:yes,no',
            'activity' => 'required|integer|min:1|max:3',
            'diet' => 'required|integer|min:1|max:3',
            'waist' => 'required|integer|min:1|max:3',
            'hypertension' => 'required|in:yes,no',
            'high_blood_sugar' => 'required|in:yes,no',
        ]);

        $engine = $registry->get('diabetes_risk');
        $result = $engine->calculate($data);

        $assessment = HealthAssessment::create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'type' => 'diabetes_risk',
            'score' => $result->score,
            'category' => $result->category,
            'responses' => $data,
            'recommendation' => $result->recommendation,
        ]);

        return response()->json($assessment);
    }

    public function calculateStress(Request $request, AssessmentRegistry $registry)
    {
        $rules = [];
        foreach (range(1, 10) as $i) {
            $rules["q{$i}"] = 'required|integer|min:0|max:4';
        }

        $data = $request->validate($rules);

        $engine = $registry->get('stress_pss10');
        $result = $engine->calculate($data);

        $assessment = HealthAssessment::create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'type' => 'stress_pss10',
            'score' => $result->score,
            'category' => $result->category,
            'responses' => $data,
            'recommendation' => $result->recommendation,
        ]);

        return response()->json($assessment);
    }

    public function history()
    {
        $assessments = HealthAssessment::where('user_id', auth()->id())
            ->orderBy('taken_at', 'desc')
            ->get();

        return response()->json($assessments);
    }
}
