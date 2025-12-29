<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Fee;
use App\Models\User;
use App\Notifications\FeeInvoiceGenerated;

class CreateBulkFees extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'fees:create-bulk
                            {--type=transport : Fee type (tuition, transport, library, hostel, exam, other)}
                            {--amount=500 : Fee amount}
                            {--semester=Spring 2025 : Semester}
                            {--days=30 : Days until due date}
                            {--description= : Fee description}
                            {--notify : Send notifications to students}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create fees for all students in bulk';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $feeType = $this->option('type');
        $amount = $this->option('amount');
        $semester = $this->option('semester');
        $days = $this->option('days');
        $description = $this->option('description') ?: ucfirst(str_replace('_', ' ', $feeType)) . ' fee for ' . $semester;
        $notify = $this->option('notify');

        // Validate fee type
        $validTypes = ['tuition', 'transport', 'library', 'hostel', 'exam', 'other'];
        if (!in_array($feeType, $validTypes)) {
            $this->error("Invalid fee type. Must be one of: " . implode(', ', $validTypes));
            return 1;
        }

        $this->info("Creating bulk fees...");
        $this->info("Type: {$feeType}");
        $this->info("Amount: \${$amount}");
        $this->info("Semester: {$semester}");
        $this->info("Due Date: " . now()->addDays($days)->format('Y-m-d'));
        $this->info("Description: {$description}");
        $this->info("Send Notifications: " . ($notify ? 'Yes' : 'No'));
        $this->newLine();

        if (!$this->confirm('Do you want to proceed?')) {
            $this->info('Operation cancelled.');
            return 0;
        }

        $students = User::where('role', 'student')->get();
        
        if ($students->isEmpty()) {
            $this->error('No students found in the database.');
            return 1;
        }

        $this->info("Found {$students->count()} students.");
        $bar = $this->output->createProgressBar($students->count());
        $bar->start();

        $createdCount = 0;
        $errors = [];

        foreach ($students as $student) {
            try {
                $fee = Fee::create([
                    'user_id' => $student->id,
                    'fee_type' => $feeType,
                    'amount' => $amount,
                    'semester' => $semester,
                    'due_date' => now()->addDays($days),
                    'status' => 'pending',
                    'description' => $description,
                ]);

                if ($notify) {
                    $student->notify(new FeeInvoiceGenerated($fee));
                }

                $createdCount++;
            } catch (\Exception $e) {
                $errors[] = "Failed to create fee for {$student->name}: {$e->getMessage()}";
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->info("✅ Successfully created {$createdCount} fees.");
        
        if (!empty($errors)) {
            $this->error("❌ {count($errors)} errors occurred:");
            foreach ($errors as $error) {
                $this->error("  - {$error}");
            }
        }

        return 0;
    }
}

