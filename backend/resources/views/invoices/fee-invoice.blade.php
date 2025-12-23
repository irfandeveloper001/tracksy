<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.5;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            border-bottom: 3px solid #4F46E5;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #4F46E5;
            font-size: 32px;
            margin-bottom: 5px;
        }
        .header .subtitle {
            color: #6B7280;
            font-size: 14px;
        }
        .invoice-info {
            display: table;
            width: 100%;
            margin-bottom: 30px;
        }
        .invoice-info-left {
            display: table-cell;
            width: 50%;
            vertical-align: top;
        }
        .invoice-info-right {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            text-align: right;
        }
        .invoice-label {
            font-weight: bold;
            color: #4B5563;
            margin-bottom: 5px;
        }
        .invoice-value {
            color: #111827;
            margin-bottom: 15px;
        }
        .invoice-number {
            font-size: 24px;
            color: #4F46E5;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        th {
            background-color: #4F46E5;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #E5E7EB;
        }
        tr:nth-child(even) {
            background-color: #F9FAFB;
        }
        .total-row {
            background-color: #EEF2FF !important;
            font-weight: bold;
            font-size: 14px;
        }
        .total-row td {
            border-bottom: 3px solid #4F46E5;
            padding: 15px 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-paid {
            background-color: #D1FAE5;
            color: #065F46;
        }
        .status-pending {
            background-color: #FEF3C7;
            color: #92400E;
        }
        .status-overdue {
            background-color: #FEE2E2;
            color: #991B1B;
        }
        .payment-history {
            margin-top: 40px;
        }
        .payment-history h3 {
            color: #111827;
            margin-bottom: 15px;
            font-size: 18px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #E5E7EB;
            text-align: center;
            color: #6B7280;
            font-size: 11px;
        }
        .amount {
            font-weight: 600;
            color: #111827;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="header">
            <h1>TRACKSY</h1>
            <p class="subtitle">Student Transport Management System</p>
        </div>

        <!-- Invoice Info -->
        <div class="invoice-info">
            <div class="invoice-info-left">
                <div class="invoice-label">BILL TO:</div>
                <div class="invoice-value">
                    <strong>{{ $user->name }}</strong><br>
                    Student ID: {{ $user->student_id }}<br>
                    Email: {{ $user->email }}<br>
                    @if($user->institution)
                        Institution: {{ $user->institution }}
                    @endif
                </div>
            </div>
            <div class="invoice-info-right">
                <div class="invoice-number">{{ $invoice_number }}</div>
                <div class="invoice-label">INVOICE DATE:</div>
                <div class="invoice-value">{{ $invoice_date }}</div>
                <div class="invoice-label">DUE DATE:</div>
                <div class="invoice-value">{{ $fee->due_date->format('F d, Y') }}</div>
                <div class="invoice-label">STATUS:</div>
                <div class="invoice-value">
                    <span class="status-badge status-{{ $fee->status }}">
                        {{ strtoupper($fee->status) }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Fee Details -->
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Semester</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <strong>{{ ucfirst($fee->fee_type) }} Fee</strong><br>
                        <small>{{ $fee->description }}</small>
                    </td>
                    <td>{{ $fee->semester ?? 'N/A' }}</td>
                    <td style="text-align: right;" class="amount">
                        ${{ number_format($fee->amount, 2) }}
                    </td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" style="text-align: right;">TOTAL AMOUNT:</td>
                    <td style="text-align: right;">${{ number_format($fee->amount, 2) }}</td>
                </tr>
                @if($fee->total_paid > 0)
                <tr>
                    <td colspan="2" style="text-align: right;"><strong>Total Paid:</strong></td>
                    <td style="text-align: right;" class="amount">
                        -${{ number_format($fee->total_paid, 2) }}
                    </td>
                </tr>
                <tr class="total-row">
                    <td colspan="2" style="text-align: right;">REMAINING BALANCE:</td>
                    <td style="text-align: right;">${{ number_format($fee->remaining_balance, 2) }}</td>
                </tr>
                @endif
            </tbody>
        </table>

        <!-- Payment History -->
        @if($payments->count() > 0)
        <div class="payment-history">
            <h3>Payment History</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Transaction ID</th>
                        <th>Method</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($payments as $payment)
                    <tr>
                        <td>{{ $payment->created_at->format('M d, Y h:i A') }}</td>
                        <td>{{ $payment->transaction_id }}</td>
                        <td>{{ ucfirst($payment->payment_method) }}</td>
                        <td style="text-align: right;" class="amount">
                            ${{ number_format($payment->amount, 2) }}
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for your payment!</p>
            <p>This is a computer-generated invoice and requires no signature.</p>
            <p>For any queries, please contact: support@tracksy.com</p>
        </div>
    </div>
</body>
</html>
