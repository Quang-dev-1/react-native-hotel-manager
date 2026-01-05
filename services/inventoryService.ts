import apiClient from './api';

export interface Inventory {
  id?: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  lastUpdated?: string;
}

class InventoryService {
  // ============ INVENTORY APIs ============
  
  async getAllInventory(): Promise<Inventory[]> {
    try {
      console.log('📋 Fetching all inventory...');
      const response = await apiClient.get<Inventory[]>('/inventory');
      console.log('✅ Inventory fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get inventory error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách hàng tồn kho');
    }
  }

  async getInventoryById(id: number): Promise<Inventory> {
    try {
      const response = await apiClient.get<Inventory>(`/inventory/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get inventory by id error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin hàng tồn kho');
    }
  }

  async getInventoryByCategory(category: string): Promise<Inventory[]> {
    try {
      const response = await apiClient.get<Inventory[]>(`/inventory/category/${category}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get inventory by category error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy hàng tồn kho theo danh mục');
    }
  }

  async getLowStockItems(): Promise<Inventory[]> {
    try {
      console.log('⚠️ Fetching low stock items...');
      const response = await apiClient.get<Inventory[]>('/inventory/low-stock');
      console.log('✅ Low stock items fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get low stock items error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy hàng sắp hết');
    }
  }

  async addInventory(data: Inventory): Promise<Inventory> {
    try {
      console.log('➕ Adding inventory:', data);
      const response = await apiClient.post<Inventory>('/inventory', data);
      console.log('✅ Inventory added:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Add inventory error:', error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Không thể thêm hàng tồn kho');
    }
  }

  async updateInventory(id: number, data: Inventory): Promise<Inventory> {
    try {
      console.log('🔄 Updating inventory:', id, data);
      const response = await apiClient.put<Inventory>(`/inventory/${id}`, data);
      console.log('✅ Inventory updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update inventory error:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật hàng tồn kho');
    }
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    try {
      console.log('📦 Updating stock:', id, quantity);
      await apiClient.put(`/inventory/${id}/stock?quantity=${quantity}`);
      console.log('✅ Stock updated');
    } catch (error: any) {
      console.error('❌ Update stock error:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật số lượng');
    }
  }

  async deleteInventory(id: number): Promise<void> {
    try {
      console.log('🗑️ Deleting inventory:', id);
      await apiClient.delete(`/inventory/${id}`);
      console.log('✅ Inventory deleted');
    } catch (error: any) {
      console.error('❌ Delete inventory error:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa hàng tồn kho');
    }
  }
}

export default new InventoryService();