<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Update overdue fees daily at midnight
        $schedule->call(function () {
            $overdueFees = \App\Models\Fee::where('status', 'pending')
                ->where('due_date', '<', now())
                ->get();

            foreach ($overdueFees as $fee) {
                $fee->update(['status' => 'overdue']);
                
                // Send notification to student about overdue fee
                if ($fee->user) {
                    $fee->user->notify(new \App\Notifications\FeeInvoiceGenerated($fee, [
                        'message' => 'Your fee is now overdue',
                    ]));
                }
            }
            
            \Log::info('Updated ' . $overdueFees->count() . ' overdue fees');
        })->daily()->at('00:00');

        // Send reminder 3 days before due date
        $schedule->call(function () {
            $upcomingFees = \App\Models\Fee::where('status', 'pending')
                ->whereBetween('due_date', [now(), now()->addDays(3)])
                ->get();

            foreach ($upcomingFees as $fee) {
                if ($fee->user) {
                    $daysLeft = now()->diffInDays($fee->due_date);
                    $fee->user->notify(new \App\Notifications\FeeInvoiceGenerated($fee, [
                        'message' => "Reminder: Your fee is due in {$daysLeft} days",
                    ]));
                }
            }
            
            \Log::info('Sent reminders for ' . $upcomingFees->count() . ' upcoming fees');
        })->daily()->at('09:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}

