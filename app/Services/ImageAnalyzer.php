<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ImageAnalyzer
{
    public function describe(string $imageUrl): string
    {
        $localPath = $this->resolveLocalPath($imageUrl);

        if (!file_exists($localPath)) {
            Log::warning('ImageAnalyzer: file not found', ['url' => $imageUrl, 'path' => $localPath]);
            return "[Gambar tidak ditemukan]";
        }

        $mime = mime_content_type($localPath) ?: 'image/png';
        $base64 = base64_encode(file_get_contents($localPath));

        try {
            $response = Http::withOptions(['verify' => false])
                ->timeout(30)
                ->withToken(config('services.github.token'))
                ->post('https://models.inference.ai.azure.com/chat/completions', [
                    'model' => 'gpt-4o',
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                ['type' => 'text', 'text' => 'Deskripsikan gambar ini secara detail dalam Bahasa Indonesia. Fokus pada informasi kesehatan yang relevan jika ada (misalnya makanan, obat-obatan, luka, dll). Jika tidak ada informasi kesehatan, deskripsikan secara umum apa yang terlihat di gambar.'],
                                ['type' => 'image_url', 'image_url' => ['url' => 'data:' . $mime . ';base64,' . $base64]],
                            ],
                        ],
                    ],
                    'max_tokens' => 500,
                ]);

            if ($response->failed()) {
                Log::error('ImageAnalyzer: API failed', ['status' => $response->status(), 'body' => $response->body()]);
                return "[Gagal menganalisis gambar]";
            }

            $content = $response->json('choices.0.message.content');
            Log::info('ImageAnalyzer: success', ['description' => substr($content ?? '', 0, 100)]);
            return $content ?: '[Gambar tidak dapat dideskripsikan]';
        } catch (\Exception $e) {
            Log::error('ImageAnalyzer: exception', ['message' => $e->getMessage()]);
            return "[Gagal menganalisis gambar]";
        }
    }

    private function resolveLocalPath(string $url): string
    {
        $relativePath = parse_url($url, PHP_URL_PATH);
        $relativePath = preg_replace('#^/storage/#', '', $relativePath);
        $relativePath = str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
        return storage_path('app' . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR . $relativePath);
    }
}
