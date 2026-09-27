<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ResendMailer
{
   public static function send(string $toEmail, string $toName, string $subject, string $textContent): bool
{
    // Pick the right API key based on recipient (temporary workaround for demo)
    $apiKey = match (true) {
        $toEmail === env('ADMIN_TEST_EMAIL') => env('RESEND_API_KEY'),
        $toEmail === env('HR_TEST_EMAIL') => env('RESEND_API_KEY_HR'),
        default => env('RESEND_API_KEY'), // fallback
    };

    if (! $apiKey) {
        Log::error('No Resend API key resolved; email not sent.');
        return false;
    }

    $response = Http::withToken($apiKey)
        ->post('https://api.resend.com/emails', [
            'from' => env('RESEND_FROM_NAME', 'Payroll & Benefits') . ' <' . env('RESEND_FROM_ADDRESS') . '>',
            'to' => [$toEmail],
            'subject' => $subject,
            'text' => $textContent,
        ]);

    if ($response->failed()) {
        Log::error('Resend email failed: ' . $response->body());
        return false;
    }

    return true;
}
}