import apiClient from './api';

export interface HotelService {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
}

export interface BookingServiceItem {
  id?: number;
  bookingId: number;
  serviceId: number;
  serviceName?: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

class HotelServiceAPI {
  // ============ SERVICE APIs ============

  async getAllServices(): Promise<HotelService[]> {
    try {
      console.log('📋 Fetching all services...');
      const response = await apiClient.get<HotelService[]>('/services');
      console.log('✅ Services fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get services error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách dịch vụ');
    }
  }

  async getServiceById(id: number): Promise<HotelService> {
    try {
      const response = await apiClient.get<HotelService>(`/services/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get service by id error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin dịch vụ');
    }
  }

  async getServicesByCategory(category: string): Promise<HotelService[]> {
    try {
      const response = await apiClient.get<HotelService[]>(`/services/category/${category}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get services by category error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy dịch vụ theo danh mục');
    }
  }

  async getAvailableServices(): Promise<HotelService[]> {
    try {
      const response = await apiClient.get<HotelService[]>('/services/available');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get available services error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy dịch vụ khả dụng');
    }
  }

  async addService(data: HotelService): Promise<HotelService> {
    try {
      console.log('➕ Adding service:', data);
      const response = await apiClient.post<HotelService>('/services', data);
      console.log('✅ Service added:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Add service error:', error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Không thể thêm dịch vụ');
    }
  }

  // Thêm dịch vụ vào booking và cập nhật tổng tiền
  async addServiceToBooking(bookingId: number, serviceId: number, quantity: number): Promise<BookingServiceItem> {
    try {
      console.log(`➕ Adding service to booking ${bookingId}:`, { serviceId, quantity });
      const response = await apiClient.post<BookingServiceItem>(
        `/bookings/${bookingId}/services`,
        null,
        {
          params: { serviceId, quantity }
        }
      );
      console.log('✅ Service added to booking:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Add service to booking error:', error);
      throw new Error(error.response?.data?.message || 'Không thể thêm dịch vụ vào booking');
    }
  }

  // Lấy danh sách dịch vụ của một booking
  async getBookingServices(bookingId: number): Promise<BookingServiceItem[]> {
    try {
      console.log(`📋 Fetching services for booking ${bookingId}...`);
      const response = await apiClient.get<BookingServiceItem[]>(`/bookings/${bookingId}/services`);
      console.log('✅ Booking services fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get booking services error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách dịch vụ');
    }
  }

  // Xóa dịch vụ khỏi booking
  async removeServiceFromBooking(bookingId: number, serviceItemId: number): Promise<void> {
    try {
      console.log(`🗑️ Removing service ${serviceItemId} from booking ${bookingId}...`);
      await apiClient.delete(`/bookings/${bookingId}/services/${serviceItemId}`);
      console.log('✅ Service removed from booking');
    } catch (error: any) {
      console.error('❌ Remove service from booking error:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa dịch vụ');
    }
  }

  async updateService(id: number, data: HotelService): Promise<HotelService> {
    try {
      console.log('🔄 Updating service:', id, data);
      const response = await apiClient.put<HotelService>(`/services/${id}`, data);
      console.log('✅ Service updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update service error:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật dịch vụ');
    }
  }

  async deleteService(id: number): Promise<void> {
    try {
      console.log('🗑️ Deleting service:', id);
      await apiClient.delete(`/services/${id}`);
      console.log('✅ Service deleted');
    } catch (error: any) {
      console.error('❌ Delete service error:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa dịch vụ');
    }
  }
}

export default new HotelServiceAPI();