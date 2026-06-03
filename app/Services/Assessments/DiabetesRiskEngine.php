<?php

namespace App\Services\Assessments;

class DiabetesRiskEngine implements AssessmentEngine
{
    public function type(): string
    {
        return 'diabetes_risk';
    }

    public function calculate(array $data): AssessmentResult
    {
        $score = 0;

        $score += match ((int) ($data['age_group'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, 4 => 15, 5 => 20, default => 0,
        };
        $score += ($data['family_history'] ?? 'no') === 'yes' ? 15 : 0;
        $score += match ((int) ($data['activity'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, default => 0,
        };
        $score += match ((int) ($data['diet'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, default => 0,
        };
        $score += match ((int) ($data['waist'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, default => 0,
        };
        $score += ($data['hypertension'] ?? 'no') === 'yes' ? 10 : 0;
        $score += ($data['high_blood_sugar'] ?? 'no') === 'yes' ? 15 : 0;

        $category = match (true) {
            $score < 30 => 'low',
            $score < 60 => 'moderate',
            default => 'high',
        };

        $recommendations = [
            'low' => 'Your risk appears low. Maintain a healthy lifestyle with regular exercise and balanced nutrition.',
            'moderate' => 'Consider lifestyle modifications: increase physical activity, reduce sugar intake, and monitor your weight. A check-up is recommended.',
            'high' => 'Please consult a healthcare provider for proper diabetes screening and personalized advice.',
        ];

        return new AssessmentResult($score, $category, $recommendations[$category]);
    }
}
