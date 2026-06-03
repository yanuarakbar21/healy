# Healy Platform Design Document

**Versi:** 1.0
**Tanggal:** 4 Juni 2026
**Status:** Final Draft

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  BROWSER                         │
│  Inertia React SPA  <── WebSocket (Reverb) ──┐  │
│         │                                     │  │
└─────────┼─────────────────────────────────────┘  │
          │ HTTP (JSON/Inertia)                    │
          ▼                                        │
┌──────────────────┐        ┌──────────────────┐   │
│  LARAVEL 13      │        │  LARAVEL REVERB  │◄──┘
│  - Routes/Ctrl   │        │  - Chat Streaming│
│  - AI SDK        │        │  - Database Drv  │
│  - Middleware JWT │        └──────────────────┘
│  - Cache::touch  │                 │
└──────┬───────────┘                 │
       │                             │
       ▼                             ▼
┌──────────────────────────────────────────┐
│           SUPABASE (PostgreSQL)           │
│  - Auth (JWT, Google OAuth)              │
│  - RLS per UUID                          │
│  - Tables                                │
└──────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology | Role |
|-----------|-----------|------|
| Backend | Laravel 13.x (PHP 8.3+) | API routing, business logic, AI proxy, scoring engines |
| Frontend | Inertia.js + React 19 | SPA interface, real-time chat UI, interactive forms |
| Database & Auth | Supabase (PostgreSQL) | Auth (JWT/OAuth), data storage, RLS |
| Real-time | Laravel Reverb (Database Driver) | WebSocket streaming for AI chat |
| AI Engine | OpenAI GPT-4o via Laravel AI SDK | Natural language health consultation |
| Styling | Tailwind CSS 4 | Utility-first CSS with design tokens |
| Build | Vite 8 | Asset bundling, HMR |

### Folder Structure

```
diego/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── AssessmentController.php
│   │   │   ├── ChatController.php
│   │   │   └── ProfileController.php
│   │   ├── Middleware/
│   │   │   └── VerifySupabaseToken.php
│   │   └── Requests/
│   │       ├── BMIRequest.php
│   │       ├── DiabetesRequest.php
│   │       ├── StressRequest.php
│   │       └── ChatRequest.php
│   ├── Services/
│   │   └── Assessments/
│   │       ├── AssessmentRegistry.php
│   │       ├── BMIEngine.php
│   │       ├── DiabetesRiskEngine.php
│   │       └── StressPSS10Engine.php
│   ├── AI/
│   │   └── HealthConsultantAgent.php
│   └── Models/
│       ├── User.php
│       ├── Profile.php
│       ├── HealthAssessment.php
│       ├── QuestionnaireTemplate.php
│       └── ChatLog.php
├── resources/js/
│   ├── Pages/
│   │   ├── Welcome.tsx
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Profile/
│   │   │   └── Complete.tsx
│   │   ├── Assessments/
│   │   │   ├── Index.tsx
│   │   │   ├── BMI.tsx
│   │   │   ├── Diabetes.tsx
│   │   │   └── Stress.tsx
│   │   └── Chat/
│   │       └── Index.tsx
│   ├── Components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── Chip.tsx
│   │   ├── AppLayout.tsx
│   │   ├── Chat/
│   │   │   ├── ChatMessage.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── DisclaimerBanner.tsx
│   │   │   └── StreamingText.tsx
│   │   ├── AssessmentCard.tsx
│   │   └── HealthChart.tsx
│   ├── hooks/
│   │   ├── useSupabase.ts
│   │   └── useReverb.ts
│   ├── types/
│   │   └── index.ts
│   └── app.tsx
├── database/
│   └── migrations/
│       ├── 0001_create_profiles_table.php
│       ├── 0002_create_questionnaire_templates_table.php
│       ├── 0003_create_health_assessments_table.php
│       ├── 0004_create_chat_logs_table.php
│       └── 0005_seed_questionnaires.php
├── routes/
│   ├── web.php          # Inertia page routes
│   ├── api.php          # API routes
│   └── channels.php     # Reverb channel auth
└── tests/
    ├── Feature/Assessments/
    ├── Feature/Chat/
    ├── Feature/Auth/
    └── Unit/Services/
```

## 2. Database Schema (Supabase PostgreSQL)

### users (managed by Supabase Auth)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID PK | Supabase auto-managed |
| email | TEXT UNIQUE | User email |
| Supabase metadata | JSONB | Identity data, OAuth profiles |

