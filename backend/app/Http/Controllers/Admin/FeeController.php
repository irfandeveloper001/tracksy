<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\User;
use App\Models\Payment;
use App\Notifications\FeeInvoiceGenerated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class FeeController extends Controller
{
    // Get all fees
    public function index(Request $request)
    {
        $query = Fee::with(['user', 'payments']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by student
        if ($request->has('student_id')) {
            $query->where('user_id', $request->student_id);
        }

        // Filter by semester
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        $fees = $query->orderBy('due_date', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $fees,
        ]);
    }

    // Create fee for specific student
    public function store(Request $request)
    {
        $this->validate($request, [
            'user_id' => 'required|exists:users,id',
            'fee_type' => 'required|string|in:tuition,transport,library,hostel,exam,other',
            'amount' => 'required|numeric|min:0',
            'semester' => 'required|string',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'send_notification' => 'boolean',
        ]);

        $fee = Fee::create([
            'user_id' => $request->user_id,
            'fee_type' => $request->fee_type,
            'amount' => $request->amount,
            'semester' => $request->semester,
            'due_date' => $request->due_date,
            'status' => 'pending',
            'description' => $request->description,
        ]);

        // Send notification to student
        if ($request->send_notification !== false) {
            $student = User::find($request->user_id);
            $student->notify(new FeeInvoiceGenerated($fee));
        }

        return response()->json([
            'success' => true,
            'message' => 'Fee created successfully',
            'data' => $fee,
        ], 201);
    }

    // Create fees for all students
    public function createBulkFees(Request $request)
    {
        $this->validate($request, [
            'fee_type' => 'required|string|in:tuition,transport,library,hostel,exam,other',
            'amount' => 'required|numeric|min:0',
            'semester' => 'required|string',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id',
            'send_notification' => 'boolean',
        ]);

        // Get students (either specific ones or all students)
        if ($request->has('student_ids') && !empty($request->student_ids)) {
            $students = User::whereIn('id', $request->student_ids)
                ->where('role', 'student')
                ->get();
        } else {
            $students = User::where('role', 'student')->get();
        }

        $createdFees = [];

        foreach ($students as $student) {
            $fee = Fee::create([
                'user_id' => $student->id,
                'fee_type' => $request->fee_type,
                'amount' => $request->amount,
                'semester' => $request->semester,
                'due_date' => $request->due_date,
                'status' => 'pending',
                'description' => $request->description,
            ]);

            $createdFees[] = $fee;

            // Send notification
            if ($request->send_notification !== false) {
                $student->notify(new FeeInvoiceGenerated($fee));
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Fees created for ' . count($createdFees) . ' students',
            'data' => [
                'count' => count($createdFees),
                'fees' => $createdFees,
            ],
        ], 201);
    }

    // Update fee
    public function update(Request $request, $id)
    {
        $fee = Fee::findOrFail($id);

        $this->validate($request, [
            'fee_type' => 'sometimes|string|in:tuition,transport,library,hostel,exam,other',
            'amount' => 'sometimes|numeric|min:0',
            'semester' => 'sometimes|string',
            'due_date' => 'sometimes|date',
            'status' => 'sometimes|string|in:pending,paid,overdue,cancelled',
            'description' => 'nullable|string',
        ]);

        $fee->update($request->only([
            'fee_type',
            'amount',
            'semester',
            'due_date',
            'status',
            'description',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Fee updated successfully',
            'data' => $fee->fresh(['user', 'payments']),
        ]);
    }

    // Delete fee
    public function destroy($id)
    {
        $fee = Fee::findOrFail($id);
        
        // Check if fee has payments
        if ($fee->payments()->where('status', 'completed')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete fee with completed payments',
            ], 400);
        }

        $fee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fee deleted successfully',
        ]);
    }

    // Generate and send invoice to student
    public function generateInvoice($id)
    {
        $fee = Fee::with(['user', 'payments'])->findOrFail($id);

        // Send notification
        $fee->user->notify(new FeeInvoiceGenerated($fee));

        return response()->json([
            'success' => true,
            'message' => 'Invoice sent to student successfully',
        ]);
    }

    // Generate and send invoices in bulk
    public function generateBulkInvoices(Request $request)
    {
        $this->validate($request, [
            'fee_ids' => 'required|array',
            'fee_ids.*' => 'exists:fees,id',
        ]);

        $fees = Fee::with(['user', 'payments'])
            ->whereIn('id', $request->fee_ids)
            ->get();

        $successCount = 0;
        $failedCount = 0;
        $errors = [];

        foreach ($fees as $fee) {
            try {
                // Send notification to student
                $fee->user->notify(new FeeInvoiceGenerated($fee));
                $successCount++;
            } catch (\Exception $e) {
                $failedCount++;
                $errors[] = [
                    'fee_id' => $fee->id,
                    'student' => $fee->user->name,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => "Invoices sent: {$successCount} successful, {$failedCount} failed",
            'data' => [
                'total' => count($fees),
                'success_count' => $successCount,
                'failed_count' => $failedCount,
                'errors' => $errors,
            ],
        ]);
    }

    // Update due date
    public function updateDueDate(Request $request, $id)
    {
        $this->validate($request, [
            'due_date' => 'required|date',
            'send_notification' => 'boolean',
        ]);

        $fee = Fee::with('user')->findOrFail($id);
        $oldDueDate = $fee->due_date;
        
        $fee->update([
            'due_date' => $request->due_date,
        ]);

        // Send notification about due date change
        if ($request->send_notification !== false) {
            $fee->user->notify(new FeeInvoiceGenerated($fee, [
                'message' => 'Due date has been updated',
                'old_due_date' => $oldDueDate->format('F d, Y'),
                'new_due_date' => $fee->due_date->format('F d, Y'),
            ]));
        }

        return response()->json([
            'success' => true,
            'message' => 'Due date updated successfully',
            'data' => $fee,
        ]);
    }

    // Get overdue fees and update status
    public function updateOverdueFees()
    {
        $overdueFees = Fee::where('status', 'pending')
            ->where('due_date', '<', now())
            ->get();

        foreach ($overdueFees as $fee) {
            $fee->update(['status' => 'overdue']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Updated ' . $overdueFees->count() . ' overdue fees',
            'data' => [
                'count' => $overdueFees->count(),
            ],
        ]);
    }

    // Get statistics
    public function getStatistics()
    {
        $totalFees = Fee::sum('amount');
        $totalPaid = Payment::where('status', 'completed')->sum('amount');
        $pendingAmount = Fee::where('status', 'pending')->sum('amount');
        $overdueAmount = Fee::where('status', 'overdue')->sum('amount');
        
        $totalStudents = User::where('role', 'student')->count();
        $studentsWithPendingFees = Fee::where('status', 'pending')
            ->distinct('user_id')
            ->count('user_id');

        return response()->json([
            'success' => true,
            'data' => [
                'total_fees' => $totalFees,
                'total_paid' => $totalPaid,
                'pending_amount' => $pendingAmount,
                'overdue_amount' => $overdueAmount,
                'collection_rate' => $totalFees > 0 ? ($totalPaid / $totalFees) * 100 : 0,
                'total_students' => $totalStudents,
                'students_with_pending_fees' => $studentsWithPendingFees,
            ],
        ]);
    }

    // Record manual payment
    public function recordPayment(Request $request, $feeId)
    {
        $this->validate($request, [
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,card,online,bank_transfer',
            'transaction_id' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $fee = Fee::with('user')->findOrFail($feeId);

        if ($fee->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'This fee has already been fully paid',
            ], 400);
        }

        // Create payment
        $payment = Payment::create([
            'user_id' => $fee->user_id,
            'fee_id' => $fee->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'transaction_id' => $request->transaction_id ?? 'TXN-' . Str::upper(Str::random(12)),
            'status' => 'completed',
            'notes' => $request->notes,
        ]);

        // Update fee status if fully paid
        $totalPaid = $fee->payments()->where('status', 'completed')->sum('amount');
        if ($totalPaid >= $fee->amount) {
            $fee->update(['status' => 'paid']);
        }

        $fee->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'data' => [
                'payment' => $payment,
                'fee' => $fee,
            ],
        ]);
    }

    // Export fees report
    public function exportReport(Request $request)
    {
        $format = $request->query('format', 'csv');
        
        $query = Fee::with(['user', 'payments']);
        
        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->has('fee_type')) {
            $query->where('fee_type', $request->fee_type);
        }
        if ($request->has('start_date')) {
            $query->where('due_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('due_date', '<=', $request->end_date);
        }
        
        $fees = $query->orderBy('due_date', 'desc')->get();
        
        if ($format === 'csv') {
            return $this->exportToCsv($fees);
        } else {
            return $this->exportToPdf($fees);
        }
    }

    private function exportToCsv($fees)
    {
        $csv = "Student Name,Student Email,Fee Type,Semester,Amount,Paid,Balance,Due Date,Status,Created At\n";
        
        foreach ($fees as $fee) {
            $csv .= sprintf(
                '"%s","%s","%s","%s",%s,%s,%s,"%s","%s","%s"' . "\n",
                $fee->user->name ?? 'N/A',
                $fee->user->email ?? 'N/A',
                ucfirst(str_replace('_', ' ', $fee->fee_type)),
                $fee->semester,
                number_format($fee->amount, 2),
                number_format($fee->total_paid, 2),
                number_format($fee->remaining_balance, 2),
                $fee->due_date->format('Y-m-d'),
                ucfirst($fee->status),
                $fee->created_at->format('Y-m-d H:i:s')
            );
        }
        
        return response($csv, 200)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="fee-report-' . date('Y-m-d') . '.csv"');
    }

    private function exportToPdf($fees)
    {
        $data = [
            'fees' => $fees,
            'report_date' => now()->format('F d, Y'),
            'total_fees' => $fees->sum('amount'),
            'total_paid' => $fees->sum(function($fee) { return $fee->total_paid; }),
        ];
        
        $pdf = Pdf::loadView('reports.fee-report', $data)
            ->setPaper('a4', 'landscape');
        
        return $pdf->download('fee-report-' . date('Y-m-d') . '.pdf');
    }
}
