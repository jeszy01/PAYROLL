<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $response = Http::withHeaders([
        'X-Internal-API-Key' => env('INTERNAL_API_KEY'),
    ])->post('http://auth-service:8002/login', [
        'email' => $request->email,
        'password' => $request->password,
    ]);

    if ($response->failed()) {
        return response()->json(['message' => 'Invalid credentials.'], 401);
    }

    $authUser = $response->json('user');

    // Find (or reference) the local user record to issue the Sanctum token.
    $user = User::find($authUser['id']);

    $token = $user->createToken('auth-token')->plainTextToken;

    return response()->json([
        'user' => $user,
        'token' => $token,
    ]);
}

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }
}