### profiles

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID PK | FK to auth.users(id) |
| full_name | TEXT | NOT NULL |
| birth_date | DATE | NOT NULL |
| gender | TEXT | CHECK IN ('male','female','other') |
| height_cm | DECIMAL(5,1) | NULLABLE |
| weight_kg | DECIMAL(5,1) | NULLABLE |
| allergies | TEXT | NULLABLE |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### health_assessments

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID PK | DEFAULT gen_random_uuid() |
| user_id | UUID FK | REFERENCES profiles(id) |
| type | TEXT | CHECK IN ('bmi','diabetes_risk','stress_pss10') |
| score | DECIMAL(5,2) | NOT NULL |
| category | TEXT | NOT NULL |
| responses | JSONB | Raw answers for audit |
| recommendation | TEXT | NULLABLE |
| taken_at | TIMESTAMPTZ | DEFAULT now() |

### questionnaire_templates

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID PK | DEFAULT gen_random_uuid() |
| type | TEXT | UNIQUE, CHECK IN ('bmi','diabetes_risk','stress_pss10') |
| questions | JSONB | NOT NULL |
| scoring_rules | JSONB | NOT NULL |
| version | INT | DEFAULT 1 |
| active | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMPTZ | DEFAULT now() |
| updated_at | TIMESTAMPTZ | DEFAULT now() |

### chat_logs

| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID PK | DEFAULT gen_random_uuid() |
| user_id | UUID FK | REFERENCES profiles(id) |
| session_id | TEXT | NOT NULL |
| role | TEXT | CHECK IN ('user','assistant','system') |
| content | TEXT | NOT NULL |
| encrypted | BOOLEAN | DEFAULT true |
| metadata | JSONB | NULLABLE (token count, model) |
| created_at | TIMESTAMPTZ | DEFAULT now() |

### RLS Policies

- `profiles`: `user_id = auth.uid()`
- `health_assessments`: `user_id = auth.uid()`
- `chat_logs`: `user_id = auth.uid()`
- `questionnaire_templates`: ALL authenticated users SELECT only

## 3. Auth & Middleware Flow

### Authentication Flow

```
1. User → Login/Register via Supabase Auth JS client
2. Supabase → Return JWT access token + refresh token
3. Frontend → Store token, attach to every request (Authorization: Bearer <jwt>)
4. Laravel VerifySupabaseToken middleware:
   a. Extract JWT from Authorization header
   b. Validate JWT with Supabase (verify signature, expiry)
   c. Extract user UUID from JWT claims
   d. Find or create local User + Profile record
   e. Set auth()->user() for the request
5. All protected routes use this middleware
```

### Middleware Registration

```php
// bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias('supabase.auth', \App\Http\Middleware\VerifySupabaseToken::class);
})
```

### Routes

```php
// web.php - Inertia page routes
Route::middleware('supabase.auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/assessments', [AssessmentController::class, 'index'])->name('assessments.index');
    Route::get('/assessments/bmi', [AssessmentController::class, 'bmi'])->name('assessments.bmi');
    Route::get('/assessments/diabetes', [AssessmentController::class, 'diabetes'])->name('assessments.diabetes');
    Route::get('/assessments/stress', [AssessmentController::class, 'stress'])->name('assessments.stress');
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
});

// api.php - API endpoints
Route::middleware('supabase.auth')->group(function () {
    Route::post('/assessments/bmi', [AssessmentController::class, 'calculateBMI']);
    Route::post('/assessments/diabetes', [AssessmentController::class, 'calculateDiabetes']);
    Route::post('/assessments/stress', [AssessmentController::class, 'calculateStress']);
    Route::get('/assessments/history', [AssessmentController::class, 'history']);
    Route::post('/chat/send', [ChatController::class, 'send']);
    Route::get('/chat/history', [ChatController::class, 'history']);
});

// channels.php - Reverb auth
use App\Models\Profile;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('chat.{userId}', function (Profile $profile, $userId) {
    return (string) $profile->id === (string) $userId;
});
```

### Profile Completion Guard

- After login, if `profiles.full_name` is null, redirect to `/profile/complete`
- Implemented via middleware or Inertia shared data check

## 4. Frontend Design (Inertia React)

### Design System (from design.md)

**Colors (Material 3-based):**
- Primary (Healy Green): `#006d3e` — CTAs, success states
- Secondary (Calming Teal): `#026783` — navigation, info elements
- Tertiary (Soft Sage): `#4b6454` — decorative elements, icon backgrounds
- Surface (Warm Cream): `#faf9f6` — background
- On-surface: `#1a1c1a` — primary text
- Error: `#ba1a1a` — validation errors
- Outline: `#6d7a6f` — borders

**Typography:**
- Headlines: Quicksand (700/600 weight)
- Body/UI: Plus Jakarta Sans (400/600 weight)
- Min font size: 12px

**Shapes:**
- Buttons/Chips: Pill (fully rounded)
- Cards: 24px+ radius
- Inputs: Pill shape

