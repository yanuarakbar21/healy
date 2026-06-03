<?php

namespace Tests\Unit\Services\Assessments;

use App\Services\Assessments\DiabetesRiskEngine;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DiabetesRiskTest extends TestCase
{
    private DiabetesRiskEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new DiabetesRiskEngine();
    }

    #[Test]
    public function it_returns_low_risk_for_healthy_inputs()
    {
        $result = $this->engine->calculate([
            'age_group' => 1,
            'family_history' => 'no',
            'activity' => 1,
            'diet' => 1,
            'waist' => 1,
            'hypertension' => 'no',
            'high_blood_sugar' => 'no',
        ]);
        $this->assertEquals('low', $result->category);
        $this->assertLessThan(30, $result->score);
    }

    #[Test]
    public function it_returns_high_risk_for_high_inputs()
    {
        $result = $this->engine->calculate([
            'age_group' => 5,
            'family_history' => 'yes',
            'activity' => 3,
            'diet' => 3,
            'waist' => 3,
            'hypertension' => 'yes',
            'high_blood_sugar' => 'yes',
        ]);
        $this->assertEquals('high', $result->category);
        $this->assertGreaterThanOrEqual(60, $result->score);
    }

    #[Test]
    public function it_returns_type()
    {
        $this->assertEquals('diabetes_risk', $this->engine->type());
    }
}
