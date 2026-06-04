<?php

namespace Tests\Feature;

use App\Models\HealthAssessment;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AssessmentFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
    }

    private function authenticate(): void
    {
        $this->user = User::factory()->create();
        Profile::create([
            'id' => $this->user->id,
            'full_name' => 'Test',
            'birth_date' => now()->subYears(25),
            'gender' => 'male',
        ]);
        $this->actingAs($this->user);
    }

    #[Test]
    public function it_calculates_bmi_and_persists()
    {
        $this->authenticate();
        $response = $this->postJson('/api/assessments/bmi', [
            'height_cm' => 170,
            'weight_kg' => 65,
        ]);

        $response->assertOk()
            ->assertJson([
                'type' => 'bmi',
                'score' => 22.5,
                'category' => 'normal',
            ]);

        $this->assertDatabaseHas('health_assessments', [
            'user_id' => $this->user->id,
            'type' => 'bmi',
            'score' => 22.5,
            'category' => 'normal',
        ]);
    }

    #[Test]
    public function it_validates_bmi_input()
    {
        $this->authenticate();
        $response = $this->postJson('/api/assessments/bmi', [
            'height_cm' => 0,
            'weight_kg' => 5,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['height_cm', 'weight_kg']);
    }

    #[Test]
    public function it_calculates_diabetes_risk_and_persists()
    {
        $this->authenticate();
        $response = $this->postJson('/api/assessments/diabetes', [
            'age_group' => 1,
            'family_history' => 'no',
            'activity' => 1,
            'diet' => 1,
            'waist' => 1,
            'hypertension' => 'no',
            'high_blood_sugar' => 'no',
        ]);

        $response->assertOk()
            ->assertJsonPath('type', 'diabetes_risk')
            ->assertJsonPath('category', 'low');

        $this->assertDatabaseHas('health_assessments', [
            'user_id' => $this->user->id,
            'type' => 'diabetes_risk',
            'category' => 'low',
        ]);
    }

    #[Test]
    public function it_validates_diabetes_input()
    {
        $this->authenticate();
        $response = $this->postJson('/api/assessments/diabetes', [
            'age_group' => 99,
            'family_history' => 'maybe',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['age_group', 'family_history']);
    }

    #[Test]
    public function it_calculates_stress_and_persists()
    {
        $this->authenticate();
        $response = $this->postJson('/api/assessments/stress', [
            'q1' => 1, 'q2' => 1, 'q3' => 1, 'q4' => 3, 'q5' => 3,
            'q6' => 1, 'q7' => 3, 'q8' => 3, 'q9' => 1, 'q10' => 1,
        ]);

        $response->assertOk()
            ->assertJsonPath('type', 'stress_pss10');

        $this->assertDatabaseHas('health_assessments', [
            'user_id' => $this->user->id,
            'type' => 'stress_pss10',
        ]);
    }

    #[Test]
    public function it_validates_stress_input()
    {
        $this->authenticate();
        $response = $this->postJson('/api/assessments/stress', [
            'q1' => 99,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['q1', 'q2']);
    }

    #[Test]
    public function it_returns_assessment_history()
    {
        $this->authenticate();
        HealthAssessment::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'bmi',
            'score' => 22.5,
            'category' => 'normal',
            'responses' => ['height_cm' => 170, 'weight_kg' => 65],
            'recommendation' => 'Keep it up!',
        ]);

        $response = $this->getJson('/api/assessments/history');

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.type', 'bmi');
    }

    #[Test]
    public function it_requires_authentication()
    {
        $this->postJson('/api/assessments/bmi', [
            'height_cm' => 170,
            'weight_kg' => 65,
        ])->assertUnauthorized();
    }
}
