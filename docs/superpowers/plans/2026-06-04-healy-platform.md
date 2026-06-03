# Healy Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Healy health assessment & AI consultation platform (Laravel 13 + Inertia React + Supabase + Reverb)

**Architecture:** Laravel 13 backend with Inertia.js React SPA frontend. Supabase for auth (JWT) and PostgreSQL database with RLS. Laravel Reverb (Database Driver) for real-time AI chat streaming. Laravel AI SDK for provider-agnostic LLM integration.

**Tech Stack:** Laravel 13, PHP 8.3, Inertia.js + React 19, Supabase (PostgreSQL), Laravel Reverb, OpenAI GPT-4o, Tailwind CSS 4, Vite 8

---

### Task 1: Project Setup & Package Installation

**Files:**
- Modify: `C:\Users\lenovo\diego\composer.json`
- Modify: `C:\Users\lenovo\diego\package.json`
- Modify: `C:\Users\lenovo\diego\.env`
- Create: `C:\Users\lenovo\diego\routes\api.php`

- [ ] **Step 1: Install Laravel packages**

Run:
```bash
cd C:\Users\lenovo\diego
composer require laravel/reverb laravel/ai supabase-php/supabase-php laravel/sanctum inertia-laravel
```

Expected: Packages installed without errors.

- [ ] **Step 2: Install NPM packages**

Run:
```bash
cd C:\Users\lenovo\diego
npm install react react-dom @inertiajs/react @types/react @types/react-dom laravel-echo pusher-js recharts
npm install -D @vitejs/plugin-react
```

Expected: All npm packages installed.

- [ ] **Step 3: Configure vite.config.js**

```js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { bunny } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
            fonts: [
                bunny('Quicksand', { weights: [400, 500, 600, 700] }),
                bunny('Plus Jakarta Sans', { weights: [400, 500, 600, 700] }),
            ],
        }),
        react(),
        tailwindcss(),
    ],
});
```

- [ ] **Step 4: Configure .env with Supabase and AI keys**

Edit `C:\Users\lenovo\diego\.env`, replace relevant lines:

```env
APP_NAME=Healy
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=db.<your-project>.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<your-password>

SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-role-key>

OPENAI_API_KEY=sk-<your-key>
OPENAI_MODEL=gpt-4o

REVERB_APP_ID=healy-app
REVERB_APP_KEY=healy-key
REVERB_APP_SECRET=healy-secret
REVERB_HOST=localhost
REVERB_PORT=8080

AI_PROVIDER=openai
BROADCAST_CONNECTION=reverb
```

- [ ] **Step 5: Publish Reverb + Inertia configs**

Run:
```bash
php artisan install:api
php artisan reverb:install
php artisan inertia:middleware
```

Expected: Reverb, API routes, and Inertia middleware installed.

- [ ] **Step 6: Register Inertia middleware and API routes**

Edit `C:\Users\lenovo\diego\bootstrap\app.php`:

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\HandleInertiaRequests;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
        $middleware->alias([
            'supabase.auth' => \App\Http\Middleware\VerifySupabaseToken::class,
        ]);
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
```

- [ ] **Step 7: Create routes/api.php**

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProfileController;

Route::middleware('supabase.auth')->group(function () {
    Route::post('/assessments/bmi', [AssessmentController::class, 'calculateBMI']);
    Route::post('/assessments/diabetes', [AssessmentController::class, 'calculateDiabetes']);
    Route::post('/assessments/stress', [AssessmentController::class, 'calculateStress']);
    Route::get('/assessments/history', [AssessmentController::class, 'history']);
    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::get('/chat/history', [ChatController::class, 'history']);
    Route::put('/profile', [ProfileController::class, 'update']);
});
```

- [ ] **Step 8: Create routes/channels.php**

```php
<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

Broadcast::channel('chat.{userId}', function (User $user, $userId) {
    return (string) $user->id === (string) $userId;
});
```

- [ ] **Step 9: Commit**

```bash
git add composer.json package.json vite.config.js .env.example bootstrap/app.php routes/api.php routes/channels.php
git commit -m "feat: project setup with Inertia React, Reverb, Supabase config"
```

---

### Task 2: Database Migrations

**Files:**
- Create: `C:\Users\lenovo\diego\database\migrations\2026_06_04_000001_create_profiles_table.php`
- Create: `C:\Users\lenovo\diego\database\migrations\2026_06_04_000002_create_questionnaire_templates_table.php`
- Create: `C:\Users\lenovo\diego\database\migrations\2026_06_04_000003_create_health_assessments_table.php`
- Create: `C:\Users\lenovo\diego\database\migrations\2026_06_04_000004_create_chat_logs_table.php`

- [ ] **Step 1: Create profiles migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('full_name');
            $table->date('birth_date');
            $table->string('gender');
            $table->decimal('height_cm', 5, 1)->nullable();
            $table->decimal('weight_kg', 5, 1)->nullable();
            $table->text('allergies')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
```

- [ ] **Step 2: Create questionnaire_templates migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questionnaire_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type')->unique();
            $table->jsonb('questions');
            $table->jsonb('scoring_rules');
            $table->integer('version')->default(1);
            $table->boolean('active')->default(true);
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questionnaire_templates');
    }
};
```

- [ ] **Step 3: Create health_assessments migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_assessments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('type');
            $table->decimal('score', 5, 2);
            $table->string('category');
            $table->jsonb('responses');
            $table->text('recommendation')->nullable();
            $table->timestampTz('taken_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('profiles')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_assessments');
    }
};
```

- [ ] **Step 4: Create chat_logs migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('session_id');
            $table->string('role');
            $table->text('content');
            $table->boolean('encrypted')->default(true);
            $table->jsonb('metadata')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->foreign('user_id')->references('id')->on('profiles')->cascadeOnDelete();
            $table->index('session_id');
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_logs');
    }
};
```

- [ ] **Step 5: Run migrations**

Run:
```bash
php artisan migrate
```

Expected: All 4 tables created in Supabase.

- [ ] **Step 6: Commit**

```bash
git add database/migrations/
git commit -m "feat: add profiles, questionnaire_templates, health_assessments, chat_logs tables"
```

---

### Task 3: Eloquent Models

**Files:**
- Modify: `C:\Users\lenovo\diego\app\Models\User.php`
- Create: `C:\Users\lenovo\diego\app\Models\Profile.php`
- Create: `C:\Users\lenovo\diego\app\Models\HealthAssessment.php`
- Create: `C:\Users\lenovo\diego\app\Models\QuestionnaireTemplate.php`
- Create: `C:\Users\lenovo\diego\app\Models\ChatLog.php`

- [ ] **Step 1: Update User model**

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $fillable = [
        'id',
        'email',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    public function profile()
    {
        return $this->hasOne(Profile::class, 'id', 'id');
    }
}
```

- [ ] **Step 2: Create Profile model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'id',
        'full_name',
        'birth_date',
        'gender',
        'height_cm',
        'weight_kg',
        'allergies',
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'height_cm' => 'decimal:1',
            'weight_kg' => 'decimal:1',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id', 'id');
    }

    public function assessments()
    {
        return $this->hasMany(HealthAssessment::class, 'user_id', 'id');
    }

    public function chatLogs()
    {
        return $this->hasMany(ChatLog::class, 'user_id', 'id');
    }
}
```

- [ ] **Step 3: Create HealthAssessment model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HealthAssessment extends Model
{
    public $timestamps = false;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'type',
        'score',
        'category',
        'responses',
        'recommendation',
        'taken_at',
    ];

    protected function casts(): array
    {
        return [
            'responses' => 'array',
            'score' => 'decimal:2',
            'taken_at' => 'datetime',
        ];
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'user_id', 'id');
    }
}
```

- [ ] **Step 4: Create QuestionnaireTemplate model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionnaireTemplate extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'type',
        'questions',
        'scoring_rules',
        'version',
        'active',
    ];

    protected function casts(): array
    {
        return [
            'questions' => 'array',
            'scoring_rules' => 'array',
            'active' => 'boolean',
        ];
    }
}
```

