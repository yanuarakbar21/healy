# Laporan Proyek: Healy — Asisten Kesehatan Digital Berbasis AI

**Tanggal:** 4 Juni 2026  
**Versi:** 1.0  
**Repositori:** `yanuarakbar21/healy`  
**Domain:** http://127.0.0.1:8000 (pengembangan)

---

## 1. Deskripsi Proyek

Healy adalah platform kesehatan digital berbasis Artificial Intelligence (AI) yang dirancang untuk membantu pengguna Indonesia dalam memantau dan mengelola kesehatan diri dan keluarga. Platform ini menyediakan konsultasi AI 24/7, penilaian kesehatan mandiri (self-assessment), artikel kesehatan terkini dari sumber terpercaya, dan dasbor kesehatan yang komprehensif.

### Tujuan Utama
- Memberikan akses konsultasi kesehatan yang cepat dan akurat melalui AI
- Memungkinkan pengguna melakukan skrining kesehatan mandiri menggunakan algoritme terverifikasi
- Menyediakan konten edukasi kesehatan yang selalu diperbarui dari sumber nasional dan internasional
- Memonitor riwayat kesehatan secara terpusat

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Inertia + React)                │
│  Welcome │ Login/Register │ Dashboard │ Assessments │ Chat  │
│  Profile │ Admin │ Tips/Artikel                             │
│  ┌─────────────────────────────────────┐                   │
│  │         Tailwind CSS v4             │                   │
│  │  Stitch Design System (Material 3)  │                   │
│  │  Healy Green / Teal / Sage palette  │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────┬───────────────────────────────────────┘
                      │ Inertia SSR
┌─────────────────────┴───────────────────────────────────────┐
│                 Laravel 13 (PHP 8.3)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │
│  │Controllers│ │ Services │ │Middleware│ │ Artisan CLI   │ │
│  └──────────┘ └──────────┘ └──────────┘ └───────────────┘ │
└─────────┬────────────────────────────────────────┬──────────┘
          │                                        │
┌─────────┴──────────┐              ┌──────────────┴───────────┐
│  Supabase (Auth)   │              │  SQLite (development)    │
│  JWT + Service Key │              │  PostgreSQL (production) │
│  RLS Policy Ready  │              │                           │
└────────────────────┘              └───────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Services & Integrations                  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐ │
│  │  Groq   │ │ GitHub   │ │ Reverb   │ │ 10 RSS Feeds  │ │
│  │ (AI txt)│ │ Models   │ │(WebSocket│ │ WHO, Harvard, │ │
│  │         │ │ (Vision) │ │ Database)│ │ Kemkes, etc   │ │
│  └─────────┘ └──────────┘ └──────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Tech Stack Lengkap

### Backend
| Komponen | Teknologi | Versi | Keterangan |
|----------|-----------|-------|------------|
| Framework | Laravel | 13.x | PHP 8.3+, full-stack MVC |
| Bahasa | PHP | ^8.3 | |
| Database (dev) | SQLite | | File-based, untuk pengembangan |
| Database (prod) | Supabase PostgreSQL | | Rencana migrasi produksi |
| Auth | Supabase Auth | | JWT + Service Role Key |
| Realtime | Laravel Reverb | ^1.10 | WebSocket, driver Database |
| Session/Cache | Database driver | | Cache::touch() untuk chat |
| Queue | Database driver | | Untuk jobs async |
| AI SDK | Laravel AI | ^0.7.2 | Multi-provider abstraction |
| Testing | PHPUnit | ^12.5 | 37 tests, 96 assertions |

### Frontend
| Komponen | Teknologi | Versi | Keterangan |
|----------|-----------|-------|------------|
| Framework | React | ^19.2 | Server-side rendering via Inertia |
| Routing | Inertia.js | ^3.3 | Server-driven routing |
| Styling | Tailwind CSS | ^4.0 | Utility-first CSS |
| Build tool | Vite | ^8.0 | HMR + production build |
| Chart | Recharts | ^3.8 | Grafik dasbor |
| Icons | Material Symbols Outlined | | Google Font icons |
| Font | Quicksand + Plus Jakarta Sans | | Headings & body |

