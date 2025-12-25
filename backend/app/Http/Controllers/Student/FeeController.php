<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Fee;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
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
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|string|in:cash,card,online',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

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
        try {
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

            // Generate PDF with proper error handling - use simplified template that works better with DomPDF
            $pdf = Pdf::loadView('invoices.fee-invoice-simple', $data)
                ->setPaper('a4', 'portrait')
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('isPhpEnabled', false)
                ->setOption('isRemoteEnabled', false)
                ->setOption('isFontSubsettingEnabled', false)
                ->setOption('dpi', 96)
                ->setOption('defaultFont', 'DejaVu Sans');

            // Return PDF download response with proper headers
            return response()->streamDownload(
                function () use ($pdf) {
                    echo $pdf->output();
                },
                'invoice-' . $data['invoice_number'] . '.pdf',
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="invoice-' . $data['invoice_number'] . '.pdf"',
                    'Cache-Control' => 'no-cache, no-store, must-revalidate',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Invoice PDF generation failed', [
                'fee_id' => $feeId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate invoice PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    // Generate receipt PDF
    public function downloadReceipt($paymentId)
    {
        try {
            $payment = Payment::where('user_id', Auth::id())
                ->with(['fee', 'user'])
                ->findOrFail($paymentId);

            // Only allow download for completed payments
            if ($payment->status !== 'completed') {
                return response()->json([
                    'success' => false,
                    'message' => 'Receipt is only available for completed payments',
                ], 400);
            }

            $data = [
                'payment' => $payment,
                'fee' => $payment->fee,
                'user' => $payment->user,
                'receipt_number' => 'RCP-' . str_pad($payment->id, 6, '0', STR_PAD_LEFT),
                'receipt_date' => $payment->created_at->format('F d, Y'),
                'payment_date' => $payment->created_at->format('F d, Y'),
            ];

            // Generate PDF with proper error handling - use simplified template that works better with DomPDF
            $pdf = Pdf::loadView('receipts.payment-receipt-simple', $data)
                ->setPaper('a4', 'portrait')
                ->setOption('isHtml5ParserEnabled', true)
                ->setOption('isPhpEnabled', false)
                ->setOption('isRemoteEnabled', false)
                ->setOption('isFontSubsettingEnabled', false)
                ->setOption('dpi', 96)
                ->setOption('defaultFont', 'DejaVu Sans');

            // Return PDF download response with proper headers
            return response()->streamDownload(
                function () use ($pdf) {
                    echo $pdf->output();
                },
                'receipt-' . $data['receipt_number'] . '.pdf',
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => 'attachment; filename="receipt-' . $data['receipt_number'] . '.pdf"',
                    'Cache-Control' => 'no-cache, no-store, must-revalidate',
                    'Pragma' => 'no-cache',
                    'Expires' => '0',
                ]
            );
        } catch (\Exception $e) {
            \Log::error('Receipt PDF generation failed', [
                'payment_id' => $paymentId,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate receipt PDF: ' . $e->getMessage(),
            ], 500);
        }
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
