# Health News & Alert System — v2 Supercharged

## Overview
Sistem berita kesehatan real-time dengan alert banner, bookmark, scheduled refresh, dan multi-source RSS (internasional + Indonesia). Database-backed untuk fitur lengkap.

---

## 1. Data Source — 10 RSS Feeds

### Internasional
| Source | Feed URL |
|--------|----------|
| WHO | `https://www.who.int/rss-feeds/news-english.xml` |
| Harvard Health | `https://www.health.harvard.edu/blog/feed` |
| Medical News Today | `https://www.medicalnewstoday.com/rss` |
| NIH Research Matters | `https://www.nih.gov/news-events/news-releases/rss.xml` |
| CDC | `https://tools.cdc.gov/api/2/media/feed/9953` |
| Mayo Clinic | `https://newsnetwork.mayoclinic.org/feed/` |

### Indonesia
| Source | Feed URL |
|--------|----------|
| Kemkes RI | `https://www.kemkes.go.id/rss/berita` |
| Alodokter | `https://www.alodokter.com/feed` |
| HelloSehat | `https://hellosehat.com/feed/` |
| SehatQ | `https://www.sehatq.com/feed` |

All fetched via Laravel `Http::get()`, parsed with `simplexml_load_string()`, normalized to uniform struct. Timeout 10s per feed.

---

## 2. Database Schema

### Migration: `health_articles`
```php
Schema::create('health_articles', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->string('title', 500);
    $table->string('slug', 500)->unique();
    $table->text('description')->nullable();
    $table->string('image_url', 1000)->nullable();
    $table->string('source', 100);              // e.g. 'WHO', 'Kemkes'
    $table->string('source_url', 1000);          // original article link
    $table->string('category', 50)->default('general');
    $table->timestamp('published_at')->nullable();
    $table->timestamps();

    $table->index('category');
    $table->index('published_at');
    $table->fullText(['title', 'description']);
});
```

### Migration: `article_bookmarks`
```php
Schema::create('article_bookmarks', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id');
    $table->uuid('article_id');
    $table->timestamps();

    $table->unique(['user_id', 'article_id']);
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('article_id')->references('id')->on('health_articles')->cascadeOnDelete();
});
```

### Migration: `article_reads`
```php
Schema::create('article_reads', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->uuid('user_id');
    $table->uuid('article_id');
    $table->timestamp('read_at');

    $table->unique(['user_id', 'article_id']);
    $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
    $table->foreign('article_id')->references('id')->on('health_articles')->cascadeOnDelete();
});
```

---

## 3. Backend

### Files
| File | Purpose |
|------|---------|
| `app/Models/HealthArticle.php` | Eloquent model |
| `app/Models/ArticleBookmark.php` | Pivot model |
| `app/Models/ArticleRead.php` | Pivot model |
| `app/Http/Controllers/NewsController.php` | Inertia page + API for alerts |
| `app/Console/Commands/RefreshNewsCommand.php` | `php artisan news:refresh` |
| `app/Services/NewsFeedService.php` | RSS fetch + parse + categorize |
| `routes/web.php` | `/news` route |
| `routes/api.php` | `/api/news/*` endpoints |

### NewsFeedService
```php
class NewsFeedService
{
    public function refresh(): int  // returns count of articles added
    {
        $feeds = config('news.feeds');
        $articles = [];

        foreach ($feeds as $source => $url) {
            try {
                $parsed = $this->fetchAndParse($url, $source);
                $articles = array_merge($articles, $parsed);
            } catch (Exception $e) {
                Log::warning("RSS fetch failed for {$source}: {$e->getMessage()}");
            }
        }

        // Deduplicate by title similarity, sort by date
        // Upsert into health_articles table
        // Return count
    }
}
```

### Category Auto-Assignment
Keyword matching with synonyms:
```php
'disease' => ['cancer', 'diabetes', 'heart', 'stroke', 'penyakit', 'kanker', 'jantung'],
'nutrition' => ['diet', 'nutrition', 'vitamin', 'gizi', 'nutrisi', 'makanan'],
'mental' => ['mental', 'stress', 'depression', 'anxiety', 'depresi', 'cemas'],
'exercise' => ['exercise', 'fitness', 'workout', 'olahraga', 'bugar'],
'general' => []  // fallback
```

### Artisan Command: `news:refresh`
- Fetches all 10 RSS feeds
- Parses & upserts into `health_articles`
- Clears cached categories
- Output: `"Refreshed: 23 articles (5 new, 18 updated)"`
- Schedule in `Kernel.php`: every 30 minutes

### NewsController
- `index()`: paginated articles + user's bookmarks/reads
- `show($slug)`: single article detail + mark as read
- `bookmark($id)`: toggle bookmark
- `bookmarked()`: user's bookmarked articles

### API Routes (for Dashboard alerts)
```php
Route::get('/api/news/latest', [NewsController::class, 'latest']);  // top 5 for alert
Route::post('/api/news/{article}/read', [NewsController::class, 'markRead']);
```

---

## 4. Frontend — Pages & Components

