import apiClient from './api';

export interface Transaction {
  id?: number;
  type: string; // INCOME or EXPENSE
  category: string;
  amount: number;
  description: string;
  transactionDate: string;
  paymentMethod: string; // CASH, CARD, BANK_TRANSFER
  bookingId?: number;
  createdAt?: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  startDate: string;
  endDate: string;
}

class FinanceService {
  // ============ TRANSACTION APIs ============
  
  async createTransaction(data: Transaction): Promise<Transaction> {
    try {
      console.log('➕ Creating transaction:', data);
      const response = await apiClient.post<Transaction>('/transactions', data);
      console.log('✅ Transaction created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create transaction error:', error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Không thể tạo giao dịch');
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    try {
      console.log('📋 Fetching all transactions...');
      const response = await apiClient.get<Transaction[]>('/transactions');
      console.log('✅ Transactions fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get transactions error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách giao dịch');
    }
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<Transaction[]>(`/transactions/type/${type}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get transactions by type error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy giao dịch theo loại');
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<Transaction[]>(
        `/transactions/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Get transactions by date range error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy giao dịch theo khoảng thời gian');
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      console.log('🗑️ Deleting transaction:', id);
      await apiClient.delete(`/transactions/${id}`);
      console.log('✅ Transaction deleted');
    } catch (error: any) {
      console.error('❌ Delete transaction error:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa giao dịch');
    }
  }

  // ============ FINANCE SUMMARY APIs ============
  
  async getFinanceSummary(startDate: string, endDate: string): Promise<FinanceSummary> {
    try {
      console.log('📊 Fetching finance summary...');
      const response = await apiClient.get<FinanceSummary>(
        `/transactions/summary?startDate=${startDate}&endDate=${endDate}`
      );
      console.log('✅ Finance summary fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get finance summary error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy báo cáo tài chính');
    }
  }
}

export default new FinanceService();