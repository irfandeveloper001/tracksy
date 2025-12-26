<?php

namespace App\Notifications;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BookingRejected extends Notification
{
    use Queueable;

    protected $booking;
    protected $rejectionReason;

    /**
     * Create a new notification instance.
     */
    public function __construct(Booking $booking, string $rejectionReason = '')
    {
        $this->booking = $booking;
        $this->rejectionReason = $rejectionReason;
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
        $mail = (new MailMessage)
            ->subject('Booking Rejected - ' . $this->booking->booking_reference)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('Unfortunately, your booking request has been rejected.')
            ->line('Booking Reference: ' . $this->booking->booking_reference)
            ->line('Seat Number: ' . $this->booking->seat_number)
            ->line('Trip Date: ' . $this->booking->trip_date->format('F d, Y'));

        if ($this->rejectionReason) {
            $mail->line('Reason: ' . $this->rejectionReason);
        }

        $mail->action('View Booking', url('/bookings/' . $this->booking->id))
            ->line('You can try booking a different seat or date.')
            ->line('Thank you for using Tracksy!');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'notification_type' => 'booking_rejected',
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->booking_reference,
            'seat_number' => $this->booking->seat_number,
            'trip_date' => $this->booking->trip_date->format('Y-m-d'),
            'status' => 'rejected',
            'rejection_reason' => $this->rejectionReason,
            'title' => 'Booking Rejected',
            'message' => 'Your booking request for seat ' . $this->booking->seat_number . 
                        ' on ' . $this->booking->trip_date->format('M d, Y') . ' has been rejected.' .
                        ($this->rejectionReason ? ' Reason: ' . $this->rejectionReason : ''),
            'action_url' => '/bookings/' . $this->booking->id,
        ];
    }
}
