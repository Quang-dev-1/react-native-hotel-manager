import apiClient from './api';

export interface HotelService {
  id?: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
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