### AI & Integrasi
| Provider | Layanan | Model | Fungsi |
|----------|---------|-------|--------|
| **Groq** | AI Chat utama | `llama-3.1-8b-instant` | Konsultasi kesehatan teks |
| **GitHub Models** | Image Analysis | GPT-4o (vision) | Analisis gambar via REST API |
| **Supabase** | Auth & Database | - | Manajemen user + RLS |

### Testing
| Framework | Lingkup | Jumlah Test |
|-----------|---------|-------------|
| PHPUnit | Backend (unit + feature) | 37 tests, 96 assertions |
| Playwright | E2E Frontend | 46 tests |

---

## 4. Struktur Database

### Tabel Utama (12 migrasi)

| Tabel | Primary Key | Relasi | Deskripsi |
|-------|-------------|--------|-----------|
| `users` | UUID | → Profile (1:1) | Data user dari Supabase |
| `profiles` | UUID | → User (1:1), → HealthAssessment (1:N), → ChatLog (1:N) | Profil kesehatan pengguna |
| `health_articles` | UUID | → ArticleBookmark (1:N), → ArticleRead (1:N) | Artikel kesehatan dari RSS |
| `article_bookmarks` | UUID | → User + Article | Bookmark artikel |
| `article_reads` | UUID | → User + Article | Riwayat baca artikel |
| `chat_logs` | UUID | → Profile (N:1) | Riwayat percakapan AI |
| `health_assessments` | UUID | → Profile (N:1) | Hasil penilaian kesehatan |
| `questionnaire_templates` | UUID | - | Template kuesioner (BMI, diabetes, stress) |
| `sessions` | - | - | Session Laravel |
| `cache` / `cache_locks` | - | - | Cache system |
| `jobs` / `job_batches` / `failed_jobs` | - | - | Queue system |
| `personal_access_tokens` | - | - | Laravel Sanctum |

### Kolom Kunci pada `profiles`
- `full_name`, `birth_date`, `gender` (enum: male/female/other)
- `height_cm` (decimal), `weight_kg` (decimal)
- `allergies` (text)

### Kolom Kunci pada `health_assessments`
- `type` (string: bmi, diabetes_risk, stress_pss10)
- `score` (decimal), `category` (string)
- `responses` (JSONB), `recommendation` (text)

---

## 5. Fitur Aplikasi

### 5.1 Halaman Publik (Tanpa Login)

| Halaman | Route | Komponen | Fitur |
|---------|-------|----------|-------|
| **Beranda** | `/` | `Welcome.tsx` | Hero section, fitur unggulan (AI Consultant, Health Assessments, Dashboard Keluarga, Tips Harian), CTA, footer |
| **Login** | `/login` | `Auth/Login.tsx` | Form email + password, integrasi Supabase Auth |
| **Register** | `/register` | `Auth/Register.tsx` | Form nama + email + password, auto-confirm email via Admin API |

### 5.2 Fitur Terproteksi (Setelah Login)

#### Dasbor (`/dashboard`)
- Ringkasan profil pengguna
- Skor kesehatan komposit (dari latest assessments)
- Grafik riwayat kesehatan per jenis (BarChart via Recharts)
- Tips kesehatan terbaru (6 artikel, horizontal scroll)
- Navigasi ke semua fitur

#### Penilaian Kesehatan (`/assessments`)
| Tes | Route | Algoritme | Output |
|-----|-------|-----------|--------|
| **BMI** | `/assessments/bmi` | `BMIEngine` | Skor + Kategori (underweight/normal/overweight/obese) + Rekomendasi |
| **Diabetes** | `/assessments/diabetes` | `DiabetesRiskEngine` | Risiko (low/moderate/high) + Rekomendasi |
| **Stres (PSS-10)** | `/assessments/stress` | `StressPSS10Engine` | Tingkat stres (low/moderate/high) + Rekomendasi |

Setiap assessment:
- Form interaktif dengan pertanyaan per langkah
- Opsi dengan efek checkmark
- Hasil dengan skor, kategori, dan rekomendasi personal
- Riwayat tersimpan dan bisa dilihat di dasbor

#### AI Chat (`/chat`)
- Konsultasi kesehatan 24/7 dengan AI
- Dukungan upload gambar (analisis via GPT-4o)
- Dukungan input suara
- Riwayat sesi per grup (Hari Ini / Kemarin / 7 Hari / 30 Hari)
- Hapus sesi dengan konfirmasi modal
- Disclaimer medis di awal chat

