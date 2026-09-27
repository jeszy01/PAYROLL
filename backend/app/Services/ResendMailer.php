<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoMailer
{
    public static function send(string $toEmail, string $toName, string $subject, string $textContent): bool
    {
        $apiKey = env('RESEND_API_KEY');

        if (! $apiKey) {
            Log::error('RESEND_API_KEY is not set; email not sent.');
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