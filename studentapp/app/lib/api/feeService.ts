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
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error: any) {
      console.error('Download invoice error:', error);
      throw error;
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
};

export default feeService;
