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
  roomAmount?: number;
  serviceAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  deposit: number;
  status: string;
  notes?: string;
  promotionCode?: string;
  promotionName?: string;
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
  promotionCode?: string;
}

export interface DashboardStats {
  todayRentals: number;
  occupiedRooms: number;
  waitingRooms: number;
  cleaningRooms: number;
  totalRooms: number;
  availableRooms: number;
}

export interface BookingWithServices {
  id?: number;
  roomId: number;
  roomNumber?: string;
  customerName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomAmount: number;
  serviceAmount: number;
  discountAmount?: number;
  totalAmount: number;
  deposit: number;
  status: string;
  notes?: string;
  createdAt?: string;
  services?: {
    id: number;
    serviceId: number;
    serviceName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }[];
  promotions?: {
    id: number;
    promotionId: number;
    promotionCode: string;
    promotionName: string;
    discountAmount: number;
    appliedAt: string;
  }[];
}

export interface UpdateBookingRequest {
  customerName: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  deposit: number;
  notes?: string;
}

class BookingService {

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    try {
      console.log('➕ Creating booking:', data);

      const activeBookings = await this.getActiveBookings();
      const hasCheckedIn = activeBookings.some(
        b => b.roomId === data.roomId && b.status === 'CHECKED_IN'
      );

      if (hasCheckedIn) {
        console.log('⚠️ Room has active CHECKED_IN booking - new booking will be PENDING');
      }

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

  async updateBooking(bookingId: number, data: UpdateBookingRequest): Promise<Booking> {
    try {
      console.log(`🔄 Updating booking ${bookingId}:`, data);
      const response = await apiClient.put<Booking>(`/bookings/${bookingId}`, data);
      console.log('✅ Booking updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update booking error:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật booking');
    }
  }

  async getBookingWithServices(bookingId: number): Promise<BookingWithServices> {
    try {
      console.log(`📋 Fetching booking ${bookingId} with services...`);
      const response = await apiClient.get<BookingWithServices>(`/bookings/${bookingId}/details`);
      console.log('✅ Booking with services fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get booking with services error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin booking');
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

  async getBookedDatesByRoom(roomId: number): Promise<string[]> {
    try {
      console.log(`📅 Fetching booked dates for room ${roomId}...`);

      const response = await apiClient.get<Booking[]>('/bookings');

      const roomBookings = response.data.filter(booking =>
        booking.roomId === roomId &&
        ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status)
      );

      const bookedDates: string[] = [];

      roomBookings.forEach(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);

        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          bookedDates.push(d.toISOString().split('T')[0]);
        }
      });

      console.log('✅ Booked dates fetched:', bookedDates);
      return bookedDates;
    } catch (error: any) {
      console.error('❌ Get booked dates error:', error);
      return [];
    }
  }

  async getActiveBookings(): Promise<Booking[]> {
    try {
      console.log('📋 Fetching active bookings...');
      const allBookings = await apiClient.get<Booking[]>('/bookings');
      const activeBookings = allBookings.data.filter(
        booking => ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status)
      );
      console.log('✅ Active bookings fetched:', activeBookings);
      return activeBookings;
    } catch (error: any) {
      console.error('❌ Get active bookings error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách booking cần xử lý');
    }
  }

  async getBookingsByStatus(status: string): Promise<Booking[]> {
    try {
      console.log(`📋 Fetching bookings by status: ${status}...`);
      const response = await apiClient.get<Booking[]>(`/bookings/status?status=${status}`);
      console.log('✅ Bookings by status fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get bookings by status error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách đặt phòng');
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

  async confirmBooking(bookingId: number): Promise<Booking> {
    try {
      const booking = await this.getBookingById(bookingId);

      const activeBookings = await this.getActiveBookings();
      const hasCheckedIn = activeBookings.some(
        b => b.roomId === booking.roomId && b.status === 'CHECKED_IN' && b.id !== bookingId
      );

      if (hasCheckedIn) {
        throw new Error('Không thể xác nhận. Phòng này đang có khách đang ở. Vui lòng đợi khách trả phòng trước.');
      }

      console.log(`📤 Request: PUT /bookings/${bookingId}/confirm`);
      const response = await apiClient.put<Booking>(`/bookings/${bookingId}/confirm`);
      console.log('✅ Booking confirmed');
      return response.data;
    } catch (error: any) {
      console.error('❌ Confirm booking error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể xác nhận đặt phòng');
    }
  }

  async checkIn(bookingId: number): Promise<Booking> {
    try {
      const booking = await this.getBookingById(bookingId);

      const activeBookings = await this.getActiveBookings();
      const hasCheckedIn = activeBookings.some(
        b => b.roomId === booking.roomId && b.status === 'CHECKED_IN' && b.id !== bookingId
      );

      if (hasCheckedIn) {
        throw new Error('Không thể nhận phòng. Phòng này đang có khách đang ở. Vui lòng đợi khách trả phòng trước.');
      }

      console.log(`📤 Request: PUT /bookings/${bookingId}/checkin`);
      const response = await apiClient.put<Booking>(`/bookings/${bookingId}/checkin`);
      console.log('✅ Check-in successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Check-in error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Không thể nhận phòng');
    }
  }

  async checkOut(bookingId: number): Promise<Booking> {
    try {
      console.log(`📤 Request: PUT /bookings/${bookingId}/checkout`);
      const response = await apiClient.put<Booking>(`/bookings/${bookingId}/checkout`);
      console.log('✅ Checkout successful - Next PENDING booking can now be confirmed');
      return response.data;
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      throw new Error(error.response?.data?.message || 'Không thể trả phòng');
    }
  }

  async completeBooking(bookingId: number): Promise<Booking> {
    try {
      console.log(`📤 Request: PUT /bookings/${bookingId}/complete`);
      const response = await apiClient.put<Booking>(`/bookings/${bookingId}/complete`);
      console.log('✅ Booking completed');
      return response.data;
    } catch (error: any) {
      console.error('❌ Complete booking error:', error);
      throw new Error(error.response?.data?.message || 'Không thể hoàn thành đặt phòng');
    }
  }

  async cancelBooking(bookingId: number): Promise<void> {
    try {
      console.log(`📤 Request: PUT /bookings/${bookingId}/cancel`);
      await apiClient.put(`/bookings/${bookingId}/cancel`);
      console.log('✅ Booking cancelled');
    } catch (error: any) {
      console.error('❌ Cancel booking error:', error);
      throw new Error(error.response?.data?.message || 'Không thể hủy đặt phòng');
    }
  }


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

  async changeRoom(bookingId: number, newRoomId: number): Promise<Booking> {
    try {
      console.log(`🔄 Changing room for booking ${bookingId} to room ${newRoomId}`);
      const response = await apiClient.put<Booking>(`/bookings/${bookingId}/change-room`, {
        newRoomId: newRoomId
      });
      console.log('✅ Room changed successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Change room error:', error);
      throw new Error(error.response?.data?.message || 'Không thể đổi phòng');
    }
  }
}

export default new BookingService();