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
        if (auth()->check()) {
            return $next($request);
        }

        $token = $request->bearerToken();

        if (!$token) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated'], 401);
            }
            return redirect('/login');
        }

        $response = Http::withoutVerifying()
            ->withToken($token)
            ->withHeaders(['apikey' => config('services.supabase.anon_key')])
            ->get(config('services.supabase.url') . '/auth/v1/user');

        if ($response->failed()) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Invalid or expired token'], 401);
            }
            return redirect('/login');
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
