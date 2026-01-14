import apiClient from './api';

export interface HistoryRecord {
    id?: number;
    bookingId: number;
    roomNumber: string;
    customerName: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    actualCheckOut: string;
    nights: number;
    roomAmount: number;
    serviceAmount: number;
    totalAmount: number;
    deposit: number;
    notes?: string;
    createdAt?: string;
}

export interface CreateHistoryRequest {
    bookingId: number;
    roomNumber: string;
    customerName: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    actualCheckOut: string;
    nights: number;
    roomAmount: number;
    serviceAmount: number;
    totalAmount: number;
    deposit: number;
    notes?: string;
}

class HistoryService {
    async createHistory(data: CreateHistoryRequest): Promise<HistoryRecord> {
        try {
            console.log('➕ Creating history record:', data);
            const response = await apiClient.post<HistoryRecord>('/checkout-history', data);
            console.log('✅ History record created:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Create history error:', error.response?.data || error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Không thể tạo lịch sử');
        }
    }

    async getAllHistory(): Promise<HistoryRecord[]> {
        try {
            console.log('📋 Fetching all history...');
            const response = await apiClient.get<HistoryRecord[]>('/checkout-history');
            console.log('✅ History fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get history error:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy lịch sử');
        }
    }

    async getHistoryByDateRange(startDate: string, endDate: string): Promise<HistoryRecord[]> {
        try {
            console.log(`📋 Fetching history from ${startDate} to ${endDate}...`);
            const response = await apiClient.get<HistoryRecord[]>(
                `/checkout-history/range?startDate=${startDate}&endDate=${endDate}`
            );
            console.log('✅ History by date range fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get history by date range error:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy lịch sử theo khoảng thời gian');
        }
    }

    async getHistoryByBookingId(bookingId: number): Promise<HistoryRecord> {
        try {
            console.log(`📋 Fetching history for booking ${bookingId}...`);
            const response = await apiClient.get<HistoryRecord>(`/checkout-history/booking/${bookingId}`);
            console.log('✅ History fetched:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get history by booking id error:', error);
            throw new Error(error.response?.data?.message || 'Không thể lấy lịch sử theo booking');
        }
    }

    async deleteHistory(id: number): Promise<void> {
        try {
            console.log('🗑️ Deleting history:', id);
            await apiClient.delete(`/checkout-history/${id}`);
            console.log('✅ History deleted');
        } catch (error: any) {
            console.error('❌ Delete history error:', error);
            throw new Error(error.response?.data?.message || 'Không thể xóa lịch sử');
        }
    }
}

export default new HistoryService();