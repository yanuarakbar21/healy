<?php

namespace Tests\Unit\Services\Assessments;

use App\Services\Assessments\StressPSS10Engine;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class StressPSS10Test extends TestCase
{
    private StressPSS10Engine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new StressPSS10Engine();
    }

    #[Test]
    public function it_returns_low_stress_for_minimal_answers()
    {
        $data = ['q1' => 0, 'q2' => 0, 'q3' => 0, 'q4' => 4, 'q5' => 4, 'q6' => 0, 'q7' => 4, 'q8' => 4, 'q9' => 0, 'q10' => 0];
        $result = $this->engine->calculate($data);
        $this->assertEquals('low', $result->category);
    }

    #[Test]
    public function it_returns_high_stress_for_maximal_answers()
    {
        $data = ['q1' => 4, 'q2' => 4, 'q3' => 4, 'q4' => 0, 'q5' => 0, 'q6' => 4, 'q7' => 0, 'q8' => 0, 'q9' => 4, 'q10' => 4];
        $result = $this->engine->calculate($data);
        $this->assertEquals('high', $result->category);
    }

    #[Test]
    public function it_reverses_scores_correctly()
    {
        $data = ['q1' => 0, 'q2' => 0, 'q3' => 0, 'q4' => 4, 'q5' => 4, 'q6' => 0, 'q7' => 4, 'q8' => 4, 'q9' => 0, 'q10' => 0];
        $result = $this->engine->calculate($data);
        $this->assertEquals(0, $result->score);
        $this->assertEquals('low', $result->category);
    }

    #[Test]
    public function it_returns_type()
    {
        $this->assertEquals('stress_pss10', $this->engine->type());
    }
}
