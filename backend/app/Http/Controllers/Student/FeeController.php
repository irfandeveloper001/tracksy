<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class FeeController extends Controller
{
    // Get all fees for authenticated student
    public function index()
    {
        $fees = Fee::where('user_id', Auth::id())
            ->with('payments')
            ->orderBy('due_date', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $fees->map(function ($fee) {
                return [
                    'id' => $fee->id,
                    'fee_type' => $fee->fee_type,
                    'amount' => $fee->amount,
                    'semester' => $fee->semester,
                    'due_date' => $fee->due_date->format('Y-m-d'),
                    'status' => $fee->status,
                    'description' => $fee->description,
                    'total_paid' => $fee->total_paid,
                    'remaining_balance' => $fee->remaining_balance,
                    'created_at' => $fee->created_at,
                ];
            }),
        ]);
    }

    // Get single fee details
    public function show($id)
    {
        $fee = Fee::where('user_id', Auth::id())
            ->with(['payments' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $fee->id,
                'fee_type' => $fee->fee_type,
                'amount' => $fee->amount,
                'semester' => $fee->semester,
                'due_date' => $fee->due_date->format('Y-m-d'),
                'status' => $fee->status,
                'description' => $fee->description,
                'total_paid' => $fee->total_paid,
                'remaining_balance' => $fee->remaining_balance,
                'payments' => $fee->payments,
                'created_at' => $fee->created_at,
            ],
        ]);
    }

    // Make payment
    public function makePayment(Request $request, $feeId)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,card,online',
            'notes' => 'nullable|string',
        ]);

        $fee = Fee::where('user_id', Auth::id())->findOrFail($feeId);

        if ($fee->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'This fee has already been fully paid',
            ], 400);
        }

        // Create payment
        $payment = Payment::create([
            'user_id' => Auth::id(),
            'fee_id' => $fee->id,
            'amount' => $request->amount,
            'payment_method' => $request->payment_method,
            'transaction_id' => 'TXN-' . Str::upper(Str::random(12)),
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
            'message' => 'Payment successful',
            'data' => [
                'payment' => $payment,
                'fee' => [
                    'id' => $fee->id,
                    'status' => $fee->status,
                    'remaining_balance' => $fee->remaining_balance,
                ],
            ],
        ]);
    }

    // Generate invoice PDF
    public function downloadInvoice($feeId)
    {
        $fee = Fee::where('user_id', Auth::id())
            ->with(['user', 'payments' => function ($query) {
                $query->where('status', 'completed')->orderBy('created_at', 'desc');
            }])
            ->findOrFail($feeId);

        $data = [
            'fee' => $fee,
            'user' => $fee->user,
            'payments' => $fee->payments,
            'invoice_number' => 'INV-' . str_pad($fee->id, 6, '0', STR_PAD_LEFT),
            'invoice_date' => now()->format('F d, Y'),
        ];

        $pdf = Pdf::loadView('invoices.fee-invoice', $data)
            ->setPaper('a4', 'portrait');

        return $pdf->download('invoice-' . $data['invoice_number'] . '.pdf');
    }

    // Get payment statistics
    public function getStatistics()
    {
        $userId = Auth::id();

        $totalFees = Fee::where('user_id', $userId)->sum('amount');
        $totalPaid = Payment::where('user_id', $userId)
            ->where('status', 'completed')
            ->sum('amount');
        $pendingFees = Fee::where('user_id', $userId)
            ->where('status', 'pending')
            ->sum('amount');
        $overdueFees = Fee::where('user_id', $userId)
            ->where('status', 'overdue')
            ->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'total_fees' => $totalFees,
                'total_paid' => $totalPaid,
                'pending_fees' => $pendingFees,
                'overdue_fees' => $overdueFees,
                'remaining_balance' => $totalFees - $totalPaid,
            ],
        ]);
    }

    // Get payment history
    public function getPaymentHistory()
    {
        $payments = Payment::where('user_id', Auth::id())
            ->with('fee')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }
}
