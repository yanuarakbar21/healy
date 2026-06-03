<?php

namespace App\Services\Assessments;

class BMIEngine implements AssessmentEngine
{
    public function type(): string
    {
        return 'bmi';
    }

    public function calculate(array $data): AssessmentResult
    {
        $weight = (float) ($data['weight_kg'] ?? 0);
        $heightCm = (float) ($data['height_cm'] ?? 0);

        if ($weight <= 0 || $heightCm <= 0) {
            throw new \InvalidArgumentException('Weight and height must be positive values.');
        }

        $heightM = $heightCm / 100;
        $bmi = round($weight / ($heightM * $heightM), 1);

        $category = match (true) {
            $bmi < 18.5 => 'underweight',
            $bmi < 25.0 => 'normal',
            $bmi < 30.0 => 'overweight',
            default => 'obese',
        };

        $recommendations = [
            'underweight' => 'Consider consulting a nutritionist to develop a healthy weight gain plan. Focus on nutrient-dense foods.',
            'normal' => 'Great job maintaining a healthy weight! Continue with a balanced diet and regular physical activity.',
            'overweight' => 'Consider increasing physical activity and reviewing your diet. A 5-10% weight reduction can significantly improve health.',
            'obese' => 'We recommend consulting a healthcare provider for a personalized weight management plan.',
        ];

        return new AssessmentResult($bmi, $category, $recommendations[$category]);
    }
}
