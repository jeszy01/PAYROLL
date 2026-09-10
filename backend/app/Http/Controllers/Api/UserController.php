<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function index()
    {
        return UserResource::collection(
            User::orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', Password::min(8)],
            'role' => ['required', 'string', Rule::in(User::ROLES)],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'role' => $data['role'],
        ]);

        return new UserResource($user);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'role' => ['sometimes', 'string', Rule::in(User::ROLES)],
            'password' => ['sometimes', 'nullable', 'string', Password::min(8)],
        ]);

        // No user — admin included — can change their own role. This
        // prevents self-elevation, self-demotion, and accidentally
        // locking out the last administrator.
        if ($request->user()->id === $user->id
            && isset($data['role'])
            && $data['role'] !== $user->role) {
            return response()->json([
                'message' => 'You cannot change your own role.',
            ], 422);
        }

        if (! empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return new UserResource($user);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot remove your own account while signed in.',
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(null, 204);
    }
}