- [ ] **Step 5: Create ChatLog model**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatLog extends Model
{
    const UPDATED_AT = null;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'session_id',
        'role',
        'content',
        'encrypted',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'encrypted' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function profile()
    {
        return $this->belongsTo(Profile::class, 'user_id', 'id');
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add app/Models/
git commit -m "feat: add Eloquent models for all tables"
```

---

### Task 4: Supabase Auth Middleware

**Files:**
- Create: `C:\Users\lenovo\diego\app\Http\Middleware\VerifySupabaseToken.php`

- [ ] **Step 1: Create middleware**

```php
<?php

namespace App\Http\Middleware;

use App\Models\Profile;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class VerifySupabaseToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $response = Http::withToken($token)
            ->withHeaders(['apikey' => config('services.supabase.anon_key')])
            ->get(config('services.supabase.url') . '/auth/v1/user');

        if ($response->failed()) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $supabaseUser = $response->json();

        $user = User::firstOrCreate(
            ['id' => $supabaseUser['id']],
            ['email' => $supabaseUser['email'] ?? '']
        );

        Profile::firstOrCreate(
            ['id' => $supabaseUser['id']],
            [
                'full_name' => $supabaseUser['user_metadata']['full_name']
                    ?? $supabaseUser['email'] ?? '',
                'birth_date' => now()->subYears(25),
                'gender' => 'other',
            ]
        );

        auth()->setUser($user);

        return $next($request);
    }
}
```

- [ ] **Step 2: Add Supabase config**

Edit `C:\Users\lenovo\diego\config\services.php`:

```php
'supabase' => [
    'url' => env('SUPABASE_URL'),
    'anon_key' => env('SUPABASE_ANON_KEY'),
    'service_key' => env('SUPABASE_SERVICE_KEY'),
],
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Middleware/VerifySupabaseToken.php config/services.php
git commit -m "feat: add VerifySupabaseToken middleware"
```

---

### Task 5: Design System UI Components (React)

**Files:**
- Create: `C:\Users\lenovo\diego\resources\js\Components\ui\Button.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Components\ui\Card.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Components\ui\Input.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Components\ui\ProgressBar.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Components\ui\Chip.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\types\index.ts`
- Modify: `C:\Users\lenovo\diego\resources\css\app.css`

- [ ] **Step 1: Setup Tailwind with design tokens**

Edit `resources/css/app.css`:

```css
@import "tailwindcss";

@theme {
    --color-surface: #faf9f6;
    --color-surface-dim: #dbdad7;
    --color-surface-bright: #faf9f6;
    --color-surface-container-lowest: #ffffff;
    --color-surface-container-low: #f4f3f1;
    --color-surface-container: #efeeeb;
    --color-surface-container-high: #e9e8e5;
    --color-surface-container-highest: #e3e2e0;
    --color-on-surface: #1a1c1a;
    --color-on-surface-variant: #3d4a40;
    --color-on-surface: #1a1c1a;
    --color-primary: #006d3e;
    --color-on-primary: #ffffff;
    --color-primary-container: #1db06a;
    --color-on-primary-container: #003b1f;
    --color-primary-fixed-dim: #5ade93;
    --color-secondary: #026783;
    --color-on-secondary: #ffffff;
    --color-secondary-container: #95deff;
    --color-on-secondary-container: #00637f;
    --color-tertiary: #4b6454;
    --color-on-tertiary: #ffffff;
    --color-tertiary-container: #86a18f;
    --color-on-tertiary-container: #203729;
    --color-error: #ba1a1a;
    --color-on-error: #ffffff;
    --color-error-container: #ffdad6;
    --color-on-error-container: #93000a;
    --color-outline: #6d7a6f;
    --color-outline-variant: #bccabd;
    --font-family-heading: 'Quicksand', sans-serif;
    --font-family-body: 'Plus Jakarta Sans', sans-serif;
    --radius-sm: 0.5rem;
    --radius-md: 1.5rem;
    --radius-lg: 2rem;
    --radius-xl: 3rem;
}

@layer base {
    body {
        background-color: var(--color-surface);
        color: var(--color-on-surface);
        font-family: var(--font-family-body);
    }
    h1, h2, h3, h4, h5, h6 {
        font-family: var(--font-family-heading);
    }
}
```

- [ ] **Step 2: Create types**

`resources/js/types/index.ts`:

```ts
export interface HealthAssessment {
    id: string;
    type: 'bmi' | 'diabetes_risk' | 'stress_pss10';
    score: number;
    category: string;
    responses: Record<string, any>;
    recommendation?: string;
    taken_at: string;
}

export interface UserProfile {
    id: string;
    full_name: string;
    birth_date: string;
    gender: string;
    height_cm: number | null;
    weight_kg: number | null;
    allergies: string | null;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
}
```

- [ ] **Step 3: Create Button component**

`resources/js/Components/ui/Button.tsx`:

```tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
}

const variants = {
    primary: 'bg-primary text-on-primary shadow-md hover:bg-primary/90',
    secondary: 'bg-secondary text-on-secondary shadow-md hover:bg-secondary/90',
    ghost: 'border border-outline text-on-surface hover:bg-surface-container',
    danger: 'bg-error text-on-error hover:bg-error/90',
};

const sizes = {
    sm: 'px-4 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
    return (
        <button
            className={`rounded-full font-semibold transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
```

- [ ] **Step 4: Create Card component**

`resources/js/Components/ui/Card.tsx`:

```tsx
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
    return (
        <div
            className={`bg-white rounded-[24px] shadow-[0_8px_30px_rgba(2,103,131,0.06)] ${padding ? 'p-6' : ''} ${className}`}
        >
            {children}
        </div>
    );
}
```

- [ ] **Step 5: Create Input component**

`resources/js/Components/ui/Input.tsx`:

```tsx
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-semibold text-on-surface font-[family-name:var(--font-family-body)]">
                    {label}
                </label>
            )}
            <input
                className={`rounded-full border border-outline bg-surface px-5 py-2.5 text-base text-on-surface
                    placeholder:text-on-surface-variant/50 transition-all duration-200
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
                    ${error ? 'border-error focus:border-error focus:ring-error/20' : ''}
                    ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-error mt-0.5">{error}</span>}
        </div>
    );
}
```

- [ ] **Step 6: Create ProgressBar component**

`resources/js/Components/ui/ProgressBar.tsx`:

```tsx
interface ProgressBarProps {
    value: number;
    max?: number;
    color?: 'primary' | 'secondary';
    label?: string;
    showValue?: boolean;
}

export default function ProgressBar({ value, max = 100, color = 'primary', label, showValue = true }: ProgressBarProps) {
    const pct = Math.min((value / max) * 100, 100);
    const barColor = color === 'primary' ? 'bg-primary' : 'bg-secondary';

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {(label || showValue) && (
                <div className="flex justify-between text-sm text-on-surface-variant font-[family-name:var(--font-family-body)]">
                    {label && <span>{label}</span>}
                    {showValue && <span>{value}/{max}</span>}
                </div>
            )}
            <div className="w-full h-3 rounded-full bg-tertiary-container/20 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
```

- [ ] **Step 7: Create Chip component**

`resources/js/Components/ui/Chip.tsx`:

```tsx
import { ReactNode } from 'react';

interface ChipProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'tertiary';
}

const chipVariants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    tertiary: 'bg-tertiary-container/30 text-on-tertiary-container',
};

export default function Chip({ children, variant = 'primary' }: ChipProps) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${chipVariants[variant]}`}>
            {children}
        </span>
    );
}
```

- [ ] **Step 8: Commit**

```bash
git add resources/js/Components/ui/ resources/js/types/ resources/css/app.css
git commit -m "feat: add design system UI components with Healy theme"
```

---

### Task 6: App Entry Point, Layout, and Routing

**Files:**
- Create: `C:\Users\lenovo\diego\resources\js\app.jsx`
- Create: `C:\Users\lenovo\diego\resources\js\Layouts\AppLayout.tsx`
- Create: `C:\Users\lenovo\diego\resources\views\app.blade.php`
- Modify: `C:\Users\lenovo\diego\routes\web.php`
- Modify: `C:\Users\lenovo\diego\resources\views\welcome.blade.php`

- [ ] **Step 1: Create app.blade.php**

`resources/views/app.blade.php`:

```blade
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ config('app.name', 'Healy') }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased">
    @inertia
</body>
</html>
```

- [ ] **Step 2: Create app.jsx entry point**

`resources/js/app.jsx`:

