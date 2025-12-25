<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Invoice {{ $invoice_number }}</title>
    <style>
        @page {
            margin: 10mm 15mm;
            size: A4;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 10pt;
            color: #1a1a1a;
            line-height: 1.3;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 100%;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 18px;
            margin-bottom: 12px;
            border-radius: 6px;
        }
        .header-content {
            display: table;
            width: 100%;
        }
        .logo-section {
            display: table-cell;
            vertical-align: middle;
            width: 60%;
        }
        .logo-section h1 {
            font-size: 24pt;
            font-weight: bold;
            margin-bottom: 3px;
            letter-spacing: 2px;
        }
        .logo-section p {
            font-size: 9pt;
            opacity: 0.95;
        }
        .invoice-meta {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 40%;
        }
        .invoice-meta h2 {
            font-size: 16pt;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .invoice-meta p {
            font-size: 8.5pt;
            margin: 2px 0;
            opacity: 0.95;
        }
        .content-section {
            margin-bottom: 10px;
        }
        .two-column {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .column {
            display: table-cell;
            vertical-align: top;
            width: 48%;
            padding: 10px;
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
        }
        .column:first-child {
            margin-right: 2%;
        }
        .column h3 {
            color: #667eea;
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 6px;
            padding-bottom: 4px;
            border-bottom: 2px solid #667eea;
        }
        .column p {
            margin: 3px 0;
            font-size: 8.5pt;
        }
        .column strong {
            color: #333;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 8.5pt;
            font-weight: bold;
            margin-top: 3px;
        }
        .status-paid {
            background-color: #10b981;
            color: white;
        }
        .status-pending {
            background-color: #f59e0b;
            color: white;
        }
        .status-overdue {
            background-color: #ef4444;
            color: white;
        }
        .table-container {
            margin: 8px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        table thead {
            background-color: #667eea;
            color: white;
        }
        table th {
            padding: 7px 8px;
            text-align: left;
            font-size: 8.5pt;
            font-weight: bold;
        }
        table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 8.5pt;
        }
        table tbody tr:last-child td {
            border-bottom: none;
        }
        .amount-right {
            text-align: right;
        }
        .summary-box {
            float: right;
            width: 260px;
            margin-top: 5px;
            background-color: #f8f9fa;
            border: 2px solid #667eea;
            border-radius: 4px;
            padding: 10px;
        }
        .summary-box table {
            width: 100%;
            margin: 0;
        }
        .summary-box td {
            padding: 4px 4px;
            border: none;
            font-size: 8.5pt;
        }
        .summary-box .label {
            text-align: left;
        }
        .summary-box .value {
            text-align: right;
            font-weight: bold;
        }
        .summary-box .total-row {
            background-color: #667eea;
            color: white;
            font-size: 10pt;
            font-weight: bold;
            padding: 8px 4px;
        }
        .summary-box .total-row td {
            color: white;
        }
        .footer {
            clear: both;
            margin-top: 12px;
            padding: 10px 12px;
            background-color: #f8f9fa;
            border-top: 3px solid #667eea;
            text-align: center;
            font-size: 8.5pt;
        }
        .footer h4 {
            color: #667eea;
            font-size: 10pt;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .footer p {
            margin: 3px 0;
            color: #555;
        }
        .footer .contact {
            margin-top: 6px;
            font-weight: bold;
            color: #667eea;
        }
        .clearfix {
            clear: both;
        }
    </style>
</head>
<body>
    <div class="container">
    <!-- Header -->
    <div class="header">
            <div class="header-content">
                <div class="logo-section">
        <h1>TRACKSY</h1>
                    <p>Smart Student Transport Management System</p>
    </div>
                <div class="invoice-meta">
                    <h2>INVOICE</h2>
        <p><strong>Invoice #:</strong> {{ $invoice_number }}</p>
        <p><strong>Date:</strong> {{ $invoice_date }}</p>
        <p><strong>Due Date:</strong> {{ $fee->due_date->format('M d, Y') }}</p>
                </div>
            </div>
    </div>

        <!-- Billing Information -->
        <div class="content-section">
            <div class="two-column">
                <div class="column">
                        <h3>BILL TO</h3>
                        <p><strong>{{ $user->name }}</strong></p>
                        @if($user->student_id)
                    <p>Student ID: <strong>{{ $user->student_id }}</strong></p>
                        @endif
                        @if($user->institution)
                        <p>{{ $user->institution }}</p>
                        @endif
                        <p>{{ $user->email }}</p>
                        @if($user->phone)
                    <p>Phone: {{ $user->phone }}</p>
                        @endif
                    </div>
                <div class="column">
                        <h3>PAYMENT STATUS</h3>
                        <p>
                            <span class="status-badge status-{{ $fee->status }}">
                                {{ strtoupper($fee->status) }}
                            </span>
                        </p>
                        <p><strong>Semester:</strong> {{ $fee->semester }}</p>
                        <p><strong>Fee Type:</strong> {{ ucfirst(str_replace('_', ' ', $fee->fee_type)) }}</p>
                    @if($fee->description)
                    <p style="margin-top: 5px; font-size: 7.5pt; color: #666;">{{ $fee->description }}</p>
                    @endif
                </div>
                    </div>
    </div>

    <!-- Fee Details -->
        <div class="content-section">
            <h3 style="color: #667eea; font-size: 10pt; margin-bottom: 5px; font-weight: bold;">FEE DETAILS</h3>
            <div class="table-container">
                <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Semester</th>
                            <th class="amount-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>
                    <strong>{{ ucfirst(str_replace('_', ' ', $fee->fee_type)) }} Fee</strong>
                </td>
                <td>{{ $fee->semester }}</td>
                            <td class="amount-right"><strong>${{ number_format($fee->amount, 2) }}</strong></td>
            </tr>
        </tbody>
    </table>
            </div>
        </div>

        <!-- Payment History (if exists) -->
    @if($payments->count() > 0)
        <div class="content-section">
            <h3 style="color: #667eea; font-size: 10pt; margin-bottom: 5px; font-weight: bold;">PAYMENT HISTORY</h3>
            <div class="table-container">
                <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Method</th>
                            <th class="amount-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($payments as $payment)
            <tr>
                <td>{{ $payment->created_at->format('M d, Y') }}</td>
                            <td style="font-family: monospace; font-size: 8pt;">{{ $payment->transaction_id }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $payment->payment_method)) }}</td>
                            <td class="amount-right">${{ number_format($payment->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
            </div>
        </div>
    @endif

        <!-- Summary Box -->
        <div class="summary-box">
        <table>
            <tr>
                    <td class="label">Subtotal:</td>
                    <td class="value">${{ number_format($fee->amount, 2) }}</td>
            </tr>
            <tr>
                    <td class="label">Total Paid:</td>
                    <td class="value" style="color: #10b981;">${{ number_format($fee->total_paid, 2) }}</td>
            </tr>
                <tr class="total-row">
                    <td class="label">Balance Due:</td>
                    <td class="value">${{ number_format($fee->remaining_balance, 2) }}</td>
            </tr>
        </table>
    </div>

        <div class="clearfix"></div>

    <!-- Footer -->
    <div class="footer">
            <h4>Payment Instructions</h4>
            <p>Please make payment before the due date to avoid late fees and service interruptions.</p>
            <p class="contact">
                For inquiries: <strong>admin@tracksy.com</strong>
        </p>
            <p style="margin-top: 6px; font-size: 7.5pt; color: #888;">
                This is an official invoice from Tracksy. Thank you for using our services.
        </p>
        </div>
    </div>
</body>
</html>