#### Profil (`/profile`)
- Edit profil: nama, tanggal lahir, jenis kelamin
- Data antropometri: tinggi, berat badan
- Alergi
- Riwayat penilaian kesehatan

#### Tips Kesehatan (`/tips/{slug}`)
- Artikel dari 10 RSS feed internasional & Indonesia
- Diterjemahkan otomatis ke Bahasa Indonesia via Groq
- Kategorisasi otomatis: disease, nutrition, mental, exercise, general
- OG image fallback dengan animated gradient per kategori
- Auto-refresh berita setiap 30 menit via scheduler

#### Admin (`/admin`)
- Total users terdaftar
- Total assessments
- Distribusi assessment per jenis

### 5.3 Autentikasi & Keamanan
- Login via Supabase Auth (email + password)
- JWT token disimpan di localStorage
- Callback Laravel untuk konversi ke session
- Auto-confirm email via Supabase Admin API (service_role key)
- CSRF protection, kecuali endpoint callback & upload
- Middleware `supabase.auth` untuk proteksi route
- Logout hapus session + redirect ke beranda

### 5.4 Realtime & Komunikasi
- **Laravel Reverb** untuk WebSocket realtime
- Chat session management
- Queue worker untuk background jobs

---

## 6. Struktur Proyek

```
diego/
├── app/
│   ├── AI/
│   │   └── HealthConsultantAgent.php      # AI Agent untuk chat
│   ├── Console/Commands/
│   │   ├── RefreshNews.php                # Cron refresh artikel
│   │   └── FetchOgImages.php              # Fetch OG image manual
│   ├── Http/Controllers/
│   │   ├── AuthController.php             # Login/Register/Callback/Logout
│   │   ├── DashboardController.php        # Dasbor utama
│   │   ├── AssessmentController.php       # BMI/Diabetes/Stress
│   │   ├── ChatController.php             # Chat + upload
│   │   ├── ProfileController.php          # Edit profil
│   │   ├── NewsController.php             # Artikel + bookmark
│   │   └── AdminController.php            # Panel admin
│   ├── Http/Middleware/
│   │   ├── VerifySupabaseToken.php        # Auth middleware
│   │   └── HandleInertiaRequests.php      # Inertia shared data
│   ├── Models/
│   │   ├── User.php / Profile.php
│   │   ├── HealthArticle.php / ArticleBookmark.php / ArticleRead.php
│   │   ├── ChatLog.php / HealthAssessment.php
│   │   └── QuestionnaireTemplate.php
│   └── Services/
│       ├── ImageAnalyzer.php              # GPT-4o image analysis
│       ├── NewsFeedService.php            # RSS fetch + translate
│       └── Assessments/
│           ├── AssessmentEngine.php        # Interface + DTO
│           ├── AssessmentRegistry.php      # Registry pattern
│           ├── BMIEngine.php
│           ├── DiabetesRiskEngine.php
│           └── StressPSS10Engine.php
├── resources/
│   ├── css/app.css                        # Tailwind v4 + design tokens + animasi
│   ├── js/
│   │   ├── Pages/                         # 12 halaman React
│   │   ├── Components/                    # UI & feature components
│   │   ├── Layouts/AppLayout.tsx          # Layout utama
│   │   └── lib/supabase.ts                # Supabase client
│   └── views/app.blade.php                # Root template
├── routes/
│   ├── web.php                            # 25 routes (semua web)
│   ├── console.php                        # Schedule commands
│   └── channels.php                       # Broadcasting
├── tests/
│   ├── Feature/                           # PHPUnit feature tests
│   ├── Unit/                              # PHPUnit unit tests
│   └── e2e/                               # 7 file Playwright E2E
│       ├── welcome.spec.js                # 9 tests
│       ├── auth.spec.js                   # 5 tests
│       ├── form-validation.spec.js        # 7 tests
│       ├── navigation.spec.js             # 7 tests
│       ├── responsive.spec.js             # 8 tests
│       ├── auth-redirect.spec.js          # 8 tests
│       └── tips.spec.js                   # 2 tests
├── playwright.config.js                   # Playwright config
├── composer.json                          # 15 packages
├── package.json                           # 12 packages
└── tailwind.config.js / vite.config.js    # Build configs
```

---

