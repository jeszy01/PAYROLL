<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {

        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(function ($request, $e) {
            return $request->is('api/*') || $request->expectsJson();
        });

        // This is an API-only app: there is no named "login" route.
        // The framework's default AuthenticationException handling
        // redirects non-JSON clients to route('login'), which throws
        // "Route [login] not defined" and surfaces as a 500. Always
        // answer unauthenticated API requests with 401 JSON instead.
        // Non-API requests fall through to the default handler.
        $exceptions->render(function (AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage()], 401);
            }
        });
    })->create();
