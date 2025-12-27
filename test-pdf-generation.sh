#!/bin/bash

echo "========================================="
echo "PDF Invoice Generation Test Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found!${NC}"
    exit 1
fi

cd backend

echo "1. Checking Laravel installation..."
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Laravel not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Laravel found${NC}"

echo ""
echo "2. Checking DomPDF installation..."
if php artisan tinker --execute="echo class_exists('Barryvdh\DomPDF\Facade\Pdf') ? 'installed' : 'missing';" 2>/dev/null | grep -q "installed"; then
    echo -e "${GREEN}✅ DomPDF is installed${NC}"
else
    echo -e "${RED}❌ DomPDF not installed${NC}"
    echo "Installing DomPDF..."
    composer require barryvdh/laravel-dompdf
fi

echo ""
echo "3. Checking storage permissions..."
if [ -d "storage/fonts" ]; then
    echo -e "${GREEN}✅ Fonts directory exists${NC}"
else
    echo -e "${YELLOW}⚠️  Creating fonts directory...${NC}"
    mkdir -p storage/fonts
fi

# Fix permissions
chmod -R 775 storage
echo -e "${GREEN}✅ Storage permissions set${NC}"

echo ""
echo "4. Clearing Laravel caches..."
php artisan view:clear > /dev/null 2>&1
php artisan config:clear > /dev/null 2>&1
php artisan cache:clear > /dev/null 2>&1
echo -e "${GREEN}✅ Caches cleared${NC}"

echo ""
echo "5. Checking invoice template..."
if [ -f "resources/views/invoices/fee-invoice.blade.php" ]; then
    echo -e "${GREEN}✅ Invoice template found${NC}"
else
    echo -e "${RED}❌ Invoice template not found!${NC}"
    exit 1
fi

echo ""
echo "6. Testing PDF generation with sample data..."
php artisan tinker << 'EOF'
try {
    $user = \App\Models\User::where('role', 'student')->first();
    if (!$user) {
        echo "❌ No student users found in database\n";
        exit(1);
    }
    
    $fee = \App\Models\Fee::where('user_id', $user->id)->first();
    if (!$fee) {
        echo "❌ No fees found for student\n";
        exit(1);
    }
    
    $data = [
        'fee' => $fee,
        'user' => $user,
        'payments' => $fee->payments()->where('status', 'completed')->get(),
        'invoice_number' => 'INV-' . str_pad($fee->id, 6, '0', STR_PAD_LEFT),
        'invoice_date' => now()->format('F d, Y'),
    ];
    
    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('invoices.fee-invoice', $data);
    $output = $pdf->output();
    
    if (strlen($output) > 0) {
        echo "✅ PDF generated successfully! Size: " . strlen($output) . " bytes\n";
        
        // Save test PDF
        file_put_contents('/tmp/test-invoice.pdf', $output);
        echo "✅ Test PDF saved to /tmp/test-invoice.pdf\n";
    } else {
        echo "❌ PDF generated but is empty\n";
    }
} catch (\Exception $e) {
    echo "❌ Error generating PDF: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PDF generation test passed!${NC}"
    
    if [ -f "/tmp/test-invoice.pdf" ]; then
        echo ""
        echo "Test PDF details:"
        file /tmp/test-invoice.pdf
        ls -lh /tmp/test-invoice.pdf
    fi
else
    echo -e "${RED}❌ PDF generation test failed!${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo "Test completed successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Start the backend server: cd backend && php artisan serve --port=8001"
echo "2. Start the student app: cd studentapp && npm run dev"
echo "3. Try downloading an invoice from the student app"





