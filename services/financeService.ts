import api from './api';

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  transactionDate: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD';
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

export interface CreateTransactionRequest {
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  transactionDate: string;
  paymentMethod: 'CASH' | 'TRANSFER' | 'CARD';
  bookingId?: number;
}

class FinanceService {
  async getTransactions(period?: 'day' | 'week' | 'month' | 'year'): Promise<Transaction[]> {
    try {
      const params = period ? { period } : {};
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await api.get('/transactions/date-range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      throw error;
    }
  }

  async getFinanceSummary(period?: 'day' | 'week' | 'month' | 'year'): Promise<FinanceSummary> {
    try {
      const params = period ? { period } : {};
      const response = await api.get('/transactions/summary', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching finance summary:', error);
      throw error;
    }
  }

  async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    try {
      const response = await api.post('/transactions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id: number): Promise<void> {
    try {
      await api.delete(`/transactions/${id}`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  formatDateForAPI(dateStr: string): string {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  formatDateForDisplay(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
}

export default new FinanceService();