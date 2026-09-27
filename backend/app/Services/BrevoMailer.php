<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoMailer
{
    public static function send(string $toEmail, string $toName, string $subject, string $textContent): bool
    {
        $apiKey = env('BREVO_API_KEY');

        if (! $apiKey) {
            Log::error('BREVO_API_KEY is not set; email not sent.');
            return false;
        }

        $response = Http::withHeaders([
            'api-key' => $apiKey,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ])->post('https://api.brevo.com/v3/smtp/email', [
            'sender' => [
                'name' => env('BREVO_FROM_NAME', 'Payroll & Benefits'),
                'email' => env('BREVO_FROM_ADDRESS'),
            ],
            'to' => [
                ['email' => $toEmail, 'name' => $toName],
            ],
            'subject' => $subject,
            'textContent' => $textContent,
        ]);

        if ($response->failed()) {
            Log::error('Brevo email failed: ' . $response->body());
            return false;
        }

        return true;
    }
}
