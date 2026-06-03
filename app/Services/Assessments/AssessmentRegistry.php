<?php

namespace App\Services\Assessments;

class AssessmentRegistry
{
    private array $engines = [];

    public function register(AssessmentEngine $engine): void
    {
        $this->engines[$engine->type()] = $engine;
    }

    public function get(string $type): AssessmentEngine
    {
        if (!isset($this->engines[$type])) {
            throw new \InvalidArgumentException("Unknown assessment type: {$type}");
        }
        return $this->engines[$type];
    }

    public function all(): array
    {
        return $this->engines;
    }
}
