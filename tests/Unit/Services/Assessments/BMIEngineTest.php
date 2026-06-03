<?php

namespace Tests\Unit\Services\Assessments;

use App\Services\Assessments\BMIEngine;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class BMIEngineTest extends TestCase
{
    private BMIEngine $engine;

    protected function setUp(): void
    {
        parent::setUp();
        $this->engine = new BMIEngine();
    }

    #[Test]
    public function it_calculates_normal_bmi()
    {
        $result = $this->engine->calculate(['weight_kg' => 65, 'height_cm' => 170]);
        $this->assertEquals(22.5, $result->score);
        $this->assertEquals('normal', $result->category);
    }

    #[Test]
    public function it_calculates_underweight()
    {
        $result = $this->engine->calculate(['weight_kg' => 50, 'height_cm' => 175]);
        $this->assertEquals(16.3, $result->score);
        $this->assertEquals('underweight', $result->category);
    }

    #[Test]
    public function it_calculates_overweight()
    {
        $result = $this->engine->calculate(['weight_kg' => 85, 'height_cm' => 170]);
        $this->assertEquals(29.4, $result->score);
        $this->assertEquals('overweight', $result->category);
    }

    #[Test]
    public function it_calculates_obese()
    {
        $result = $this->engine->calculate(['weight_kg' => 120, 'height_cm' => 170]);
        $this->assertEquals(41.5, $result->score);
        $this->assertEquals('obese', $result->category);
    }

    #[Test]
    public function it_throws_on_invalid_input()
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->engine->calculate(['weight_kg' => 0, 'height_cm' => 170]);
    }
}
