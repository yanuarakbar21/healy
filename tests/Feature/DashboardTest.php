<?php

namespace Tests\Feature;

use App\Models\HealthArticle;
use App\Models\HealthAssessment;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        Profile::create([
            'id' => $this->user->id,
            'full_name' => 'Test User',
            'birth_date' => now()->subYears(25),
            'gender' => 'male',
        ]);
        $this->actingAs($this->user);
    }

    #[Test]
    public function it_returns_dashboard_page()
    {
        $response = $this->get('/dashboard');

        $response->assertOk();
    }

    #[Test]
    public function it_shows_latest_assessments()
    {
        HealthAssessment::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'bmi',
            'score' => 22.5,
            'category' => 'normal',
            'responses' => ['height_cm' => 170, 'weight_kg' => 65],
            'recommendation' => 'Keep it up!',
        ]);
        HealthAssessment::create([
            'id' => (string) Str::uuid(),
            'user_id' => $this->user->id,
            'type' => 'diabetes_risk',
            'score' => 15,
            'category' => 'low',
            'responses' => ['age_group' => 1, 'family_history' => 'no'],
            'recommendation' => 'Low risk',
        ]);

        $response = $this->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('latestAssessments')
            ->has('latestTips')
            ->has('historyByType')
        );
    }

    #[Test]
    public function it_shows_latest_tips()
    {
        HealthArticle::create([
            'id' => (string) Str::uuid(),
            'title' => 'Health Tip 1',
            'slug' => 'health-tip-1',
            'description' => 'Description 1',
            'source' => 'WHO',
            'source_url' => 'https://example.com/1',
            'category' => 'general',
            'published_at' => now(),
        ]);

        $response = $this->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('latestTips', 1)
        );
    }

    #[Test]
    public function it_shows_empty_state_when_no_assessments()
    {
        $response = $this->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('latestAssessments', [])
            ->where('historyByType', [])
        );
    }
}
