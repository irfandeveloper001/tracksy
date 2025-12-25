<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fee;
use App\Notifications\FeeInvoiceGenerated;

class UpdateOverdueFees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:update-overdue {--notify : Send notifications to students}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update pending fees that are past due date to overdue status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $notify = $this->option('notify');

        $this->info('Checking for overdue fees...');

        $overdueFees = Fee::where('status', 'pending')
            ->where('due_date', '<', now())
            ->get();

        if ($overdueFees->isEmpty()) {
            $this->info('✅ No overdue fees found. All fees are up to date!');
            return 0;
        }

        $this->warn("Found {$overdueFees->count()} overdue fees.");
        
        if (!$this->confirm('Do you want to update these fees to overdue status?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $bar = $this->output->createProgressBar($overdueFees->count());
        $bar->start();

        $updatedCount = 0;
        $notifiedCount = 0;

        foreach ($overdueFees as $fee) {
            try {
                $fee->update(['status' => 'overdue']);
                $updatedCount++;

                if ($notify && $fee->user) {
                    $fee->user->notify(new FeeInvoiceGenerated($fee, [
                        'message' => 'Your fee is now overdue. Please pay immediately to avoid service restrictions.',
                    ]));
                    $notifiedCount++;
                }
            } catch (\Exception $e) {
                $this->error("Failed to update fee #{$fee->id}: {$e->getMessage()}");
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully updated {$updatedCount} fees to overdue status.");
        
        if ($notify) {
            $this->info("📧 Sent {$notifiedCount} overdue notifications.");
        }

        return 0;
    }
}