```tsx
import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

createInertiaApp({
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.tsx`,
        import.meta.glob('./Pages/**/*.tsx')
    ),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#006d3e',
    },
});
```

- [ ] **Step 3: Create AppLayout**

`resources/js/Layouts/AppLayout.tsx`:

```tsx
import { Link, usePage } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const { url } = usePage();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/assessments', label: 'Health Tests', icon: '🩺' },
        { href: '/chat', label: 'AI Consultant', icon: '💬' },
        { href: '/profile', label: 'Profile', icon: '👤' },
    ];

    return (
        <div className="min-h-screen bg-surface flex">
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-[4px_0_20px_rgba(2,103,131,0.04)] transform transition-transform duration-200 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-outline-variant/30">
                    <Link href="/dashboard" className="text-2xl font-bold text-primary font-[family-name:var(--font-family-heading)]">
                        Healy
                    </Link>
                </div>
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                                ${url.startsWith(item.href)
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-on-surface-variant hover:bg-surface-container'}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-surface-container">
                        <span className="text-xl">{sidebarOpen ? '✕' : '☰'}</span>
                    </button>
                    <h1 className="text-lg font-semibold text-on-surface font-[family-name:var(--font-family-heading)]">Healy</h1>
                </header>
                <main className="flex-1 p-6 lg:p-8 max-w-6xl w-full mx-auto">
                    {children}
                </main>
            </div>
            {sidebarOpen && (
                <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/20 z-30 lg:hidden" />
            )}
        </div>
    );
}
```

- [ ] **Step 4: Update routes/web.php**

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\VerifySupabaseToken;

Route::get('/', function () {
    return inertia('Welcome');
});

Route::middleware('supabase.auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments.index');
    Route::get('/assessments/bmi', [AssessmentController::class, 'bmi'])->name('assessments.bmi');
    Route::get('/assessments/diabetes', [AssessmentController::class, 'diabetes'])->name('assessments.diabetes');
    Route::get('/assessments/stress', [AssessmentController::class, 'stress'])->name('assessments.stress');
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
});
```

- [ ] **Step 5: Commit**

```bash
git add resources/js/app.jsx resources/js/Layouts/ resources/views/app.blade.php routes/web.php
git commit -m "feat: add Inertia app entry, AppLayout, and page routing"
```

---

### Task 7: Welcome & Auth Pages

**Files:**
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Welcome.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Auth\Login.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Auth\Register.tsx`
- Delete: `C:\Users\lenovo\diego\resources\views\welcome.blade.php`

- [ ] **Step 1: Create Welcome landing page**

`resources/js/Pages/Welcome.tsx`:

```tsx
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/ui/Button';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome to Healy" />
            <div className="min-h-screen bg-surface flex flex-col">
                <header className="px-6 lg:px-[120px] py-6 flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary font-[family-name:var(--font-family-heading)]">Healy</span>
                    <div className="flex gap-3">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/register">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </header>
                <main className="flex-1 flex items-center justify-center px-6 lg:px-[120px]">
                    <div className="max-w-2xl text-center">
                        <h1 className="text-4xl lg:text-5xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] leading-tight mb-6">
                            Your Personal<br/>
                            <span className="text-primary">Health Companion</span>
                        </h1>
                        <p className="text-lg text-on-surface-variant font-[family-name:var(--font-family-body)] mb-10 leading-relaxed">
                            Screen your health, track your wellness, and get AI-powered insights — anytime, anywhere.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/register">
                                <Button size="lg">Start Your Health Check</Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="ghost" size="lg">I already have an account</Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
```

- [ ] **Step 2: Create Login page**

`resources/js/Pages/Auth/Login.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Card from '@/Components/ui/Card';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/auth/login');
    };

    return (
        <>
            <Head title="Log In - Healy" />
            <div className="min-h-screen bg-surface flex items-center justify-center px-5">
                <Card className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] mb-2">Welcome Back</h1>
                    <p className="text-sm text-on-surface-variant mb-8 font-[family-name:var(--font-family-body)]">Log in to your Healy account</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} placeholder="your@email.com" />
                        <Input label="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} placeholder="••••••••" />
                        <Button type="submit" className="w-full" disabled={processing}>Log In</Button>
                    </form>

                    <p className="text-center text-sm text-on-surface-variant mt-6 font-[family-name:var(--font-family-body)]">
                        Don't have an account?{' '}
                        <a href="/register" className="text-primary font-semibold hover:underline">Sign Up</a>
                    </p>
                </Card>
            </div>
        </>
    );
}
```

- [ ] **Step 3: Create Register page**

`resources/js/Pages/Auth/Register.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react';
import Button from '@/Components/ui/Button';
import Input from '@/Components/ui/Input';
import Card from '@/Components/ui/Card';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        full_name: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/api/auth/register');
    };

    return (
        <>
            <Head title="Sign Up - Healy" />
            <div className="min-h-screen bg-surface flex items-center justify-center px-5">
                <Card className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] mb-2">Create Account</h1>
                    <p className="text-sm text-on-surface-variant mb-8 font-[family-name:var(--font-family-body)]">Start your health journey with Healy</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Full Name" value={data.full_name} onChange={e => setData('full_name', e.target.value)} error={errors.full_name} placeholder="John Doe" />
                        <Input label="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} error={errors.email} placeholder="your@email.com" />
                        <Input label="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} error={errors.password} placeholder="••••••••" />
                        <Button type="submit" className="w-full" disabled={processing}>Create Account</Button>
                    </form>

                    <p className="text-center text-sm text-on-surface-variant mt-6 font-[family-name:var(--font-family-body)]">
                        Already have an account?{' '}
                        <a href="/login" className="text-primary font-semibold hover:underline">Log In</a>
                    </p>
                </Card>
            </div>
        </>
    );
}
```

- [ ] **Step 4: Remove old welcome view**

```bash
git rm resources/views/welcome.blade.php
```

- [ ] **Step 5: Commit**

```bash
git add resources/js/Pages/Welcome.tsx resources/js/Pages/Auth/
git commit -m "feat: add Welcome landing page, Login and Register pages"
```

---

### Task 8: Dashboard & Profile Controllers

**Files:**
- Create: `C:\Users\lenovo\diego\app\Http\Controllers\DashboardController.php`
- Create: `C:\Users\lenovo\diego\app\Http\Controllers\ProfileController.php`

- [ ] **Step 1: Create DashboardController**

```php
<?php

namespace App\Http\Controllers;