## 7. API Endpoints

### Publik (No Auth)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/` | Halaman beranda |
| GET | `/login` | Halaman login |
| GET | `/register` | Halaman register |
| POST | `/api/auth/callback` | Konversi JWT Supabase ke session |
| POST | `/api/auth/confirm-registration` | Auto-confirm email user baru |
| GET | `/api/auth/me` | Info user terautentikasi |
| POST | `/logout` | Logout + hapus session |

### Terproteksi (Middleware `supabase.auth`)
| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/dashboard` | Dasbor utama |
| GET | `/assessments`, `/assessments/bmi`, `/diabetes`, `/stress` | Halaman assessment |
| GET | `/chat` | Halaman chat |
| GET | `/profile` | Edit profil |
| GET | `/admin` | Panel admin |
| POST | `/api/assessments/bmi` | Hitung BMI |
| POST | `/api/assessments/diabetes` | Hitung risiko diabetes |
| POST | `/api/assessments/stress` | Hitung skor stres PSS-10 |
| POST | `/api/chat/send` | Kirim pesan ke AI |
| POST | `/api/chat/upload` | Upload file (gambar, pdf, doc) |
| GET | `/api/chat/history` | Riwayat chat per sesi |
| DELETE | `/api/chat/session/{session}` | Hapus sesi chat |
| GET | `/api/assessments/history` | Riwayat assessment |
| PUT | `/api/profile` | Update profil |
| GET | `/api/news/latest` | Artikel terbaru |

---

## 8. Alur Utama

### Registrasi Pengguna
```
User → Register.tsx → supabase.auth.signUp()
  ├─ Success + session → /api/auth/callback → login → /dashboard
  └─ Success, no session → /api/auth/confirm-registration
       → Supabase Admin API (email_confirm: true)
       → Buat User + Profile → login → /dashboard
```

### AI Chat dengan Analisis Gambar
```
User upload gambar → ChatController@upload → return URL
User kirim message + attachment → ChatController@send
  → HealthConsultantAgent
    → ImageAnalyzer.describe(url) → GPT-4o (GitHub Models)
    → Prepended description to message
  → Groq LLM (llama-3.1-8b-instant) → response
  → Simpan ChatLog user + assistant → return JSON
```

### Refresh Artikel
```
Schedule (every 30 min) → php artisan news:refresh
  → NewsFeedService.refresh()
    1. Fetch 10 RSS feeds (WHO, Harvard, Kemkes, etc.)
    2. Parse XML (RSS/Atom)
    3. Kategorisasi otomatis (disease/nutrition/mental/exercise/general)
    4. Dedup via deterministic slug (md5 source_url)
    5. updateOrCreate ke database
    6. fetchMissingOgImages() → scrape og:image meta
    7. translateArticles() → Groq batch (5 per call) → title_id/description_id
```

---

## 9. Testing Coverage

### Backend (PHPUnit): 37 tests, 96 assertions
- **Unit Tests:** BMIEngine, DiabetesRiskEngine, StressPSS10Engine, AssessmentRegistry
- **Feature Tests:** Profile, News, Auth, Dashboard, Admin, Assessment API, Chat

### Frontend (Playwright E2E): 46 tests
| Test File | Scope | Jumlah |
|-----------|-------|--------|
| `welcome.spec.js` | Header, hero, fitur, CTA, footer, navigasi | 9 |
| `auth.spec.js` | Login & Register form elements | 5 |
| `form-validation.spec.js` | HTML5 validation (required, type, minLength) | 7 |
| `navigation.spec.js` | Alur navigasi, status 200, protected routes | 7 |
| `responsive.spec.js` | Mobile/tablet/desktop, overflow | 8 |
| `auth-redirect.spec.js` | 8 protected pages redirect ke /login | 8 |
| `tips.spec.js` | Halaman artikel | 2 |

### Total: 83 tests

---

## 10. Integrasi Pihak Ketiga

| Layanan | Tipe | Kredensial | Rate Limit |
|---------|------|------------|------------|
| **Supabase** | Auth + Database | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` | - |
| **Groq** | AI Chat (text) | `GROQ_API_KEY` | Gratis tier |
| **GitHub Models** | AI Vision (GPT-4o) | `GITHUB_TOKEN` | 60 req/min gratis |
| **Gemini** | AI Vision (fallback) | `GEMINI_API_KEY` | Limit: 0 (perlu billing) |
| **OpenAI** | Not active | `OPENAI_API_KEY` (placeholder) | - |
| **RSS Feeds** | 10 sumber berita | Publik | Bergantung sumber |

