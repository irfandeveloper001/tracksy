<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingApproved extends Notification
{
    use Queueable;

    protected $booking;

    /**
     * Create a new notification instance.
     */
    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via($notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Booking Confirmed - ' . $this->booking->booking_reference)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Your booking request has been approved!')
            ->line('Booking Reference: ' . $this->booking->booking_reference)
            ->line('Seat Number: ' . $this->booking->seat_number)
            ->line('Trip Date: ' . $this->booking->trip_date->format('F d, Y'))
            ->line('Status: Confirmed')
            ->action('View Booking', url('/bookings/' . $this->booking->id))
            ->line('Thank you for using Tracksy!');
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'notification_type' => 'booking_confirmed',
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->booking_reference,
            'seat_number' => $this->booking->seat_number,
            'trip_date' => $this->booking->trip_date->format('Y-m-d'),
            'status' => 'confirmed',
            'title' => 'Booking Confirmed',
            'message' => 'Your booking request for seat ' . $this->booking->seat_number . 
                        ' on ' . $this->booking->trip_date->format('M d, Y') . ' has been confirmed.',
            'action_url' => '/bookings/' . $this->booking->id,
        ];
    }
}