use App\Models\HealthAssessment;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $assessments = HealthAssessment::where('user_id', $user->id)
            ->orderBy('taken_at', 'desc')
            ->get();

        $latest = $assessments->groupBy('type')->map(fn ($items) => $items->first());
        $historyByType = $assessments->groupBy('type');

        return inertia('Dashboard', [
            'profile' => $user->profile,
            'latestAssessments' => $latest,
            'historyByType' => $historyByType->map(fn ($items, $type) => [
                'type' => $type,
                'data' => $items->map(fn ($a) => [
                    'score' => $a->score,
                    'category' => $a->category,
                    'taken_at' => $a->taken_at,
                ])->values(),
            ])->values(),
        ]);
    }
}
```

- [ ] **Step 2: Create ProfileController**

```php
<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function edit()
    {
        return inertia('Profile/Complete', [
            'profile' => auth()->user()->profile,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'height_cm' => 'nullable|numeric|min:50|max:300',
            'weight_kg' => 'nullable|numeric|min:10|max:500',
            'allergies' => 'nullable|string|max:1000',
        ]);

        $profile = auth()->user()->profile;
        $profile->update($data);

        return redirect()->route('dashboard');
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/Http/Controllers/DashboardController.php app/Http/Controllers/ProfileController.php
git commit -m "feat: add Dashboard and Profile controllers"
```

---

### Task 9: Dashboard & Profile Pages

**Files:**
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Dashboard.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Profile\Complete.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Components\AssessmentCard.tsx`

- [ ] **Step 1: Create AssessmentCard component**

`resources/js/Components/AssessmentCard.tsx`:

```tsx
import { HealthAssessment } from '@/types';
import Card from '@/Components/ui/Card';
import Chip from '@/Components/ui/Chip';

interface AssessmentCardProps {
    assessment: HealthAssessment;
}

const typeLabels: Record<string, string> = {
    bmi: 'BMI Calculator',
    diabetes_risk: 'Diabetes Risk Screening',
    stress_pss10: 'Stress Level Assessment',
};

const chipVariant: Record<string, 'primary' | 'secondary' | 'tertiary'> = {
    normal: 'primary',
    underweight: 'secondary',
    overweight: 'tertiary',
    obese: 'danger',
    low: 'primary',
    moderate: 'secondary',
    high: 'danger',
};

export default function AssessmentCard({ assessment }: AssessmentCardProps) {
    const label = typeLabels[assessment.type] ?? assessment.type;
    const variant = chipVariant[assessment.category] ?? 'primary';

    return (
        <Card className="flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-on-surface font-[family-name:var(--font-family-heading)]">{label}</h3>
                <p className="text-sm text-on-surface-variant mt-1">{new Date(assessment.taken_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
                <p className="text-2xl font-bold text-primary font-[family-name:var(--font-family-heading)]">{assessment.score}</p>
                <Chip variant={variant as any}>{assessment.category}</Chip>
            </div>
        </Card>
    );
}
```

- [ ] **Step 2: Create Dashboard page**

`resources/js/Pages/Dashboard.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import AssessmentCard from '@/Components/AssessmentCard';
import type { UserProfile, HealthAssessment } from '@/types';

interface DashboardProps {
    profile: UserProfile;
    latestAssessments: Record<string, HealthAssessment>;
    historyByType: Array<{ type: string; data: Array<{ score: number; category: string; taken_at: string }> }>;
}

export default function Dashboard({ profile, latestAssessments, historyByType }: DashboardProps) {
    const hasProfile = !!(profile?.full_name && profile?.birth_date);
    const hasAssessments = Object.keys(latestAssessments).length > 0;

    return (
        <AppLayout>
            <Head title="Dashboard - Healy" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">
                        Hello, {profile?.full_name?.split(' ')[0] ?? 'there'}
                    </h1>
                    <p className="text-on-surface-variant mt-1">Here's your health overview</p>
                </div>

                {!hasProfile && (
                    <Card className="border-l-4 border-primary bg-primary/5">
                        <p className="text-sm text-on-surface font-[family-name:var(--font-family-body)]">
                            Complete your{' '}
                            <a href="/profile" className="text-primary font-semibold hover:underline">clinical profile</a>
                            {' '}to enable BMI calculation and personalized insights.
                        </p>
                    </Card>
                )}

                {hasAssessments && (
                    <section>
                        <h2 className="text-xl font-semibold text-on-surface font-[family-name:var(--font-family-heading)] mb-4">Latest Results</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.values(latestAssessments).map((a) => (
                                <AssessmentCard key={a.id} assessment={a} />
                            ))}
                        </div>
                    </section>
                )}

                {historyByType.map(({ type, data }) => data.length > 1 && (
                    <section key={type}>
                        <h2 className="text-xl font-semibold text-on-surface font-[family-name:var(--font-family-heading)] mb-4">
                            {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} History
                        </h2>
                        <Card>
                            <div className="space-y-3">
                                {data.slice().reverse().map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                                        <span className="text-sm text-on-surface-variant">{new Date(entry.taken_at).toLocaleDateString()}</span>
                                        <span className="font-semibold text-on-surface">{entry.score} — {entry.category}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </section>
                ))}

                {!hasAssessments && (
                    <Card className="text-center py-12">
                        <p className="text-on-surface-variant mb-4">No health assessments yet</p>
                        <a href="/assessments" className="inline-flex items-center px-6 py-3 rounded-full bg-primary text-on-primary font-semibold hover:bg-primary/90 transition-colors">
                            Take Your First Test
                        </a>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 3: Create Profile Complete page**

`resources/js/Pages/Profile/Complete.tsx`:

```tsx
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import type { UserProfile } from '@/types';

interface ProfileProps {
    profile: UserProfile;
}

export default function Complete({ profile }: ProfileProps) {
    const { data, setData, put, processing, errors } = useForm({
        full_name: profile?.full_name ?? '',
        birth_date: profile?.birth_date ?? '',
        gender: profile?.gender ?? 'male',
        height_cm: profile?.height_cm?.toString() ?? '',
        weight_kg: profile?.weight_kg?.toString() ?? '',
        allergies: profile?.allergies ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/api/profile');
    };

    return (
        <AppLayout>
            <Head title="Profile - Healy" />
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)] mb-6">Clinical Profile</h1>
                <form onSubmit={handleSubmit}>
                    <Card className="space-y-5">
                        <Input label="Full Name" value={data.full_name} onChange={e => setData('full_name', e.target.value)} error={errors.full_name} />
                        
                        <Input label="Date of Birth" type="date" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} error={errors.birth_date} />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-on-surface">Gender</label>
                            <div className="flex gap-4">
                                {['male', 'female', 'other'].map(g => (
                                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="gender" value={g} checked={data.gender === g} onChange={e => setData('gender', e.target.value)} className="accent-primary" />
                                        <span className="text-sm capitalize">{g}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.gender && <span className="text-xs text-error">{errors.gender}</span>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Height (cm)" type="number" step="0.1" value={data.height_cm} onChange={e => setData('height_cm', e.target.value)} error={errors.height_cm} />
                            <Input label="Weight (kg)" type="number" step="0.1" value={data.weight_kg} onChange={e => setData('weight_kg', e.target.value)} error={errors.weight_kg} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-semibold text-on-surface">Allergies</label>
                            <textarea
                                value={data.allergies}
                                onChange={e => setData('allergies', e.target.value)}
                                className="rounded-2xl border border-outline bg-surface px-5 py-2.5 text-base text-on-surface resize-none h-24 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            {errors.allergies && <span className="text-xs text-error">{errors.allergies}</span>}
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>Save Profile</Button>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 4: Commit**

```bash
git add resources/js/Pages/Dashboard.tsx resources/js/Pages/Profile/ resources/js/Components/AssessmentCard.tsx
git commit -m "feat: add Dashboard and Profile pages"
```

---

### Task 10: Health Assessment Service Layer

**Files:**
- Create: `C:\Users\lenovo\diego\app\Services\Assessments\AssessmentRegistry.php`
- Create: `C:\Users\lenovo\diego\app\Services\Assessments\AssessmentEngine.php`
- Create: `C:\Users\lenovo\diego\app\Services\Assessments\BMIEngine.php`
- Create: `C:\Users\lenovo\diego\app\Services\Assessments\DiabetesRiskEngine.php`
- Create: `C:\Users\lenovo\diego\app\Services\Assessments\StressPSS10Engine.php`
- Create: `C:\Users\lenovo\diego\database\seeders\QuestionnaireSeeder.php`

- [ ] **Step 1: Create AssessmentEngine interface**

```php
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
```

- [ ] **Step 2: Create AssessmentRegistry**

```php
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
```

- [ ] **Step 3: Create BMIEngine**

```php
<?php

namespace App\Services\Assessments;

class BMIEngine implements AssessmentEngine
{
    public function type(): string
    {
        return 'bmi';
    }

    public function calculate(array $data): AssessmentResult
    {
        $weight = (float) ($data['weight_kg'] ?? 0);
        $heightCm = (float) ($data['height_cm'] ?? 0);

        if ($weight <= 0 || $heightCm <= 0) {
            throw new \InvalidArgumentException('Weight and height must be positive values.');
        }

        $heightM = $heightCm / 100;
        $bmi = round($weight / ($heightM * $heightM), 1);

        $category = match (true) {
            $bmi < 18.5 => 'underweight',
            $bmi < 25.0 => 'normal',
            $bmi < 30.0 => 'overweight',
            default => 'obese',
        };

        $recommendations = [
            'underweight' => 'Consider consulting a nutritionist to develop a healthy weight gain plan. Focus on nutrient-dense foods.',
            'normal' => 'Great job maintaining a healthy weight! Continue with a balanced diet and regular physical activity.',
            'overweight' => 'Consider increasing physical activity and reviewing your diet. A 5-10% weight reduction can significantly improve health.',
            'obese' => 'We recommend consulting a healthcare provider for a personalized weight management plan.',
        ];

        return new AssessmentResult($bmi, $category, $recommendations[$category]);
    }
}
```

- [ ] **Step 4: Create DiabetesRiskEngine**

```php
<?php

namespace App\Services\Assessments;

class DiabetesRiskEngine implements AssessmentEngine
{
    public function type(): string
    {
        return 'diabetes_risk';
    }

    public function calculate(array $data): AssessmentResult
    {
        $score = 0;

        $score += match ((int) ($data['age_group'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, 4 => 15, 5 => 20, default => 0,
        };
        $score += ($data['family_history'] ?? 'no') === 'yes' ? 15 : 0;
        $score += match ((int) ($data['activity'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, default => 0,
        };
        $score += match ((int) ($data['diet'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, default => 0,
        };
        $score += match ((int) ($data['waist'] ?? 1)) {
            1 => 0, 2 => 5, 3 => 10, default => 0,
        };
        $score += ($data['hypertension'] ?? 'no') === 'yes' ? 10 : 0;
        $score += ($data['high_blood_sugar'] ?? 'no') === 'yes' ? 15 : 0;

        $category = match (true) {
            $score < 30 => 'low',
            $score < 60 => 'moderate',
            default => 'high',
        };

        $recommendations = [
            'low' => 'Your risk appears low. Maintain a healthy lifestyle with regular exercise and balanced nutrition.',
            'moderate' => 'Consider lifestyle modifications: increase physical activity, reduce sugar intake, and monitor your weight. A check-up is recommended.',
            'high' => 'Please consult a healthcare provider for proper diabetes screening and personalized advice.',
        ];

        return new AssessmentResult($score, $category, $recommendations[$category]);
    }
}
```

- [ ] **Step 5: Create StressPSS10Engine**

```php
<?php

namespace App\Services\Assessments;

class StressPSS10Engine implements AssessmentEngine
{
    public function type(): string
    {
        return 'stress_pss10';
    }

    public function calculate(array $data): AssessmentResult
    {
        $total = 0;
        $reverseItems = [4, 5, 7, 8];

        foreach (range(1, 10) as $i) {
            $value = (int) ($data["q{$i}"] ?? 2);
            $value = max(0, min(4, $value));
            if (in_array($i, $reverseItems)) {
                $value = 4 - $value;
            }
            $total += $value;
        }

        $category = match (true) {
            $total <= 13 => 'low',
            $total <= 26 => 'moderate',
            default => 'high',
        };

        $recommendations = [
            'low' => 'Your stress levels appear well-managed. Continue with your current coping strategies.',
            'moderate' => 'Consider incorporating stress management techniques such as mindfulness, deep breathing, or regular exercise.',
            'high' => 'We strongly recommend speaking with a mental health professional. In the meantime, practice relaxation techniques and reach out to your support network.',
        ];

        return new AssessmentResult($total, $category, $recommendations[$category]);
    }
}
```

- [ ] **Step 6: Create DatabaseSeeder for questionnaires**

```php
<?php

namespace Database\Seeders;

use App\Models\QuestionnaireTemplate;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class QuestionnaireSeeder extends Seeder
{
    public function run(): void
    {
        QuestionnaireTemplate::create([
            'id' => Str::uuid(),
            'type' => 'diabetes_risk',
            'questions' => [
                ['id' => 'age_group', 'text' => 'What is your age group?', 'options' => [1 => 'Under 25', 2 => '25-34', 3 => '35-44', 4 => '45-54', 5 => '55 or older']],
                ['id' => 'family_history', 'text' => 'Do you have a family history of diabetes?', 'options' => ['no' => 'No', 'yes' => 'Yes']],
                ['id' => 'activity', 'text' => 'How would you describe your physical activity level?', 'options' => [1 => 'Active (regular exercise)', 2 => 'Moderate (occasional)', 3 => 'Sedentary (rarely)']],
                ['id' => 'diet', 'text' => 'How would you describe your diet?', 'options' => [1 => 'Balanced with plenty of vegetables', 2 => 'Moderate', 3 => 'High in sugar/processed foods']],
                ['id' => 'waist', 'text' => 'How would you describe your waist circumference?', 'options' => [1 => 'Healthy range', 2 => 'Slightly elevated', 3 => 'Significantly elevated']],
                ['id' => 'hypertension', 'text' => 'Do you have high blood pressure?', 'options' => ['no' => 'No', 'yes' => 'Yes']],
                ['id' => 'high_blood_sugar', 'text' => 'Have you ever been told you have high blood sugar?', 'options' => ['no' => 'No', 'yes' => 'Yes']],
            ],
            'scoring_rules' => [
                'max_score' => 100,
                'thresholds' => ['low' => 30, 'moderate' => 60, 'high' => 100],
            ],
            'active' => true,
        ]);

        QuestionnaireTemplate::create([
            'id' => Str::uuid(),
            'type' => 'stress_pss10',
            'questions' => [
                ['id' => 'q1', 'text' => 'In the last month, how often have you been upset because of something that happened unexpectedly?'],
                ['id' => 'q2', 'text' => 'In the last month, how often have you felt that you were unable to control the important things in your life?'],
                ['id' => 'q3', 'text' => 'In the last month, how often have you felt nervous and stressed?'],
                ['id' => 'q4', 'text' => 'In the last month, how often have you felt confident about your ability to handle your personal problems?'],
                ['id' => 'q5', 'text' => 'In the last month, how often have you felt that things were going your way?'],
                ['id' => 'q6', 'text' => 'In the last month, how often have you found that you could not cope with all the things that you had to do?'],
                ['id' => 'q7', 'text' => 'In the last month, how often have you been able to control irritations in your life?'],
                ['id' => 'q8', 'text' => 'In the last month, how often have you felt that you were on top of things?'],
                ['id' => 'q9', 'text' => 'In the last month, how often have you been angered because of things that happened outside of your control?'],
                ['id' => 'q10', 'text' => 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?'],
            ],
            'scoring_rules' => [
                'max_score' => 40,
                'reverse_items' => [4, 5, 7, 8],
                'thresholds' => ['low' => 13, 'moderate' => 26, 'high' => 40],
            ],
            'active' => true,
        ]);
    }
}
```

- [ ] **Step 7: Register seeder and registry provider**

Run:
```bash
php artisan make:provider AssessmentServiceProvider
```

Edit `app/Providers/AssessmentServiceProvider.php`:

```php
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
```

Edit `bootstrap/app.php` to add the provider:

```php
->withProviders([
    \App\Providers\AssessmentServiceProvider::class,
])
```

Add to `config/app.php` providers array:

```php
App\Providers\AssessmentServiceProvider::class,
```

- [ ] **Step 8: Run the seeder**

```bash
php artisan db:seed --class=QuestionnaireSeeder
```

Expected: 2 questionnaire templates seeded (diabetes_risk, stress_pss10).

- [ ] **Step 9: Commit**

```bash
git add app/Services/Assessments/ app/Providers/AssessmentServiceProvider.php database/seeders/QuestionnaireSeeder.php
git commit -m "feat: add health assessment service layer with BMI, Diabetes, Stress engines"
```

---

### Task 11: Assessment Controller & Frontend Pages

**Files:**
- Create: `C:\Users\lenovo\diego\app\Http\Controllers\AssessmentController.php`
- Create: `C:\Users\lenovo\diego\app\Http\Requests\BMIRequest.php`
- Create: `C:\Users\lenovo\diego\app\Http\Requests\DiabetesRequest.php`
- Create: `C:\Users\lenovo\diego\app\Http\Requests\StressRequest.php`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Assessments\Index.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Assessments\BMI.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Assessments\Diabetes.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Assessments\Stress.tsx`

- [ ] **Step 1: Create AssessmentController**

```php
<?php

namespace App\Http\Controllers;

use App\Models\HealthAssessment;
use App\Services\Assessments\AssessmentRegistry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AssessmentController extends Controller
{
    public function index()
    {
        return inertia('Assessments/Index');
    }

    public function bmi()
    {
        $profile = auth()->user()->profile;
        return inertia('Assessments/BMI', [
            'profileHeight' => $profile->height_cm,
            'profileWeight' => $profile->weight_kg,
        ]);
    }

    public function diabetes()
    {
        return inertia('Assessments/Diabetes');
    }

    public function stress()
    {
        return inertia('Assessments/Stress');
    }

    public function calculateBMI(Request $request, AssessmentRegistry $registry)
    {
        $data = $request->validate([
            'height_cm' => 'required|numeric|min:50|max:300',
            'weight_kg' => 'required|numeric|min:10|max:500',
        ]);

        $engine = $registry->get('bmi');
        $result = $engine->calculate($data);

        $assessment = HealthAssessment::create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'type' => 'bmi',
            'score' => $result->score,
            'category' => $result->category,
            'responses' => $data,
            'recommendation' => $result->recommendation,
        ]);

        return response()->json($assessment);
    }

    public function calculateDiabetes(Request $request, AssessmentRegistry $registry)
    {
        $data = $request->validate([
            'age_group' => 'required|integer|min:1|max:5',
            'family_history' => 'required|in:yes,no',
            'activity' => 'required|integer|min:1|max:3',
            'diet' => 'required|integer|min:1|max:3',
            'waist' => 'required|integer|min:1|max:3',
            'hypertension' => 'required|in:yes,no',
            'high_blood_sugar' => 'required|in:yes,no',
        ]);

        $engine = $registry->get('diabetes_risk');
        $result = $engine->calculate($data);

        $assessment = HealthAssessment::create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'type' => 'diabetes_risk',
            'score' => $result->score,
            'category' => $result->category,
            'responses' => $data,
            'recommendation' => $result->recommendation,
        ]);

        return response()->json($assessment);
    }

    public function calculateStress(Request $request, AssessmentRegistry $registry)
    {
        $rules = [];
        foreach (range(1, 10) as $i) {
            $rules["q{$i}"] = 'required|integer|min:0|max:4';
        }

        $data = $request->validate($rules);

        $engine = $registry->get('stress_pss10');
        $result = $engine->calculate($data);

        $assessment = HealthAssessment::create([
            'id' => Str::uuid(),
            'user_id' => auth()->id(),
            'type' => 'stress_pss10',
            'score' => $result->score,
            'category' => $result->category,
            'responses' => $data,
            'recommendation' => $result->recommendation,
        ]);

        return response()->json($assessment);
    }

    public function history()
    {
        $assessments = HealthAssessment::where('user_id', auth()->id())
            ->orderBy('taken_at', 'desc')
            ->get();

        return response()->json($assessments);
    }
}
```

- [ ] **Step 2: Create Assessments Index page**

`resources/js/Pages/Assessments/Index.tsx`:

```tsx
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';