---

## 11. Design System

### Tokens Warna (Stitch Design)

| Token | Value | Penggunaan |
|-------|-------|------------|
| Primary | `#006d3e` | Healy Green — tombol, link, aksen |
| Primary Container | `#1db06a` / `#b7f3c7` | Background aksen |
| Secondary | `#026783` | Teal — elemen sekunder |
| Secondary Container | `#95deff` / `#c8e6ff` | Background info |
| Tertiary | `#4b6454` | Sage — elemen tersier |
| Surface | `#faf9f6` | Warm Cream — background utama |
| Error | `#ba1a1a` | Pesan error |

### Glass Card
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(12px);
```

### Animasi Kustom
- `float` — Floating lambat untuk elemen dekoratif
- `blink` — Cursor berkedip di chat
- `fade-in` / `scale-in` — Transisi masuk elemen
- `grad-shift` — Background gradient bergerak (placeholder artikel)
- `reveal` — Scroll-triggered fade + slide up

---

## 12. Perintah Penting

### Development
```bash
npm run dev                    # Vite HMR
php artisan serve              # Laravel server (http://127.0.0.1:8000)
php artisan queue:work         # Queue worker
php artisan reverb:start       # WebSocket server
composer run dev               # Semua service (server + queue + logs + vite + reverb)
```

### Maintenance
```bash
php artisan news:refresh       # Refresh artikel manual
php artisan news:fetch-og-images # Fetch OG image untuk artikel tanpa gambar
```

### Testing
```bash
php artisan test               # Backend (37 tests)
npm run test:e2e               # Frontend E2E (46 tests)
npx playwright show-report     # Laporan HTML Playwright
npx playwright codegen http://127.0.0.1:8000  # Record test
```

### Build
```bash
npm run build                  # Build frontend production
```

---

## 13. Status & Catatan

### Status: **Development — Fungsionalitas Inti Selesai**

### Yang Berfungsi
- ✅ Landing page, Login, Register (auto-confirm email)
- ✅ Dashboard dengan grafik + tips kesehatan
- ✅ 3 jenis assessment (BMI, Diabetes, Stress)
- ✅ AI Chat dengan analisis gambar
- ✅ Edit profil + riwayat assessment
- ✅ Artikel dari 10 RSS feed + kategorisasi + translasi
- ✅ Panel admin
- ✅ Backend testing (37 tests)
- ✅ E2E frontend testing (46 tests)

### Dalam Pengembangan
- ⏳ Multi-user / anggota keluarga
- ⏳ Fitur booking / jadwal konsultasi
- ⏳ Notifikasi push
- ⏳ Dark mode

### Catatan Teknis
- SSL verification dinonaktifkan (`Http::withoutVerifying()`) — harus diaktifkan sebelum produksi
- Gemini API key terbatas (perlu billing) — fallback ke GitHub Models untuk vision
- SQLite untuk development — migrasi ke Supabase PostgreSQL untuk produksi

---

## 14. Kesimpulan

Healy adalah platform kesehatan digital modern yang mengintegrasikan **AI chat konsultasi**, **self-assessment kesehatan**, **agregasi berita kesehatan**, dan **manajemen profil keluarga** dalam satu kesatuan yang kohesif. Dibangun di atas **Laravel 13 + React 19 + Inertia.js**, dengan autentikasi **Supabase** dan desain visual **Material Design 3** yang diadaptasi dengan palet warna khas Indonesia (Healy Green, Teal, Sage).

Platform ini menerapkan **arsitektur berbasis layanan** dengan registry pattern untuk assessment engine, **AI multi-provider** (Groq untuk teks, GitHub Models GPT-4o untuk vision), serta **sistem berita otomatis** yang mengambil, mengkategorikan, dan menerjemahkan konten dari 10 sumber RSS internasional dan Indonesia.

Dengan **83 total pengujian** (37 backend + 46 E2E frontend), aplikasi ini siap untuk pengembangan fitur lanjutan dan deployment produksi setelah penyesuaian keamanan yang diperlukan.
