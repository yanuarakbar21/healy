<?php

namespace App\Providers;

use App\Services\Assessments\AssessmentRegistry;
use App\Services\Assessments\BMIEngine;
use App\Services\Assessments\DiabetesRiskEngine;
use App\Services\Assessments\StressPSS10Engine;
use Illuminate\Support\ServiceProvider;

class AssessmentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(AssessmentRegistry::class, function () {
            $registry = new AssessmentRegistry();
            $registry->register(new BMIEngine());
            $registry->register(new DiabetesRiskEngine());
            $registry->register(new StressPSS10Engine());
            return $registry;
        });
    }
}
