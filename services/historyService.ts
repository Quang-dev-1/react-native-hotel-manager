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
    paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
    paymentMethod?: 'CASH' | 'ONLINE' | 'MIXED';

    promotionCode?: string;
    promotionName?: string;
    discountAmount?: number;
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
    paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
    paymentMethod?: 'CASH' | 'ONLINE' | 'MIXED';

    promotionCode?: string;
    promotionName?: string;
    discountAmount?: number;
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

    async updatePaymentStatus(
        id: number,
        paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL',
        paymentMethod?: 'CASH' | 'ONLINE' | 'MIXED'
    ): Promise<HistoryRecord> {
        try {
            console.log(`🔄 Updating payment status for history ${id}:`, { paymentStatus, paymentMethod });
            const response = await apiClient.put<HistoryRecord>(`/checkout-history/${id}/payment-status`, {
                paymentStatus,
                paymentMethod
            });
            console.log('✅ Payment status updated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Update payment status error:', error);
            throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái thanh toán');
        }
    }
}

export default new HistoryService();