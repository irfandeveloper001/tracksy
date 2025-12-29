import api from './client';

const feeService = {
  // Get all fees
  async getFees() {
    try {
      const response = await api.get('/student/fees');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get fees error:', error);
      throw error;
    }
  },

  // Get single fee details
  async getFee(id: number) {
    try {
      const response = await api.get(`/student/fees/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get fee error:', error);
      throw error;
    }
  },

  // Make payment
  async makePayment(feeId: number, paymentData: {
    amount: number;
    payment_method: string;
    notes?: string;
  }) {
    try {
      const response = await api.post(`/student/fees/${feeId}/pay`, paymentData);
      return response.data;
    } catch (error: any) {
      console.error('Make payment error:', error);
      throw error;
    }
  },

  // Download invoice
  async downloadInvoice(feeId: number) {
    try {
      const response = await api.get(`/student/fees/${feeId}/invoice`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout for PDF generation
      });
      
      // Check if response is actually a PDF
      const contentType = response.headers['content-type'] || '';
      
      // If response is JSON error, handle it
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        try {
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Failed to generate invoice');
        } catch (parseError) {
          throw new Error('Failed to generate invoice. Server returned an error.');
        }
      }
      
      // Verify blob has content
      if (!response.data || response.data.size === 0) {
        throw new Error('Generated PDF is empty. Please contact support.');
      }
      
      // Verify it's actually a PDF by checking the first bytes
      const arrayBuffer = await response.data.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      
      if (pdfHeader !== '%PDF') {
        // Not a valid PDF, might be an error message
        const text = new TextDecoder().decode(arrayBuffer);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to generate invoice');
        } catch {
          throw new Error('Invalid PDF file received. Please try again.');
        }
      }
      
      // Create a blob URL and trigger download with proper MIME type
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'] || '';
      let filename = `invoice-${feeId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').replace(/^UTF-8''/, '');
        }
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank'); // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      
      // Also open in new tab for better user experience
      setTimeout(() => {
        window.open(url, '_blank');
      }, 100);
      
      // Cleanup after a longer delay to ensure download completes
      setTimeout(() => {
        link.remove();
        // Don't revoke URL immediately - let browser handle it
        setTimeout(() => {
        window.URL.revokeObjectURL(url);
        }, 1000);
      }, 500);
      
      return true;
    } catch (error: any) {
      console.error('Download invoice error:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Invoice generation timed out. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Invoice not found. The fee may have been deleted.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error generating invoice. Please contact support.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to download invoice. Please check your connection and try again.');
      }
    }
  },

  // Get payment statistics
  async getStatistics() {
    try {
      const response = await api.get('/student/fees/statistics');
      return response.data.data;
    } catch (error: any) {
      console.error('Get statistics error:', error);
      throw error;
    }
  },

  // Get payment history
  async getPaymentHistory() {
    try {
      const response = await api.get('/student/fees/payment-history');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Get payment history error:', error);
      throw error;
    }
  },

  // Download receipt
  async downloadReceipt(paymentId: number) {
    try {
      const response = await api.get(`/student/payments/${paymentId}/receipt`, {
        responseType: 'blob',
        timeout: 30000, // 30 second timeout for PDF generation
      });
      
      // Check if response is actually a PDF
      const contentType = response.headers['content-type'] || '';
      
      // If response is JSON error, handle it
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to generate receipt');
        } catch (parseError) {
          throw new Error('Failed to generate receipt. Server returned an error.');
        }
      }
      
      // Verify blob has content
      if (!response.data || response.data.size === 0) {
        throw new Error('Generated PDF is empty. Please contact support.');
      }
      
      // Verify it's actually a PDF by checking the first bytes
      const arrayBuffer = await response.data.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      
      if (pdfHeader !== '%PDF') {
        // Not a valid PDF, might be an error message
        const text = new TextDecoder().decode(arrayBuffer);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Failed to generate receipt');
        } catch {
          throw new Error('Invalid PDF file received. Please try again.');
        }
      }
      
      // Create a blob URL and trigger download with proper MIME type
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'] || '';
      let filename = `receipt-${paymentId}.pdf`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '').replace(/^UTF-8''/, '');
        }
      }
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank'); // Open in new tab as fallback
      document.body.appendChild(link);
      link.click();
      
      // Also open in new tab for better user experience
      setTimeout(() => {
        window.open(url, '_blank');
      }, 100);
      
      // Cleanup after a longer delay to ensure download completes
      setTimeout(() => {
        link.remove();
        // Don't revoke URL immediately - let browser handle it
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
      }, 500);
      
      return true;
    } catch (error: any) {
      console.error('Download receipt error:', error);
      
      // Provide more specific error messages
      if (error.code === 'ECONNABORTED') {
        throw new Error('Receipt generation timed out. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Receipt not found. The payment may have been deleted.');
      } else if (error.response?.status === 400) {
        // Handle the case where payment is not completed
        const errorData = error.response?.data;
        throw new Error(errorData?.message || 'Receipt is only available for completed payments.');
      } else if (error.response?.status === 500) {
        throw new Error('Server error generating receipt. Please contact support.');
      } else if (error.message) {
        throw error;
      } else {
        throw new Error('Failed to download receipt. Please check your connection and try again.');
      }
    }
  },
};

export default feeService;
