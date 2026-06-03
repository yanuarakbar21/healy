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