**Spacing:**
- Base unit: 8px
- Mobile margins: 20px
- Desktop max-width: 1200px, margins: 120px

**Elevation:**
- Cards: white bg, high-blur/low-opacity shadow with teal tint
- Modals: deeper shadow, 12px backdrop blur

### Page Components

| Page | Route | Description |
|------|-------|-------------|
| Welcome | `/` | Landing page with login/register |
| Login | `/login` | Email/password + Google OAuth |
| Register | `/register` | Registration form |
| Dashboard | `/dashboard` | Home after login, health history chart |
| Profile Complete | `/profile/complete` | Initial clinical data form |
| Assessments Index | `/assessments` | Choose assessment type |
| BMI | `/assessments/bmi` | BMI calculator |
| Diabetes | `/assessments/diabetes` | Diabetes risk questionnaire |
| Stress | `/assessments/stress` | PSS-10 stress assessment |
| Chat | `/chat` | AI Consultant interface |

### UI Components

| Component | Usage | Styling |
|-----------|-------|---------|
| Button (`ui/Button.tsx`) | All CTAs | Pill shape, Healy Green primary, Teal secondary, Sage ghost |
| Card (`ui/Card.tsx`) | Content containers | White bg, 24px radius, soft shadow, 24px padding |
| Input (`ui/Input.tsx`) | Form fields | Sage border 1.5px, Cream fill, Green focus glow |
| ProgressBar (`ui/ProgressBar.tsx`) | Health goals | Thick rounded, Sage track, Green/Teal filler |
| Chip (`ui/Chip.tsx`) | Health tags | Pill shape, pastel bg, deep tone text |
| AppLayout | Main layout | Navbar + sidebar, cream bg, Plus Jakarta Sans body |

### Chat Components

| Component | Description |
|-----------|-------------|
| ChatMessage | Message bubble (user left, assistant right), role-based styling |
| ChatInput | Text input + send button, pill-shaped |
| DisclaimerBanner | Fixed banner top/bottom of chat area with legal disclaimer text |
| StreamingText | Renders text progressively as chunks arrive via Reverb |

## 5. Health Assessment Module

### Service Architecture

```php
// AssessmentRegistry.php
class AssessmentRegistry
{
    protected array $engines = [];

    public function register(string $type, AssessmentEngine $engine): void
    public function get(string $type): AssessmentEngine
    public function all(): array
}

// AssessmentEngine interface
interface AssessmentEngine
{
    public function type(): string;
    public function calculate(array $data): AssessmentResult;
    public function questions(): array;
}
```

### BMI Engine (`BMIEngine.php`)

```
Formula: BMI = weight_kg / (height_cm / 100)^2

Categories:
- < 18.5: Underweight
- 18.5 - 24.9: Normal
- 25.0 - 29.9: Overweight
- >= 30.0: Obese

Input: height_cm, weight_kg (from profile or manual)
Output: score, category, recommendation text
```

### Diabetes Risk Engine (`DiabetesRiskEngine.php`)

```
Input: 7 questions
- Age group
- Family history of diabetes
- Physical activity level
- Diet (vegetable/fruit intake)
- Waist circumference range
- History of hypertension
- Previous high blood sugar

Scoring: weighted sum → 0-100
Categories: Low (<30), Moderate (30-60), High (>60)
Output: score, category, prevention recommendations
```

### Stress PSS-10 Engine (`StressPSS10Engine.php`)

```
Input: 10 questions (standard PSS-10)
- Each scored 0 (Never) to 4 (Very Often)
- Questions 4,5,7,8: reverse scored
- Total: sum of all 10 items (range 0-40)

Categories:
- 0-13: Low stress
- 14-26: Moderate stress
- 27-40: High stress

Output: score, category, coping recommendations
```

### Data Flow

```
User submits questionnaire → AssessmentController
→ Validates request (AssessmentRequest)
→ Resolves engine from AssessmentRegistry
→ Engine.calculate(data) → returns AssessmentResult
→ Stores to health_assessments (user_id, type, score, category, responses)
→ Returns result to frontend
→ Frontend renders AssessmentCard with results + recommendation
```

## 6. AI Chatbot Module

### Chat Flow

```
1. User types message → POST /api/chat/send
2. ChatController::send():
   a. Create chat_log entry (role: 'user')
   b. Load session history from Cache::get("chat:{session_id}")
   c. Build messages array with system prompt + history + new user message
   d. Call Laravel AI SDK → stream to OpenAI GPT-4o
   e. For each chunk:
      - Broadcast to Reverb private channel "chat.{user_id}"
      - Accumulate full response
   f. After stream completes:
      - Store full response to chat_log (role: 'assistant')
      - Update cache with Cache::touch("chat:{session_id}")
3. Frontend receives chunks via Reverb → StreamingText component renders progressively
```

