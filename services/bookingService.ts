import apiClient from './api';

export interface Booking {
  id?: number;
  roomId: number;
  roomNumber?: string;
  customerName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  deposit: number;
  status: string;
  notes?: string;
  createdAt?: string;
}

export interface CreateBookingRequest {
  roomId: number;
  customerName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  deposit: number;
  notes?: string;
}

export interface DashboardStats {
  todayRentals: number;
  occupiedRooms: number;
  waitingRooms: number;
  cleaningRooms: number;
  totalRooms: number;
  availableRooms: number;
}

class BookingService {
  // ============ BOOKING APIs ============
  
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    try {
      console.log('➕ Creating booking:', data);
      const response = await apiClient.post<Booking>('/bookings', data);
      console.log('✅ Booking created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create booking error:', error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Không thể tạo đặt phòng');
    }
  }

  async getAllBookings(): Promise<Booking[]> {
    try {
      console.log('📋 Fetching all bookings...');
      const response = await apiClient.get<Booking[]>('/bookings');
      console.log('✅ Bookings fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get bookings error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đặt phòng');
    }
  }

  async getActiveBookings(): Promise<Booking[]> {
    try {
      console.log('📋 Fetching active bookings...');
      const response = await apiClient.get<Booking[]>('/bookings/active');
      console.log('✅ Active bookings fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get active bookings error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phòng đang thuê');
    }
  }

  async getBookingById(id: number): Promise<Booking> {
    try {
      const response = await apiClient.get<Booking>(`/bookings/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get booking by id error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin đặt phòng');
    }
  }

  // ✅ SỬA: Đổi từ POST sang PUT
  async checkOut(bookingId: number): Promise<void> {
    try {
      console.log(`📤 Request: PUT /bookings/${bookingId}/checkout`);
      await apiClient.put(`/bookings/${bookingId}/checkout`);
      console.log('✅ Checkout successful');
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      console.error('❌ Response error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Không thể trả phòng');
    }
  }

  // ✅ SỬA: Đổi từ POST sang PUT
  async cancelBooking(bookingId: number): Promise<void> {
    try {
      console.log(`📤 Request: PUT /bookings/${bookingId}/cancel`);
      await apiClient.put(`/bookings/${bookingId}/cancel`);
      console.log('✅ Booking cancelled');
    } catch (error: any) {
      console.error('❌ Cancel booking error:', error);
      console.error('❌ Response error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Không thể hủy đặt phòng');
    }
  }

  // ============ STATISTICS APIs ============
  
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await apiClient.get<DashboardStats>('/bookings/stats');
      console.log('✅ Stats fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get stats error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thống kê');
    }
  }
}

export default new BookingService();