### Navigation Update
```ts
{ href: '/news', label: 'Berita', icon: 'newspaper' }
```
Badge count: unread articles since last visit (from localStorage `lastNewsVisit`).

### Pages
| Page | File | Description |
|------|------|-------------|
| **News Index** | `resources/js/Pages/News/Index.tsx` | Main listing page |
| **News Detail** | `resources/js/Pages/News/Show.tsx` | Single article (embedded via Inertia) |
| **Bookmarks** | `resources/js/Pages/News/Bookmarks.tsx` | User's saved articles |

### News/Index.tsx — Layout
```
┌──────────────────────────────────────────────────┐
│ [Search Input]  [Refresh Button]                 │
│                                                  │
│ [All] [Nutrisi] [Mental] [Penyakit] [Olahraga]   │
│                                                  │
│ ┌─────────────────────────────────────────────┐  │
│ │  HERO CARD (latest trending) — full width   │  │
│ │  [image] gradient overlay                   │  │
│ │  Title, source, time, category badge        │  │
│ └─────────────────────────────────────────────┘  │
│                                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │ Card │ │ Card │ │ Card │                      │
│ │ img  │ │ img  │ │ img  │                      │
│ │ title│ │ title│ │ title│                      │
│ └──────┘ └──────┘ └──────┘                      │
│ ┌──────┐ ┌──────┐ ┌──────┐                      │
│ │ Card │ │ Card │ │ Card │                      │
│ └──────┘ └──────┘ └──────┘                      │
│                                                  │
│ [Load More]                                      │
└──────────────────────────────────────────────────┘
```

- **Hero card**: Featured article (first in list) with full-width image + gradient overlay + source badge + category chip
- **Card**: `aspect-[16/9]` image, source badge (colored by source), relative time ("2 jam lalu"), title (2 line clamp), description (2 line), bookmark icon button
- **Filter**: Client-side or server-side filter by category
- **Search**: Debounced 300ms, filter by title
- **Pagination**: "Muat Lainnya" button, loads 12 per page
- **Refresh**: Button "Muat Ulang" → re-fetch from DB (not RSS)

### News/Show.tsx — Detail
- Full article rendering
- Hero image (full width)
- Title, source, published date, category badge
- Description text
- "Baca artikel asli" → opens source_url in new tab
- Bookmark toggle
- Share button
- Related articles (same category, exclude current)
- Back to news

### Dashboard Alert Banner
Injected above metric cards:
```
┌──────────────────────────────────────────────┐
│ 🏥 Breaking: WHO declares...  [x]           │
│ 💚 Tips: 5 makanan untuk...      [x]         │
│ 🧠 Mental Health: Cara atasi... [x]         │
│                                        [Lihat Semua →] │
└──────────────────────────────────────────────┘
```
- Each row: emoji/icon based on category, title (1 line), dismiss button
- Max 5 items, sorted by date desc
- Dismissed stored in localStorage
- "Lihat Semua" → link to `/news`

### Color-Coded Categories
| Category | Tailwind | Hex | Icon |
|----------|----------|-----|------|
| disease | `text-red-600 border-red-500` | `#dc2626` | `coronavirus` |
| general | `text-teal-600 border-teal-500` | `#0d9488` | `info` |
| nutrition | `text-green-600 border-green-500` | `#16a34a` | `nutrition` |
| mental | `text-violet-600 border-violet-500` | `#7c3aed` | `psychology` |
| exercise | `text-orange-600 border-orange-500` | `#ea580c` | `exercise` |

### Stitch Design Integration
- Cards: `bg-surface-container-lowest rounded-xl border border-outline-variant/20`
- Hero: `bg-gradient-to-t from-black/70 via-black/30 to-transparent`
- Typography: `font-headline-md`, `font-body-md`, `font-label-sm`
- Filter chips: `bg-surface-container-high rounded-full font-label-sm`
- Search: Stitch input styling with search icon

---

## 5. Caching & Performance
- **Database**: articles stored in DB, no repeated RSS parsing
- **Full-text index** on title + description for fast search
- **Eager load** bookmark/read status for authenticated users
- **Pagination**: 12 per page, offset-based
- **Cache**: Categories count cached 1 hour

---

## 6. Error Handling
- RSS fetch failure: log warning, continue with other feeds
- All feeds fail: show "Gagal memuat berita" with retry button
- Network error on refresh: show toast + keep stale data
- Image broken: fallback to placeholder gradient

---

## 7. Artisan Commands
```bash
php artisan news:refresh           # Manual refresh
php artisan news:refresh --force   # Force re-fetch all even if exists
```

Schedule in `bootstrap/app.php`:
```php
$schedule->command('news:refresh')->everyThirtyMinutes();
```

---

## 8. Testing
- RSS XML parsing test (mock HTTP)
- Category assignment test
- Controller Inertia response test
- Bookmark toggle test
- Duplicate prevention test
- Artisan command test

---

## 9. Future (out of scope)
- Push notifications (browser API)
- AI-generated Indonesian summaries
- User preference: preferred categories
- Share to social media
- Dark mode article reader
