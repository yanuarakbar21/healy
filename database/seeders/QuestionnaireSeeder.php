<?php

namespace Database\Seeders;

use App\Models\QuestionnaireTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class QuestionnaireSeeder extends Seeder
{
    public function run(): void
    {
        QuestionnaireTemplate::create([
            'id' => Str::uuid(),
            'type' => 'diabetes_risk',
            'questions' => [
                ['id' => 'age_group', 'text' => 'What is your age group?', 'options' => [1 => 'Under 25', 2 => '25-34', 3 => '35-44', 4 => '45-54', 5 => '55 or older']],
                ['id' => 'family_history', 'text' => 'Do you have a family history of diabetes?', 'options' => ['no' => 'No', 'yes' => 'Yes']],
                ['id' => 'activity', 'text' => 'How would you describe your physical activity level?', 'options' => [1 => 'Active (regular exercise)', 2 => 'Moderate (occasional)', 3 => 'Sedentary (rarely)']],
                ['id' => 'diet', 'text' => 'How would you describe your diet?', 'options' => [1 => 'Balanced with plenty of vegetables', 2 => 'Moderate', 3 => 'High in sugar/processed foods']],
                ['id' => 'waist', 'text' => 'How would you describe your waist circumference?', 'options' => [1 => 'Healthy range', 2 => 'Slightly elevated', 3 => 'Significantly elevated']],
                ['id' => 'hypertension', 'text' => 'Do you have high blood pressure?', 'options' => ['no' => 'No', 'yes' => 'Yes']],
                ['id' => 'high_blood_sugar', 'text' => 'Have you ever been told you have high blood sugar?', 'options' => ['no' => 'No', 'yes' => 'Yes']],
            ],
            'scoring_rules' => [
                'max_score' => 100,
                'thresholds' => ['low' => 30, 'moderate' => 60, 'high' => 100],
            ],
            'active' => true,
        ]);

        QuestionnaireTemplate::create([
            'id' => Str::uuid(),
            'type' => 'stress_pss10',
            'questions' => [
                ['id' => 'q1', 'text' => 'In the last month, how often have you been upset because of something that happened unexpectedly?'],
                ['id' => 'q2', 'text' => 'In the last month, how often have you felt that you were unable to control the important things in your life?'],
                ['id' => 'q3', 'text' => 'In the last month, how often have you felt nervous and stressed?'],
                ['id' => 'q4', 'text' => 'In the last month, how often have you felt confident about your ability to handle your personal problems?'],
                ['id' => 'q5', 'text' => 'In the last month, how often have you felt that things were going your way?'],
                ['id' => 'q6', 'text' => 'In the last month, how often have you found that you could not cope with all the things that you had to do?'],
                ['id' => 'q7', 'text' => 'In the last month, how often have you been able to control irritations in your life?'],
                ['id' => 'q8', 'text' => 'In the last month, how often have you felt that you were on top of things?'],
                ['id' => 'q9', 'text' => 'In the last month, how often have you been angered because of things that happened outside of your control?'],
                ['id' => 'q10', 'text' => 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?'],
            ],
            'scoring_rules' => [
                'max_score' => 40,
                'reverse_items' => [4, 5, 7, 8],
                'thresholds' => ['low' => 13, 'moderate' => 26, 'high' => 40],
            ],
            'active' => true,
        ]);
    }
}
