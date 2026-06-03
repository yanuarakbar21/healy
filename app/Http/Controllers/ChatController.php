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
