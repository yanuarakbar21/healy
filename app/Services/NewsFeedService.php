<?php

namespace App\Services;

use App\Models\HealthArticle;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NewsFeedService
{
    private array $categoryKeywords = [
        'disease' => [
            'cancer', 'diabetes', 'heart disease', 'stroke', 'hypertension',
            'penyakit', 'kanker', 'jantung', 'diabetes', 'stroke', 'hipertensi',
            'obesity', 'obesitas', 'alzheimer', 'dementia', 'demensia',
            'tuberculosis', 'tb', 'hiv', 'aids', 'malaria', 'covid', 'pandemic',
            'vaccine', 'vaksin', 'surgery', 'operasi', 'tumor',
        ],
        'nutrition' => [
            'diet', 'nutrition', 'vitamin', 'mineral', 'gizi', 'nutrisi',
            'makanan', 'food', 'fruit', 'sayur', 'vegetable', 'protein',
            'calorie', 'kalori', 'supplement', 'suplemen', 'hydration',
            'gut health', 'probiotic', 'probiotik', 'recipe', 'resep',
            'cooking', 'masak', 'organic', 'organik', 'superfood',
        ],
        'mental' => [
            'mental health', 'stress', 'anxiety', 'depression', 'depresi',
            'cemas', 'kecemasan', 'meditation', 'meditasi', 'mindfulness',
            'sleep', 'tidur', 'insomnia', 'burnout', 'well-being',
            'kesejahteraan', 'therapy', 'terapi', 'counseling', 'konseling',
            'bipolar', 'ptsd', 'trauma', 'mental', 'psikologi', 'psychology',
        ],
        'exercise' => [
            'exercise', 'fitness', 'workout', 'olahraga', 'bugar',
            'yoga', 'running', 'lari', 'walking', 'jalan', 'swimming',
            'renang', 'cycling', 'sepeda', 'strength', 'kekuatan',
            'cardio', 'stretching', 'peregangan', 'pilates', 'gym',
            'physical activity', 'aktivitas fisik', 'sport',
        ],
    ];

    public function refresh(): int
    {
        $feeds = config('news.feeds', []);
        $allItems = [];
        $hasSucceed = false;

        foreach ($feeds as $source => $url) {
            try {
                $items = $this->fetchFeed($url, $source);
                $allItems = array_merge($allItems, $items);
                $hasSucceed = true;
            } catch (\Exception $e) {
                Log::warning("RSS fetch failed for {$source}: {$e->getMessage()}");
            }
        }

        if (!$hasSucceed) {
            return 0;
        }

        usort($allItems, fn ($a, $b) => strtotime($b['published_at'] ?? 'now') - strtotime($a['published_at'] ?? 'now'));

        $imported = 0;
        foreach ($allItems as $item) {
            try {
                HealthArticle::updateOrCreate(
                    ['slug' => $item['slug']],
                    $item
                );
                $imported++;
            } catch (\Exception $e) {
                Log::warning("Article import failed: {$e->getMessage()}");
            }
        }

        $this->fetchMissingOgImages();
        $this->translateArticles();

        return $imported;
    }

    private function fetchFeed(string $url, string $source): array
    {
        $response = Http::timeout(10)->get($url);

        if (!$response->successful()) {
            throw new \RuntimeException("HTTP {$response->status()}");
        }

        libxml_use_internal_errors(true);
        $xml = simplexml_load_string($response->body());
        if ($xml === false) {
            throw new \RuntimeException('Invalid XML');
        }

        $items = [];

        if (isset($xml->channel->item)) {
            foreach ($xml->channel->item as $item) {
                $items[] = $this->parseItem($item, $source, 'rss');
            }
        } elseif (isset($xml->entry)) {
            foreach ($xml->entry as $entry) {
                $items[] = $this->parseItem($entry, $source, 'atom');
            }
        }

        return $items;
    }

    private function parseItem(\SimpleXMLElement $item, string $source, string $format): array
    {
        if ($format === 'atom') {
            $title = (string) $item->title;
            $link = (string) ($item->link['href'] ?? $item->link ?? '');
            $description = strip_tags((string) ($item->summary ?? $item->content ?? ''));
            $published = (string) ($item->published ?? $item->updated ?? '');
            $image = $this->extractAtomImage($item);
        } else {
            $title = (string) $item->title;
            $link = (string) ($item->link ?? '');
            $description = strip_tags((string) ($item->description ?? ''));
            $published = (string) ($item->pubDate ?? $item->dc->date ?? '');
            $image = $this->extractRssImage($item);
        }

        $description = mb_substr($description, 0, 500);

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . substr(md5($link), 0, 8),
            'description' => $description,
            'image_url' => $image,
            'source' => $source,
            'source_url' => $link,
            'category' => $this->categorize($title . ' ' . $description),
            'published_at' => $published ? date('Y-m-d H:i:s', strtotime($published)) : now(),
        ];
    }

    private function extractRssImage(\SimpleXMLElement $item): ?string
    {
        $namespaces = $item->getNamespaces(true);

        if (isset($namespaces['media'])) {
            $media = $item->children($namespaces['media']);
            if (isset($media->content)) {
                $attrs = $media->content->attributes();
                $url = (string) ($attrs['url'] ?? '');
                if ($url) return $url;
            }
            if (isset($media->thumbnail)) {
                $attrs = $media->thumbnail->attributes();
                $url = (string) ($attrs['url'] ?? '');
                if ($url) return $url;
            }
        }

        if (isset($item->enclosure)) {
            $attrs = $item->enclosure->attributes();
            $type = (string) ($attrs['type'] ?? '');
            if (str_starts_with($type, 'image/')) {
                return (string) ($attrs['url'] ?? '');
            }
        }

        $desc = (string) $item->description;
        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/', $desc, $m)) {
            return $m[1];
        }

        return null;
    }

    private function extractAtomImage(\SimpleXMLElement $entry): ?string
    {
        $namespaces = $entry->getNamespaces(true);

        if (isset($namespaces['media'])) {
            $media = $entry->children($namespaces['media']);
            if (isset($media->thumbnail)) {
                $attrs = $media->thumbnail->attributes();
                return (string) ($attrs['url'] ?? '');
            }
        }

        if (isset($entry->link)) {
            foreach ($entry->link as $link) {
                $attrs = $link->attributes();
                if ((string) ($attrs['rel'] ?? '') === 'enclosure') {
                    $type = (string) ($attrs['type'] ?? '');
                    if (str_starts_with($type, 'image/')) {
                        return (string) ($attrs['href'] ?? '');
                    }
                }
            }
        }

        $content = strip_tags((string) ($entry->summary ?? $entry->content ?? ''));
        $contentWithTags = (string) ($entry->content ?? $entry->summary ?? '');
        if (preg_match('/<img[^>]+src=["\']([^"\']+)["\']/', $contentWithTags, $m)) {
            return $m[1];
        }

        return null;
    }

    public function fetchMissingOgImages(): void
    {
        $articles = HealthArticle::whereNull('image_url')
            ->whereNotNull('source_url')
            ->where('source_url', '!=', '')
            ->take(20)
            ->get();

        foreach ($articles as $article) {
            try {
                $imageUrl = $this->fetchOgImage($article->source_url);
                if ($imageUrl) {
                    $article->update(['image_url' => $imageUrl]);
                }
            } catch (\Exception $e) {
                Log::warning("OG image fetch failed for {$article->slug}: {$e->getMessage()}");
            }
        }
    }

    private function fetchOgImage(string $url): ?string
    {
        $response = Http::timeout(15)->get($url);
        if (!$response->successful()) return null;

        $html = $response->body();

        if (preg_match('/<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)["\']/i', $html, $m)) {
            return $m[1];
        }

        if (preg_match('/<meta\s+content=["\']([^"\']+)["\']\s+property=["\']og:image["\']/i', $html, $m)) {
            return $m[1];
        }

        return null;
    }

    private function translateArticles(): void
    {
        $articles = HealthArticle::where(function ($q) {
            $q->whereNull('title_id')->orWhereColumn('title_id', 'title');
        })->get();
        if ($articles->isEmpty()) return;

        $apiKey = config('ai.providers.groq.key');
        $model = config('ai.providers.groq.models.text.default', 'llama-3.1-8b-instant');
        if (!$apiKey) return;

        foreach ($articles->chunk(5) as $chunk) {
            $items = $chunk->map(fn ($a) => [
                'id' => $a->id,
                'title' => $a->title,
                'description' => mb_substr($a->description ?? '', 0, 300),
            ]);

            try {
                $response = Http::timeout(60)->withHeaders([
                    'Authorization' => "Bearer {$apiKey}",
                    'Content-Type' => 'application/json',
                ])->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $model,
                    'messages' => [[
                        'role' => 'user',
                        'content' => 'Translate these health news articles to Indonesian (Bahasa Indonesia). Preserve medical terms, drug names, and numbers. Return ONLY a valid JSON array with objects having "id", "title_id", "description_id". No markdown, no explanation. Articles: ' . json_encode($items),
                    ]],
                    'temperature' => 0.15,
                ]);

                if (!$response->successful()) {
                    Log::warning("Translation API failed: {$response->body()}");
                    continue;
                }

                $body = $response->json();
                $translatedRaw = $body['choices'][0]['message']['content'] ?? '';

                $translated = json_decode($translatedRaw, true);
                if (!is_array($translated)) {
                    if (preg_match('/\[[\s\S]*\]/', $translatedRaw, $m)) {
                        $translated = json_decode($m[0], true);
                    }
                }

                if (!is_array($translated)) {
                    Log::warning("Translation parse failed for chunk: " . substr($translatedRaw, 0, 200));
                    continue;
                }

                foreach ($translated as $t) {
                    if (isset($t['id'], $t['title_id'])) {
                        HealthArticle::where('id', $t['id'])->update([
                            'title_id' => $t['title_id'],
                            'description_id' => $t['description_id'] ?? $t['title_id'],
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Translation failed: {$e->getMessage()}");
            }
        }
    }

    private function categorize(string $text): string
    {
        $text = mb_strtolower($text);
        $scores = [];

        foreach ($this->categoryKeywords as $category => $keywords) {
            $score = 0;
            foreach ($keywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    $score++;
                }
            }
            if ($score > 0) {
                $scores[$category] = $score;
            }
        }

        if (empty($scores)) {
            return 'general';
        }

        arsort($scores);
        return key($scores);
    }
}