### Laravel AI SDK Usage

```php
use Illuminate\Support\Facades\AI;

$result = AI::chat()
    ->system(config('healy.ai.system_prompt'))
    ->messages($history)
    ->stream(function (string $chunk, array $metadata) use ($userId, $sessionId) {
        broadcast(new MessageChunk($userId, $sessionId, $chunk));
    })
    ->create();
```

### System Prompt (AI Guardrails)

```
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
```

### Cache-based Session Management

```php
// Store session messages with 30-minute TTL
Cache::put("chat:{$sessionId}", $messages, 1800);

// Extend TTL on each new message (Laravel 13 Cache::touch)
Cache::touch("chat:{$sessionId}");
```

### Reverb Channel

```
Private channel: chat.{userId}
- Only the authenticated user can listen
- Authenticated via routes/channels.php with Laravel auth
- Each chunk broadcast as MessageChunk event
```

### Disclaimer Banner

Permanently displayed at the top and bottom of the chat interface:
"Healy AI Consultant provides educational health information only and does not replace professional medical diagnosis, examination, or treatment."

## 7. Security

| Measure | Implementation |
|---------|---------------|
| RLS | Supabase Row Level Security on all tables filtered by `auth.uid()` |
| API Proxy | All OpenAI requests go through Laravel; API keys never exposed to client |
| CSRF | Laravel 13 PreventRequestForgery for all state-changing requests |
| JWT Validation | Every API request validated via VerifySupabaseToken middleware |
| HTTPS | TLS 1.3 enforced in production |
| Chat Encryption | All chat_logs content encrypted at rest in Supabase |

## 8. Testing Strategy

### Unit Tests
- `BMIEngineTest`: Verify formula calculation for all BMI ranges
- `DiabetesRiskTest`: Test scoring algorithm with known inputs
- `StressPSS10Test`: Test reverse scoring and total calculation
- `AssessmentRegistryTest`: Test engine registration and resolution

### Feature Tests
- `SupabaseMiddlewareTest`: Test JWT validation, missing token, expired token
- `AssessmentFlowTest`: Full assessment submission → storage → result
- `AIConsultantTest`: Test proxy, system prompt injection, stream handling

### Browser Tests (Laravel Dusk)
- `LoginTest`: Login flow, Google OAuth
- `AssessmentFlowTest`: Complete assessment journey
- `ChatFlowTest`: Send message, receive stream, disclaimer visible

## 9. Environment Configuration

```env
APP_NAME=Healy
APP_ENV=local|production

# Database (Supabase)
DB_CONNECTION=pgsql
DB_HOST=<supabase-host>
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=<supabase-user>
DB_PASSWORD=<supabase-password>

# Supabase Auth
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_KEY=<service-role-key>

# OpenAI
OPENAI_API_KEY=<openai-key>
OPENAI_MODEL=gpt-4o

# Reverb
REVERB_APP_ID=<app-id>
REVERB_APP_KEY=<app-key>
REVERB_APP_SECRET=<app-secret>
REVERB_HOST=localhost
REVERB_PORT=8080

# Laravel AI SDK
AI_PROVIDER=openai
```

## 10. MVP Constraints (Phase 1 Scope)

**In scope for v1.0:**
- Login/Register with Email + Google OAuth
- Clinical profile completion (name, DOB, gender, height, weight, allergies)
- BMI calculator
- Diabetes risk screening (7 questions)
- Stress PSS-10 assessment (10 questions)
- AI Consultant chat with streaming via Reverb
- Basic dashboard with assessment history
- Admin dashboard (basic: user count, assessment metrics)

**Out of scope (v2.0+):**
- Doctor appointment booking
- Lab integration
- Prescription management
- Multi-language support
- Mobile apps

## 11. Installation & Setup

```bash
# 1. Clone and install
composer install
npm install

# 2. Environment
cp .env.example .env
# Fill in SUPABASE_*, OPENAI_API_KEY, REVERB_* values

# 3. Database migrations (targets Supabase PostgreSQL)
php artisan migrate

# 4. Seed questionnaires
php artisan db:seed --class=QuestionnaireSeeder

# 5. Development
composer dev  # runs server + queue + logs + vite concurrently

# 6. Build for production
npm run build
```

## 12. Deployment

- **Laravel 13**: Laravel Forge / VPS (DigitalOcean, AWS EC2)
- **Database**: Supabase managed PostgreSQL
- **Realtime**: Laravel Reverb with Database Driver (no Redis)
- **Queue**: Laravel database queue for async processing
- **Domain**: Configured with HTTPS/TLS 1.3
