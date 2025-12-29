<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - {{ $invoice_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #2d3748;
            background: #ffffff;
        }
        
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        
        /* Header Section */
        .invoice-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
        }
        
        .invoice-header::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 300px;
            height: 300px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(30%, -30%);
        }
        
        .header-content {
            position: relative;
            z-index: 1;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            color: white;
        }
        
        .company-info h1 {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: -1px;
            margin-bottom: 5px;
            color: white;
        }
        
        .company-info .tagline {
            font-size: 13px;
            opacity: 0.9;
            margin-bottom: 15px;
        }
        
        .company-info .contact {
            font-size: 11px;
            opacity: 0.85;
        }
        
        .invoice-meta {
            text-align: right;
            background: rgba(255, 255, 255, 0.15);
            padding: 15px 20px;
            border-radius: 8px;
            backdrop-filter: blur(10px);
        }
        
        .invoice-meta h2 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
            color: white;
        }
        
        .invoice-meta p {
            font-size: 11px;
            margin: 3px 0;
            opacity: 0.9;
        }
        
        .invoice-meta .invoice-number {
            font-weight: 700;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        /* Billing Section */
        .billing-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 35px;
            gap: 30px;
        }
        
        .billing-card {
            flex: 1;
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px;
        }
        
        .billing-card h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #667eea;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        
        .billing-card p {
            font-size: 11pt;
            margin: 5px 0;
            color: #4a5568;
        }
        
        .billing-card .name {
            font-size: 14pt;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 8px;
        }
        
        .billing-card .label {
            display: inline-block;
            font-weight: 600;
            min-width: 85px;
            color: #718096;
        }
        
        /* Status Badge */
        .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-paid {
            background: #c6f6d5;
            color: #22543d;
            border: 2px solid #9ae6b4;
        }
        
        .status-pending {
            background: #feebc8;
            color: #7c2d12;
            border: 2px solid #fbd38d;
        }
        
        .status-overdue {
            background: #fed7d7;
            color: #742a2a;
            border: 2px solid #fc8181;
        }
        
        /* Fee Details Table */
        .fee-details {
            margin-bottom: 30px;
        }
        
        .fee-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .fee-table thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .fee-table th {
            padding: 15px;
            text-align: left;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .fee-table tbody tr {
            border-bottom: 1px solid #e2e8f0;
        }
        
        .fee-table tbody tr:last-child {
            border-bottom: none;
        }
        
        .fee-table td {
            padding: 18px 15px;
            font-size: 11pt;
        }
        
        .fee-table td:first-child {
            font-weight: 600;
            color: #4a5568;
        }
        
        /* Payment History */
        .payment-history {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 3px solid #667eea;
        }
        
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .payment-table thead {
            background: #f7fafc;
        }
        
        .payment-table th {
            padding: 12px;
            text-align: left;
            font-weight: 700;
            font-size: 10px;
            text-transform: uppercase;
            color: #667eea;
            border-bottom: 2px solid #e2e8f0;
        }
        
        .payment-table td {
            padding: 12px;
            font-size: 10pt;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .payment-table tr:last-child td {
            border-bottom: none;
        }
        
        .payment-table tr:hover {
            background: #f7fafc;
        }
        
        /* Summary Section */
        .summary-section {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }
        
        .summary-table {
            width: 350px;
            background: #f7fafc;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .summary-table tr {
            border-bottom: 1px solid #e2e8f0;
        }
        
        .summary-table tr:last-child {
            border-bottom: none;
        }
        
        .summary-table td {
            padding: 12px 20px;
            font-size: 11pt;
        }
        
        .summary-table td:first-child {
            font-weight: 600;
            color: #4a5568;
        }
        
        .summary-table td:last-child {
            text-align: right;
            font-weight: 700;
            color: #2d3748;
        }
        
        .summary-table .total-row {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .summary-table .total-row td {
            font-size: 16px;
            font-weight: 800;
            padding: 18px 20px;
        }
        
        /* Footer */
        .invoice-footer {
            background: #f7fafc;
            padding: 25px;
            border-radius: 10px;
            border: 2px solid #e2e8f0;
            text-align: center;
        }
        
        .invoice-footer h4 {
            color: #667eea;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        
        .invoice-footer p {
            font-size: 10pt;
            color: #4a5568;
            margin: 5px 0;
            line-height: 1.6;
        }
        
        .invoice-footer .contact-info {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            font-weight: 600;
            color: #667eea;
        }
        
        /* Thank You Message */
        .thank-you {
            text-align: center;
            margin-top: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <div class="header-content">
                <div class="company-info">
                    <h1>TRACKSY</h1>
                    <p class="tagline">Smart Student Transport Management</p>
                    <div class="contact">
                        <p>📧 admin@tracksy.com</p>
                        <p>📞 (123) 456-7890</p>
                    </div>
                </div>
                <div class="invoice-meta">
                    <h2>INVOICE</h2>
                    <p class="invoice-number">#{{ $invoice_number }}</p>
                    <p><strong>Date:</strong> {{ $invoice_date }}</p>
                    <p><strong>Due:</strong> {{ $fee->due_date->format('M d, Y') }}</p>
                </div>
            </div>
        </div>

        <!-- Billing Information -->
        <div class="billing-section">
            <div class="billing-card">
                <h3>Bill To</h3>
                <p class="name">{{ $user->name }}</p>
                @if($user->student_id)
                <p><span class="label">Student ID:</span> {{ $user->student_id }}</p>
                @endif
                @if($user->institution)
                <p><span class="label">Institution:</span> {{ $user->institution }}</p>
                @endif
                <p><span class="label">Email:</span> {{ $user->email }}</p>
                @if($user->phone)
                <p><span class="label">Phone:</span> {{ $user->phone }}</p>
                @endif
            </div>
            
            <div class="billing-card">
                <h3>Payment Status</h3>
                <p style="margin-bottom: 10px;">
                    <span class="status-badge status-{{ $fee->status }}">
                        {{ ucfirst($fee->status) }}
                    </span>
                </p>
                <p><span class="label">Semester:</span> {{ $fee->semester }}</p>
                <p><span class="label">Fee Type:</span> {{ ucfirst(str_replace('_', ' ', $fee->fee_type)) }}</p>
                <p><span class="label">Created:</span> {{ $fee->created_at->format('M d, Y') }}</p>
            </div>
        </div>

        <!-- Fee Details -->
        <div class="fee-details">
            <h3 class="section-title">Fee Details</h3>
            <table class="fee-table">
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
                            <strong>{{ ucfirst(str_replace('_', ' ', $fee->fee_type)) }} Fee</strong>
                            @if($fee->description)
                            <br><span style="font-size: 9pt; color: #718096;">{{ $fee->description }}</span>
                            @endif
                        </td>
                        <td>{{ $fee->semester }}</td>
                        <td style="text-align: right; font-weight: 700; font-size: 13pt;">${{ number_format($fee->amount, 2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Payment History -->
        @if($payments->count() > 0)
        <div class="payment-history">
            <h3 class="section-title">Payment History</h3>
            <table class="payment-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Transaction ID</th>
                        <th>Method</th>
                        <th style="text-align: right;">Amount</th>
                        <th style="text-align: center;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($payments as $payment)
                    <tr>
                        <td>{{ $payment->created_at->format('M d, Y') }}</td>
                        <td style="font-family: monospace; font-size: 9pt;">{{ $payment->transaction_id }}</td>
                        <td>{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</td>
                        <td style="text-align: right; font-weight: 600;">${{ number_format($payment->amount, 2) }}</td>
                        <td style="text-align: center;">
                            <span class="status-badge status-{{ $payment->status }}">
                                {{ ucfirst($payment->status) }}
                            </span>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Summary -->
        <div class="summary-section">
            <table class="summary-table">
                <tr>
                    <td>Subtotal</td>
                    <td>${{ number_format($fee->amount, 2) }}</td>
                </tr>
                <tr>
                    <td>Total Paid</td>
                    <td style="color: #10b981;">${{ number_format($fee->total_paid, 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td>Balance Due</td>
                    <td>${{ number_format($fee->remaining_balance, 2) }}</td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="invoice-footer">
            <h4>📋 Payment Instructions</h4>
            <p>Please make payment before the due date to avoid late fees and service interruptions.</p>
            <p>All payments are securely processed through our trusted payment partners.</p>
            <p class="contact-info">
                For any queries, contact us at admin@tracksy.com or call (123) 456-7890
            </p>
        </div>

        <!-- Thank You -->
        <div class="thank-you">
            ✨ Thank you for using Tracksy! We appreciate your prompt payment. ✨
        </div>
    </div>
</body>
</html>
