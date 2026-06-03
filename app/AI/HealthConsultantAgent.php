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
