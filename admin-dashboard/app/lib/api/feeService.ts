import api from './client';

export interface Fee {
  id: number;
  user_id: number;
  fee_type: string;
  amount: number;
  semester: string;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  total_paid: number;
  remaining_balance: number;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    student_id?: string;
  };
  payments?: Payment[];
}

export interface Payment {
  id: number;
  user_id: number;
  fee_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface FeeStatistics {
  total_fees: number;
  total_paid: number;
  pending_amount: number;
  overdue_amount: number;
  collection_rate: number;
  total_students: number;
  students_with_pending_fees: number;
}

export interface CreateFeeData {
  user_id: number;
  fee_type: string;
  amount: number;
  semester: string;
  due_date: string;
  description?: string;
  send_notification?: boolean;
}

export interface CreateBulkFeeData {
  fee_type: string;
  amount: number;
  semester: string;
  due_date: string;
  description?: string;
  student_ids?: number[];
  send_notification?: boolean;
}

const feeService = {
  // Get all fees
  async getFees(filters?: {
    status?: string;
    student_id?: number;
    semester?: string;
    page?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.student_id) params.append('student_id', filters.student_id.toString());
    if (filters?.semester) params.append('semester', filters.semester);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const response = await api.get(`/admin/fees?${params.toString()}`);
    return response.data?.data || response.data;
  },

  // Get single fee
  async getFee(id: number): Promise<Fee> {
    const response = await api.get(`/admin/fees/${id}`);
    return response.data?.data || response.data;
  },

  // Create single fee
  async createFee(data: CreateFeeData): Promise<Fee> {
    const response = await api.post('/admin/fees', data);
    return response.data?.data || response.data;
  },

  // Create bulk fees
  async createBulkFees(data: CreateBulkFeeData): Promise<any> {
    const response = await api.post('/admin/fees/bulk', data);
    return response.data?.data || response.data;
  },

  // Update fee
  async updateFee(id: number, data: Partial<CreateFeeData>): Promise<Fee> {
    const response = await api.put(`/admin/fees/${id}`, data);
    return response.data?.data || response.data;
  },

  // Delete fee
  async deleteFee(id: number): Promise<void> {
    await api.delete(`/admin/fees/${id}`);
  },

  // Update due date
  async updateDueDate(id: number, dueDate: string, sendNotification: boolean = true): Promise<Fee> {
    const response = await api.put(`/admin/fees/${id}/due-date`, {
      due_date: dueDate,
      send_notification: sendNotification,
    });
    return response.data?.data || response.data;
  },

  // Generate and send invoice
  async generateInvoice(id: number): Promise<void> {
    await api.post(`/admin/fees/${id}/generate-invoice`);
  },

  // Generate and send invoices in bulk
  async generateBulkInvoices(feeIds: number[]): Promise<any> {
    const response = await api.post('/admin/fees/generate-bulk-invoices', {
      fee_ids: feeIds,
    });
    return response.data?.data || response.data;
  },

  // Record payment
  async recordPayment(id: number, data: {
    amount: number;
    payment_method: string;
    transaction_id?: string;
    notes?: string;
  }): Promise<any> {
    const response = await api.post(`/admin/fees/${id}/record-payment`, data);
    return response.data?.data || response.data;
  },

  // Get statistics
  async getStatistics(): Promise<FeeStatistics> {
    const response = await api.get('/admin/fees/statistics');
    return response.data?.data || response.data;
  },

  // Update overdue fees
  async updateOverdueFees(): Promise<any> {
    const response = await api.put('/admin/fees/update-overdue');
    return response.data?.data || response.data;
  },

  // Export fees report
  async exportReport(format: 'csv' | 'pdf', filters?: any): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key].toString());
      });
    }
    
    const response = await api.get(`/admin/fees/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default feeService;

