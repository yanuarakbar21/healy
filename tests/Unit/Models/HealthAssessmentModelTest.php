<?php

namespace Tests\Unit\Models;

use App\Models\HealthAssessment;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class HealthAssessmentModelTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_has_fillable_attributes()
    {
        $assessment = new HealthAssessment();
        $this->assertEquals([
            'id',
            'user_id',
            'type',
            'score',
            'category',
            'responses',
            'recommendation',
            'taken_at',
        ], $assessment->getFillable());
    }

    #[Test]
    public function it_uses_string_key()
    {
        $assessment = new HealthAssessment();
        $this->assertEquals('string', $assessment->getKeyType());
        $this->assertFalse($assessment->getIncrementing());
    }

    #[Test]
    public function it_has_no_timestamps()
    {
        $assessment = new HealthAssessment();
        $this->assertFalse($assessment->timestamps);
    }

    #[Test]
    public function it_casts_responses_to_array()
    {
        $assessment = new HealthAssessment();
        $this->assertTrue($assessment->hasCast('responses', 'array'));
    }

    #[Test]
    public function it_casts_score_to_decimal()
    {
        $assessment = new HealthAssessment();
        $this->assertNotNull($assessment->getCasts()['score']);
    }

    #[Test]
    public function it_casts_taken_at_to_datetime()
    {
        $assessment = new HealthAssessment();
        $this->assertTrue($assessment->hasCast('taken_at', 'datetime'));
    }

    #[Test]
    public function it_belongs_to_profile()
    {
        $user = User::factory()->create();
        Profile::create([
            'id' => $user->id,
            'full_name' => 'Test',
            'birth_date' => now()->subYears(25),
            'gender' => 'male',
        ]);

        $assessment = HealthAssessment::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'type' => 'bmi',
            'score' => 22.5,
            'category' => 'normal',
            'responses' => [],
            'recommendation' => 'ok',
        ]);

        $this->assertNotNull($assessment->profile);
        $this->assertEquals($user->id, $assessment->profile->id);
    }
}
