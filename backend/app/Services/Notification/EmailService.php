<?php

namespace App\Services\Notification;

use Illuminate\Support\Facades\Mail;

class EmailService
{
    public function sendEmail($to, $subject, $template, $data = [])
    {
        // Send email
        // TODO: Implement email sending logic
    }

    public function sendWelcomeEmail($user)
    {
        // Send welcome email
        // TODO: Implement welcome email
    }

    public function sendBookingConfirmation($booking)
    {
        // Send booking confirmation email
        // TODO: Implement booking confirmation email
    }
}

