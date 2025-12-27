# Offline Payment System Demo Data

This directory contains JSON files for offline demonstration of the Tracksy payment system.

## Files Overview

### 1. `payment_methods.json`
Contains available payment methods supported by the system.

**Fields:**
- `id`: Unique payment method identifier
- `code`: Method code (cash, card, online, etc.)
- `name`: Full name of the payment method
- `display_name`: User-friendly display name
- `description`: Method description
- `is_active`: Whether the method is currently active
- `processing_time`: Expected processing time
- `fee_percentage`: Processing fee percentage
- `min_amount` / `max_amount`: Transaction limits
- `supported_currencies`: List of supported currencies

**Payment Methods Included:**
- Cash Payment
- Debit/Credit Card
- Online Banking
- Easypaisa
- JazzCash
- Bank Transfer

### 2. `payments.json`
Contains payment records with transaction details.

**Fields:**
- `id`: Unique payment identifier
- `payment_id`: Numeric payment ID
- `user_id`: User who made the payment
- `student_id`: Student ID
- `fee_id`: Associated fee ID
- `amount`: Payment amount in PKR
- `currency`: Currency code (PKR)
- `payment_method`: Payment method used
- `transaction_id`: Unique transaction identifier
- `status`: Payment status (completed, pending, failed)
- `notes`: Additional payment notes
- `processed_at`: When payment was processed
- `completed_at`: When payment was completed

**Status Types:**
- `completed`: Payment successfully processed
- `pending`: Payment is being processed
- `failed`: Payment failed

### 3. `transactions.json`
Contains detailed transaction records with gateway information.

**Fields:**
- `id`: Unique transaction identifier
- `transaction_id`: Transaction reference number
- `payment_id`: Associated payment ID
- `transaction_type`: Type of transaction (payment)
- `amount`: Transaction amount
- `currency`: Currency code (PKR)
- `payment_method`: Payment method used
- `status`: Transaction status
- `gateway`: Payment gateway used
- `gateway_transaction_id`: Gateway's transaction ID
- `gateway_response_code`: Response code from gateway
- `gateway_response_message`: Response message
- `authorization_code`: Authorization code (if applicable)
- `processing_fee`: Processing fee charged
- `net_amount`: Net amount after fees
- `metadata`: Additional transaction metadata

### 4. `receipts.json`
Contains receipt information for completed payments.

**Fields:**
- `id`: Unique receipt identifier
- `receipt_number`: Receipt reference number
- `payment_id`: Associated payment ID
- `transaction_id`: Associated transaction ID
- `user_id`: User who received the receipt
- `student_id`: Student ID
- `student_name`: Student's full name
- `amount`: Receipt amount
- `currency`: Currency code (PKR)
- `payment_method`: Payment method used
- `status`: Receipt status (issued)
- `items`: Array of receipt line items
- `subtotal`: Subtotal amount
- `tax`: Tax amount
- `discount`: Discount amount
- `total`: Total amount
- `amount_paid`: Amount paid
- `balance_due`: Remaining balance
- `pdf_url`: URL to receipt PDF
- `metadata`: Additional receipt metadata

## Usage

These files are designed for **offline demonstration purposes only**. They can be used to:

1. **Test Payment Flows**: Simulate different payment scenarios
2. **UI Development**: Populate payment interfaces with realistic data
3. **Demo Presentations**: Show payment system functionality without backend
4. **Testing**: Test frontend components with consistent data

## Data Characteristics

- **Currency**: All amounts are in PKR (Pakistani Rupees)
- **Timestamps**: ISO 8601 format (UTC)
- **IDs**: Realistic alphanumeric identifiers
- **Statuses**: Various payment and transaction statuses
- **Methods**: Multiple payment methods represented

## Sample Data Statistics

- **Total Payments**: 8 records
- **Total Transactions**: 8 records
- **Total Receipts**: 6 records
- **Payment Methods**: 6 methods
- **Total Amount**: 33,000 PKR
- **Status Distribution**: 
  - Completed: 6
  - Pending: 1
  - Failed: 1

## Important Notes

⚠️ **These files are for demonstration purposes only.**

- Do not use in production
- Do not connect to real payment gateways
- Data is simulated and not linked to real accounts
- All transaction IDs and references are fictional

## File Structure

```
data/
├── README.md
├── payment_methods.json
├── payments.json
├── transactions.json
└── receipts.json
```

## Validation

All JSON files are validated and properly formatted. You can verify them using:

```bash
python3 -m json.tool payment_methods.json
python3 -m json.tool payments.json
python3 -m json.tool transactions.json
python3 -m json.tool receipts.json
```

## Last Updated

December 25, 2025

---

**Tracksy Student Portal** - Offline Demo Data v1.0.0


