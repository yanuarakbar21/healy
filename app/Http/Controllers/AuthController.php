<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function callback(Request $request)
    {
        $request->validate(['token' => 'required|string']);

        $response = Http::withoutVerifying()
            ->withToken($request->token)
            ->withHeaders(['apikey' => config('services.supabase.anon_key')])
            ->get(config('services.supabase.url') . '/auth/v1/user');

        if ($response->failed()) {
            return response()->json(['message' => 'Invalid token'], 401);
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

        auth()->login($user);

        $request->session()->regenerate();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->profile?->full_name,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Not authenticated'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
            'full_name' => $user->profile?->full_name,
        ]);
    }

    public function logout(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
