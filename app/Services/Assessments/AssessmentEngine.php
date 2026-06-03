<?php

namespace App\Services\Assessments;

interface AssessmentEngine
{
    public function type(): string;
    public function calculate(array $data): AssessmentResult;
}

class AssessmentResult
{
    public function __construct(
        public readonly float $score,
        public readonly string $category,
        public readonly string $recommendation,
    ) {}
}
