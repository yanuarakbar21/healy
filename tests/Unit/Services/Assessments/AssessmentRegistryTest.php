<?php

namespace Tests\Unit\Services\Assessments;

use App\Services\Assessments\AssessmentEngine;
use App\Services\Assessments\AssessmentRegistry;
use App\Services\Assessments\AssessmentResult;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AssessmentRegistryTest extends TestCase
{
    #[Test]
    public function it_registers_and_retrieves_an_engine()
    {
        $registry = new AssessmentRegistry();
        $engine = new class implements AssessmentEngine {
            public function type(): string { return 'test_engine'; }
            public function calculate(array $data): AssessmentResult
            {
                return new AssessmentResult(10, 'low', 'ok');
            }
        };

        $registry->register($engine);

        $this->assertSame($engine, $registry->get('test_engine'));
    }

    #[Test]
    public function it_returns_all_registered_engines()
    {
        $registry = new AssessmentRegistry();
        $engineA = new class implements AssessmentEngine {
            public function type(): string { return 'engine_a'; }
            public function calculate(array $data): AssessmentResult
            {
                return new AssessmentResult(1, 'low', 'a');
            }
        };
        $engineB = new class implements AssessmentEngine {
            public function type(): string { return 'engine_b'; }
            public function calculate(array $data): AssessmentResult
            {
                return new AssessmentResult(2, 'high', 'b');
            }
        };

        $registry->register($engineA);
        $registry->register($engineB);

        $all = $registry->all();
        $this->assertCount(2, $all);
        $this->assertArrayHasKey('engine_a', $all);
        $this->assertArrayHasKey('engine_b', $all);
    }

    #[Test]
    public function it_throws_for_unknown_type()
    {
        $registry = new AssessmentRegistry();

        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Unknown assessment type: nonexistent');

        $registry->get('nonexistent');
    }

    #[Test]
    public function it_overwrites_existing_engine_on_re_register()
    {
        $registry = new AssessmentRegistry();
        $first = new class implements AssessmentEngine {
            public function type(): string { return 'dup'; }
            public function calculate(array $data): AssessmentResult
            {
                return new AssessmentResult(1, 'low', 'first');
            }
        };
        $second = new class implements AssessmentEngine {
            public function type(): string { return 'dup'; }
            public function calculate(array $data): AssessmentResult
            {
                return new AssessmentResult(2, 'high', 'second');
            }
        };

        $registry->register($first);
        $registry->register($second);

        $result = $registry->get('dup')->calculate([]);
        $this->assertEquals(2, $result->score);
        $this->assertEquals('second', $result->recommendation);
    }
}