const tests = [
    { href: '/assessments/bmi', title: 'BMI Calculator', desc: 'Calculate your Body Mass Index and get nutrition recommendations', icon: '⚖️', time: '1 min' },
    { href: '/assessments/diabetes', title: 'Diabetes Risk Screening', desc: 'Assess your risk for Type-2 Diabetes based on lifestyle and genetics', icon: '🩸', time: '3 min' },
    { href: '/assessments/stress', title: 'Stress Level Assessment', desc: 'Measure your stress levels using the clinically validated PSS-10 scale', icon: '🧠', time: '5 min' },
];

export default function Index() {
    return (
        <AppLayout>
            <Head title="Health Tests - Healy" />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Health Assessments</h1>
                    <p className="text-on-surface-variant mt-1">Choose a test to check your health status</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {tests.map((test) => (
                        <Link key={test.href} href={test.href}>
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                <span className="text-3xl">{test.icon}</span>
                                <h3 className="text-lg font-semibold mt-3 font-[family-name:var(--font-family-heading)]">{test.title}</h3>
                                <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">{test.desc}</p>
                                <span className="inline-block mt-4 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{test.time}</span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 3: Create BMI assessment page**

`resources/js/Pages/Assessments/BMI.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import Chip from '@/Components/ui/Chip';

interface BMIProps {
    profileHeight: number | null;
    profileWeight: number | null;
}

export default function BMI({ profileHeight, profileWeight }: BMIProps) {
    const [height, setHeight] = useState(profileHeight?.toString() ?? '');
    const [weight, setWeight] = useState(profileWeight?.toString() ?? '');
    const [result, setResult] = useState<{ score: number; category: string; recommendation: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/assessments/bmi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('supabase_token')}` },
                body: JSON.stringify({ height_cm: height, weight_kg: weight }),
            });
            if (!res.ok) throw new Error('Invalid input');
            const data = await res.json();
            setResult(data);
        } catch {
            setError('Please enter valid height and weight values.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout>
            <Head title="BMI Calculator - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">BMI Calculator</h1>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input label="Height (cm)" type="number" step="0.1" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 170" />
                        <Input label="Weight (kg)" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 65" />
                        {error && <p className="text-sm text-error">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Calculating...' : 'Calculate BMI'}</Button>
                    </form>
                </Card>

                {result && (
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-on-surface-variant">Your BMI Score</p>
                            <p className="text-5xl font-bold text-primary font-[family-name:var(--font-family-heading)] my-3">{result.score}</p>
                            <Chip variant={result.category === 'normal' ? 'primary' : 'secondary'}>{result.category}</Chip>
                            <p className="text-sm text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 4: Create Diabetes risk assessment page**

`resources/js/Pages/Assessments/Diabetes.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Chip from '@/Components/ui/Chip';

const questions = [
    { id: 'age_group', text: 'What is your age group?', options: [['1', 'Under 25'], ['2', '25-34'], ['3', '35-44'], ['4', '45-54'], ['5', '55 or older']] },
    { id: 'family_history', text: 'Do you have a family history of diabetes?', options: [['no', 'No'], ['yes', 'Yes']] },
    { id: 'activity', text: 'How would you describe your physical activity level?', options: [['1', 'Active (regular exercise)'], ['2', 'Moderate (occasional)'], ['3', 'Sedentary (rarely)']] },
    { id: 'diet', text: 'How would you describe your diet?', options: [['1', 'Balanced with plenty of vegetables'], ['2', 'Moderate'], ['3', 'High in sugar/processed foods']] },
    { id: 'waist', text: 'How would you describe your waist circumference?', options: [['1', 'Healthy range'], ['2', 'Slightly elevated'], ['3', 'Significantly elevated']] },
    { id: 'hypertension', text: 'Do you have high blood pressure?', options: [['no', 'No'], ['yes', 'Yes']] },
    { id: 'high_blood_sugar', text: 'Have you ever been told you have high blood sugar?', options: [['no', 'No'], ['yes', 'Yes']] },
];

export default function Diabetes() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [step, setStep] = useState(0);
    const [result, setResult] = useState<{ score: number; category: string; recommendation: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const current = questions[step];

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({ ...prev, [current.id]: value }));
        if (step < questions.length - 1) {
            setStep(step + 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/assessments/diabetes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('supabase_token')}` },
                body: JSON.stringify(answers),
            });
            const data = await res.json();
            setResult(data);
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <AppLayout>
                <Head title="Diabetes Risk - Healy" />
                <div className="max-w-xl mx-auto">
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-on-surface-variant">Your Diabetes Risk Score</p>
                            <p className="text-5xl font-bold text-primary font-[family-name:var(--font-family-heading)] my-3">{result.score}</p>
                            <Chip variant={result.category === 'low' ? 'primary' : result.category === 'moderate' ? 'secondary' : 'tertiary'}>{result.category} risk</Chip>
                            <p className="text-sm text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                            <Button className="mt-6" onClick={() => { setResult(null); setStep(0); setAnswers({}); }}>Retake Test</Button>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Diabetes Risk - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Diabetes Risk Screening</h1>
                    <span className="text-sm text-on-surface-variant">Question {step + 1} of {questions.length}</span>
                </div>
                <Card>
                    <p className="text-base font-semibold text-on-surface mb-6">{current.text}</p>
                    <div className="space-y-3">
                        {current.options.map(([value, label]) => (
                            <button
                                key={value}
                                onClick={() => handleAnswer(value)}
                                className="w-full text-left px-5 py-4 rounded-2xl border border-outline-variant hover:border-primary hover:bg-primary/5 transition-colors text-sm font-[family-name:var(--font-family-body)]"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {step === questions.length - 1 && (
                        <Button className="w-full mt-6" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Calculating...' : 'See Results'}
                        </Button>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 5: Create Stress PSS-10 assessment page**

`resources/js/Pages/Assessments/Stress.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Chip from '@/Components/ui/Chip';

const stressQuestions = [
    'Been upset because of something that happened unexpectedly?',
    'Felt unable to control the important things in your life?',
    'Felt nervous and stressed?',
    'Felt confident about your ability to handle personal problems?',
    'Felt that things were going your way?',
    'Found that you could not cope with all the things you had to do?',
    'Been able to control irritations in your life?',
    'Felt that you were on top of things?',
    'Been angered because of things outside your control?',
    'Felt difficulties were piling up so high you could not overcome them?',
];

const scale = [
    ['0', 'Never'],
    ['1', 'Almost Never'],
    ['2', 'Sometimes'],
    ['3', 'Fairly Often'],
    ['4', 'Very Often'],
];

export default function Stress() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [result, setResult] = useState<{ score: number; category: string; recommendation: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const allAnswered = stressQuestions.every((_, i) => answers[`q${i + 1}`] !== undefined);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/assessments/stress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('supabase_token')}` },
                body: JSON.stringify(answers),
            });
            const data = await res.json();
            setResult(data);
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <AppLayout>
                <Head title="Stress Level - Healy" />
                <div className="max-w-xl mx-auto">
                    <Card>
                        <div className="text-center">
                            <p className="text-sm text-on-surface-variant">Your Stress Level (PSS-10)</p>
                            <p className="text-5xl font-bold text-primary font-[family-name:var(--font-family-heading)] my-3">{result.score}/40</p>
                            <Chip variant={result.category === 'low' ? 'primary' : result.category === 'moderate' ? 'secondary' : 'tertiary'}>{result.category} stress</Chip>
                            <p className="text-sm text-on-surface mt-4 leading-relaxed">{result.recommendation}</p>
                            <Button className="mt-6" onClick={() => { setResult(null); setAnswers({}); }}>Retake Test</Button>
                        </div>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Stress Level - Healy" />
            <div className="max-w-xl mx-auto space-y-6">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Stress Level Assessment</h1>
                <p className="text-sm text-on-surface-variant">In the last month, how often have you...</p>

                {stressQuestions.map((q, i) => (
                    <Card key={i}>
                        <p className="text-sm font-semibold text-on-surface mb-4">{i + 1}. {q}</p>
                        <div className="grid grid-cols-5 gap-2">
                            {scale.map(([value, label]) => (
                                <button
                                    key={value}
                                    onClick={() => setAnswers(prev => ({ ...prev, [`q${i + 1}`]: value }))}
                                    className={`px-2 py-3 rounded-xl text-xs text-center font-semibold transition-colors
                                        ${answers[`q${i + 1}`] === value
                                            ? 'bg-primary text-on-primary'
                                            : 'bg-surface-container text-on-surface-variant hover:bg-primary/10'}`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </Card>
                ))}

                <Button className="w-full" disabled={!allAnswered || loading} onClick={handleSubmit}>
                    {loading ? 'Calculating...' : 'See Results'}
                </Button>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/AssessmentController.php resources/js/Pages/Assessments/
git commit -m "feat: add assessment controller and frontend pages (BMI, Diabetes, Stress)"
```

---

### Task 12: Chat Backend (Controller, Reverb Events, AI Agent)

**Files:**
- Create: `C:\Users\lenovo\diego\app\Http\Controllers\ChatController.php`
- Create: `C:\Users\lenovo\diego\app\AI\HealthConsultantAgent.php`
- Create: `C:\Users\lenovo\diego\app\Events\MessageChunk.php`

- [ ] **Step 1: Create MessageChunk event**

```php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class MessageChunk implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public string $userId,
        public string $sessionId,
        public string $chunk,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel('chat.' . $this->userId);
    }

    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'chunk' => $this->chunk,
        ];
    }
}
```

- [ ] **Step 2: Create HealthConsultantAgent**

```php
<?php

namespace App\AI;

use App\Events\MessageChunk;
use Illuminate\Support\Facades\AI;
use Illuminate\Support\Facades\Cache;

class HealthConsultantAgent
{
    private string $systemPrompt = <<<PROMPT
You are Healy AI Consultant, a health education and wellness assistant.

CORE RULES:
1. NEVER prescribe prescription medications or controlled substances
2. NEVER provide a definitive diagnosis of chronic or acute diseases
3. ALWAYS include this disclaimer at the start and end of conversation:
   "Healy AI Consultant provides educational health information only and does not replace professional medical diagnosis, examination, or treatment."
4. If the user describes emergency symptoms (chest pain, severe shortness of breath, sudden numbness, etc.), immediately advise them to call emergency services
5. Stay within general health information, wellness tips, and educational content
6. For any specific medical concerns, always recommend consulting a licensed healthcare provider
7. Be empathetic, clear, and use simple language accessible to all ages
PROMPT;

    public function ask(string $userId, string $sessionId, string $message): string
    {
        $cacheKey = "chat:{$sessionId}";
        $history = Cache::get($cacheKey, []);

        $fullResponse = '';

        AI::chat()
            ->system($this->systemPrompt)
            ->messages(array_merge($history, [['role' => 'user', 'content' => $message]]))
            ->stream(function (string $chunk, array $metadata) use ($userId, $sessionId, &$fullResponse) {
                $fullResponse .= $chunk;
                broadcast(new MessageChunk($userId, $sessionId, $chunk));
            })
            ->create();

        $history[] = ['role' => 'user', 'content' => $message];
        $history[] = ['role' => 'assistant', 'content' => $fullResponse];

        Cache::put($cacheKey, $history, 1800);

        return $fullResponse;
    }
}
```

- [ ] **Step 3: Create ChatController**

```php
<?php

namespace App\Http\Controllers;

use App\AI\HealthConsultantAgent;
use App\Models\ChatLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function index()
    {
        $recentSessions = ChatLog::where('user_id', auth()->id())
            ->where('role', 'user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('session_id')
            ->take(10)
            ->map(fn ($msgs) => [
                'session_id' => $msgs->first()->session_id,
                'preview' => Str::limit($msgs->first()->content, 60),
                'created_at' => $msgs->first()->created_at,
            ])
            ->values();

        return inertia('Chat/Index', [
            'recentSessions' => $recentSessions,
        ]);
    }

    public function send(Request $request, HealthConsultantAgent $agent)
    {
        $data = $request->validate([
            'message' => 'required|string|max:2000',
            'session_id' => 'nullable|string',
        ]);

        $userId = auth()->id();
        $sessionId = $data['session_id'] ?? Str::uuid()->toString();

        ChatLog::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'session_id' => $sessionId,
            'role' => 'user',
            'content' => $data['message'],
        ]);

        $response = $agent->ask($userId, $sessionId, $data['message']);

        ChatLog::create([
            'id' => Str::uuid(),
            'user_id' => $userId,
            'session_id' => $sessionId,
            'role' => 'assistant',
            'content' => $response,
        ]);

        return response()->json([
            'session_id' => $sessionId,
        ]);
    }

    public function history(Request $request)
    {
        $data = $request->validate(['session_id' => 'required|string']);

        $messages = ChatLog::where('user_id', auth()->id())
            ->where('session_id', $data['session_id'])
            ->orderBy('created_at')
            ->get(['role', 'content', 'created_at']);

        return response()->json($messages);
    }
}
```

- [ ] **Step 4: Publish Reverb config and install Echo**

Run:
```bash
php artisan vendor:publish --tag=reverb-config
npm install laravel-echo pusher-js
```

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/ChatController.php app/AI/ app/Events/MessageChunk.php
git commit -m "feat: add chat controller, AI agent, and Reverb streaming event"
```

---

### Task 13: Chat Frontend Components & Page

**Files:**
- Create: `C:\Users\lenovo\diego\resources\js\Components\Chat\ChatMessage.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Components\Chat\ChatInput.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Components\Chat\DisclaimerBanner.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Chat\Index.tsx`
- Create: `C:\Users\lenovo\diego\resources\js\hooks\useReverb.ts`

- [ ] **Step 1: Create DisclaimerBanner**

`resources/js/Components/Chat/DisclaimerBanner.tsx`:

```tsx
export default function DisclaimerBanner() {
    return (
        <div className="bg-secondary/5 border border-secondary/10 rounded-2xl px-5 py-3">
            <p className="text-xs text-secondary font-[family-name:var(--font-family-body)] leading-relaxed">
                Healy AI Consultant provides educational health information only and does not replace
                professional medical diagnosis, examination, or treatment. If you are experiencing a
                medical emergency, please call emergency services immediately.
            </p>
        </div>
    );
}
```

- [ ] **Step 2: Create ChatMessage**

`resources/js/Components/Chat/ChatMessage.tsx`:

```tsx
import Card from '@/Components/ui/Card';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

export default function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            {isUser ? (
                <div className="max-w-[80%] bg-primary text-on-primary px-5 py-3 rounded-[24px] rounded-br-md text-sm leading-relaxed">
                    {content}
                </div>
            ) : (
                <div className="max-w-[80%]">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs">H</span>
                        <span className="text-xs font-semibold text-secondary">Healy AI</span>
                    </div>
                    <div className="bg-white px-5 py-3 rounded-[24px] rounded-bl-md text-sm leading-relaxed text-on-surface shadow-sm">
                        {content}
                        {isStreaming && <span className="inline-block w-1.5 h-4 bg-primary ml-0.5 animate-pulse" />}
                    </div>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Step 3: Create ChatInput**

`resources/js/Components/Chat/ChatInput.tsx`:

```tsx
import { useState } from 'react';
import Button from '@/Components/ui/Button';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input.trim());
        setInput('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Describe your symptoms or ask a health question..."
                disabled={disabled}
                className="flex-1 rounded-full border border-outline bg-surface px-5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
            <Button type="submit" disabled={disabled || !input.trim()} size="md">
                Send
            </Button>
        </form>
    );
}
```

- [ ] **Step 4: Create Chat Index page**

`resources/js/Pages/Chat/Index.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';
import DisclaimerBanner from '@/Components/Chat/DisclaimerBanner';
import ChatMessage from '@/Components/Chat/ChatMessage';
import ChatInput from '@/Components/Chat/ChatInput';

interface ChatMessageData {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatProps {
    recentSessions: Array<{ session_id: string; preview: string; created_at: string }>;
}

export default function Index({ recentSessions }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [streamingContent, setStreamingContent] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingContent]);

    const handleSend = useCallback(async (message: string) => {
        setMessages(prev => [...prev, { role: 'user', content: message }]);
        setIsStreaming(true);
        setStreamingContent('');
        setLoading(true);

        const echo = (window as any).Echo;
        if (echo && sessionId) {
            echo.leave(`chat.${(window as any).userId}`);
        }

        try {
            const res = await fetch('/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
                },
                body: JSON.stringify({ message, session_id: sessionId }),
            });
            const data = await res.json();
            const newSessionId = data.session_id;
            setSessionId(newSessionId);

            if (echo) {
                const userId = (window as any).userId;
                echo.channel(`chat.${userId}`)
                    .listen('MessageChunk', (e: any) => {
                        if (e.session_id === newSessionId) {
                            setStreamingContent(prev => prev + e.chunk);
                        }
                    });
            }
        } catch { /* ignore */ } finally {
            setLoading(false);
            setIsStreaming(false);
            if (streamingContent) {
                setMessages(prev => [...prev, { role: 'assistant', content: streamingContent }]);
                setStreamingContent('');
            }
        }
    }, [sessionId, streamingContent]);

    useEffect(() => {
        if (!loading && streamingContent && !isStreaming) {
            setMessages(prev => [...prev, { role: 'assistant', content: streamingContent }]);
            setStreamingContent('');
        }
    }, [loading, isStreaming, streamingContent]);

    return (
        <AppLayout>
            <Head title="AI Consultant - Healy" />
            <div className="max-w-3xl mx-auto h-[calc(100vh-10rem)] flex flex-col">
                <div className="mb-4">
                    <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Healy AI Consultant</h1>
                    <DisclaimerBanner />
                </div>

                <Card padding={false} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                        {messages.length === 0 && !isStreaming && (
                            <div className="flex items-center justify-center h-full text-center">
                                <div>
                                    <p className="text-4xl mb-3">💬</p>
                                    <p className="text-on-surface-variant text-sm">Ask me anything about your health!</p>
                                    <p className="text-xs text-on-surface-variant/60 mt-1">I can help with symptoms, nutrition, wellness, and more</p>
                                </div>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <ChatMessage key={i} role={msg.role} content={msg.content} />
                        ))}
                        {isStreaming && streamingContent && (
                            <ChatMessage role="assistant" content={streamingContent} isStreaming />
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="border-t border-outline-variant/20 px-6 py-4">
                        <ChatInput onSend={handleSend} disabled={isStreaming} />
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 5: Create Reverb Echo setup**

`resources/js/hooks/useReverb.ts`:

```ts
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

(window as any).Pusher = Pusher;

export function createEcho(userId: string, token: string): Echo {
    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        authorizer: (channel: any) => ({
            authorize: (socketId: string, callback: Function) => {
                fetch('/api/broadcasting/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        socket_id: socketId,
                        channel_name: channel.name,
                    }),
                })
                    .then(res => res.json())
                    .then(data => callback(false, data))
                    .catch(err => callback(true, err));
            },
        }),
        wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
        wsPort: parseInt(import.meta.env.VITE_REVERB_PORT ?? '8080'),
        wssPort: 443,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
    });
}
```

- [ ] **Step 6: Commit**

```bash
git add resources/js/Pages/Chat/ resources/js/Components/Chat/ resources/js/hooks/useReverb.ts
git commit -m "feat: add chat UI with Reverb streaming and disclaimer banner"
```

---

### Task 14: Admin Dashboard (Basic)

**Files:**
- Create: `C:\Users\lenovo\diego\app\Http\Controllers\AdminController.php`
- Create: `C:\Users\lenovo\diego\resources\js\Pages\Admin\Dashboard.tsx`

- [ ] **Step 1: Create AdminController**

```php
<?php

namespace App\Http\Controllers;

use App\Models\HealthAssessment;
use App\Models\User;

class AdminController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();
        $totalAssessments = HealthAssessment::count();
        $assessmentsByType = HealthAssessment::selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type');

        return inertia('Admin/Dashboard', [
            'totalUsers' => $totalUsers,
            'totalAssessments' => $totalAssessments,
            'assessmentsByType' => $assessmentsByType,
        ]);
    }
}
```

- [ ] **Step 2: Create admin route**

Add to `routes/web.php` inside the supabase.auth group:

```php
Route::get('/admin', [\App\Http\Controllers\AdminController::class, 'index'])
    ->name('admin.dashboard');
```

- [ ] **Step 3: Create admin page**

`resources/js/Pages/Admin/Dashboard.tsx`:

```tsx
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import Card from '@/Components/ui/Card';

interface AdminProps {
    totalUsers: number;
    totalAssessments: number;
    assessmentsByType: Record<string, number>;
}

export default function AdminDashboard({ totalUsers, totalAssessments, assessmentsByType }: AdminProps) {
    return (
        <AppLayout>
            <Head title="Admin - Healy" />
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-family-heading)]">Admin Dashboard</h1>
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <p className="text-sm text-on-surface-variant">Total Users</p>
                        <p className="text-3xl font-bold text-primary font-[family-name:var(--font-family-heading)]">{totalUsers}</p>
                    </Card>
                    <Card>
                        <p className="text-sm text-on-surface-variant">Total Assessments</p>
                        <p className="text-3xl font-bold text-secondary font-[family-name:var(--font-family-heading)]">{totalAssessments}</p>
                    </Card>
                </div>
                <Card>
                    <h2 className="text-lg font-semibold mb-4 font-[family-name:var(--font-family-heading)]">Assessments by Type</h2>
                    <div className="space-y-3">
                        {Object.entries(assessmentsByType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between py-2 border-b border-outline-variant/20 last:border-0">
                                <span className="capitalize text-sm">{type.replace('_', ' ')}</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/AdminController.php resources/js/Pages/Admin/
git commit -m "feat: add basic admin dashboard"
```

---

### Task 15: Tests

**Files:**
- Create: `C:\Users\lenovo\diego\tests\Unit\Services\Assessments\BMIEngineTest.php`
- Create: `C:\Users\lenovo\diego\tests\Unit\Services\Assessments\DiabetesRiskTest.php`
- Create: `C:\Users\lenovo\diego\tests\Unit\Services\Assessments\StressPSS10Test.php`
- Modify: `C:\Users\lenovo\diego\phpunit.xml` (if needed)

- [ ] **Step 1: Create BMIEngineTest**

```php
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
```

- [ ] **Step 2: Create DiabetesRiskTest**

```php
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
```

- [ ] **Step 3: Create StressPSS10Test**

```php
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
        $data = array_combine(
            array_map(fn($i) => "q{$i}", range(1, 10)),
            array_fill(0, 10, 0)
        );
        $result = $this->engine->calculate($data);
        $this->assertEquals('low', $result->category);
    }

    #[Test]
    public function it_returns_high_stress_for_maximal_answers()
    {
        $data = array_combine(
            array_map(fn($i) => "q{$i}", range(1, 10)),
            array_fill(0, 10, 4)
        );
        $result = $this->engine->calculate($data);
        $this->assertEquals('high', $result->category);
    }

    #[Test]
    public function it_reverses_scores_correctly()
    {
        $data = ['q1' => 0, 'q2' => 0, 'q3' => 0, 'q4' => 4, 'q5' => 4, 'q6' => 0, 'q7' => 4, 'q8' => 4, 'q9' => 0, 'q10' => 0];
        $result = $this->engine->calculate($data);
        // q4: 4 -> 0, q5: 4 -> 0, q7: 4 -> 0, q8: 4 -> 0 => total = 0
        $this->assertEquals(0, $result->score);
        $this->assertEquals('low', $result->category);
    }

    #[Test]
    public function it_returns_type()
    {
        $this->assertEquals('stress_pss10', $this->engine->type());
    }
}
```

- [ ] **Step 4: Run tests**

```bash
php artisan test --filter=BMIEngineTest
php artisan test --filter=DiabetesRiskTest
php artisan test --filter=StressPSS10Test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add tests/Unit/Services/Assessments/
git commit -m "test: add unit tests for BMI, Diabetes, and Stress assessment engines"
```

---

### Task 16: Final Integration & Build Verification

**Files:**
- Modify: `C:\Users\lenovo\diego\config\reverb.php`

- [ ] **Step 1: Configure Reverb for database driver**

Edit or verify `config/reverb.php`:

```php
'driver' => env('REVERB_DRIVER', 'database'),
```

- [ ] **Step 2: Build frontend**

```bash
npm run build
```

Expected: Vite builds successfully with no errors.

- [ ] **Step 3: Start dev server to verify**

```bash
composer dev
```

Expected: Laravel server starts on localhost:8000, Vite HMR on 5173, Reverb on 8080.

- [ ] **Step 4: Run full test suite**

```bash
php artisan test
```

Expected: All tests pass.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: final integration - Healy platform MVP complete"
```
