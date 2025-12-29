<?php

namespace App\Notifications;

use App\Models\Fee;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\DatabaseMessage;

class FeeInvoiceGenerated extends Notification
{
    use Queueable;

    protected $fee;
    protected $customData;

    /**
     * Create a new notification instance.
     */
    public function __construct(Fee $fee, array $customData = [])
    {
        $this->fee = $fee;
        $this->customData = $customData;
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
        $message = isset($this->customData['message']) 
            ? $this->customData['message'] 
            : 'A new fee invoice has been generated for you';

        $mail = (new MailMessage)
            ->subject('Fee Invoice - ' . ucfirst($this->fee->fee_type))
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line($message)
            ->line('Fee Type: ' . ucfirst(str_replace('_', ' ', $this->fee->fee_type)))
            ->line('Amount: $' . number_format($this->fee->amount, 2))
            ->line('Semester: ' . $this->fee->semester)
            ->line('Due Date: ' . $this->fee->due_date->format('F d, Y'))
            ->line('Status: ' . ucfirst($this->fee->status));

        if (isset($this->customData['old_due_date'])) {
            $mail->line('Previous Due Date: ' . $this->customData['old_due_date'])
                 ->line('New Due Date: ' . $this->customData['new_due_date']);
        }

        if ($this->fee->description) {
            $mail->line('Description: ' . $this->fee->description);
        }

        $mail->action('View Invoice', url('/fees/' . $this->fee->id))
             ->line('Please make the payment before the due date to avoid any penalties.')
             ->line('Thank you for using Tracksy!');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray($notifiable): array
    {
        return [
            'notification_type' => 'fee_invoice',
            'fee_id' => $this->fee->id,
            'fee_type' => $this->fee->fee_type,
            'amount' => $this->fee->amount,
            'semester' => $this->fee->semester,
            'due_date' => $this->fee->due_date->format('Y-m-d'),
            'status' => $this->fee->status,
            'title' => isset($this->customData['message']) 
                ? $this->customData['message'] 
                : 'New Fee Invoice Generated',
            'message' => 'Fee invoice for ' . ucfirst(str_replace('_', ' ', $this->fee->fee_type)) . 
                        ' - $' . number_format($this->fee->amount, 2) . 
                        ' due on ' . $this->fee->due_date->format('M d, Y'),
            'action_url' => '/fees/' . $this->fee->id,
        ];
    }
}
