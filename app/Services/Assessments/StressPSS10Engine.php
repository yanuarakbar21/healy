<?php

namespace App\Services\Assessments;

class StressPSS10Engine implements AssessmentEngine
{
    public function type(): string
    {
        return 'stress_pss10';
    }

    public function calculate(array $data): AssessmentResult
    {
        $total = 0;
        $reverseItems = [4, 5, 7, 8];

        foreach (range(1, 10) as $i) {
            $value = (int) ($data["q{$i}"] ?? 2);
            $value = max(0, min(4, $value));
            if (in_array($i, $reverseItems)) {
                $value = 4 - $value;
            }
            $total += $value;
        }

        $category = match (true) {
            $total <= 13 => 'low',
            $total <= 26 => 'moderate',
            default => 'high',
        };

        $recommendations = [
            'low' => 'Your stress levels appear well-managed. Continue with your current coping strategies.',
            'moderate' => 'Consider incorporating stress management techniques such as mindfulness, deep breathing, or regular exercise.',
            'high' => 'We strongly recommend speaking with a mental health professional. In the meantime, practice relaxation techniques and reach out to your support network.',
        ];

        return new AssessmentResult($total, $category, $recommendations[$category]);
    }
}
