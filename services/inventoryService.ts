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

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  categories: Record<string, number>;
}

class InventoryService {
  // ============ INVENTORY APIs ============
  
  async getAllInventory(): Promise<Inventory[]> {
    try {
      console.log('📋 Fetching all inventory...');
      const response = await apiClient.get<Inventory[]>('/inventory');
      console.log('✅ Inventory fetched:', response.data.length, 'items');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get inventory error:', error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể lấy danh sách hàng tồn kho';
      throw new Error(message);
    }
  }

  async getInventoryById(id: number): Promise<Inventory> {
    try {
      console.log('🔍 Fetching inventory by id:', id);
      const response = await apiClient.get<Inventory>(`/inventory/${id}`);
      console.log('✅ Inventory found:', response.data.name);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get inventory by id error:', error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể lấy thông tin hàng tồn kho';
      throw new Error(message);
    }
  }

  async getInventoryByCategory(category: string): Promise<Inventory[]> {
    try {
      console.log('📦 Fetching inventory by category:', category);
      const response = await apiClient.get<Inventory[]>(`/inventory/category/${category}`);
      console.log('✅ Found', response.data.length, 'items in category:', category);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get inventory by category error:', error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể lấy hàng tồn kho theo danh mục';
      throw new Error(message);
    }
  }

  async getLowStockItems(): Promise<Inventory[]> {
    try {
      console.log('⚠️ Fetching low stock items...');
      const response = await apiClient.get<Inventory[]>('/inventory/low-stock');
      console.log('✅ Low stock items:', response.data.length);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get low stock items error:', error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể lấy hàng sắp hết';
      throw new Error(message);
    }
  }

  async addInventory(data: Inventory): Promise<Inventory> {
    try {
      console.log('➕ Adding inventory:', data.name);
      
      // Validate dữ liệu trước khi gửi
      if (!data.name || !data.category || !data.unit) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }
      
      if (data.quantity < 0 || data.minStock < 0 || data.price < 0) {
        throw new Error('Số lượng và giá phải là số dương');
      }
      
      const response = await apiClient.post<Inventory>('/inventory', data);
      console.log('✅ Inventory added successfully:', response.data.name);
      return response.data;
    } catch (error: any) {
      console.error('❌ Add inventory error:', error.response?.data || error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể thêm hàng tồn kho';
      throw new Error(message);
    }
  }

  async updateInventory(id: number, data: Inventory): Promise<Inventory> {
    try {
      console.log('🔄 Updating inventory:', id, data.name);
      
      if (!data.name || !data.category || !data.unit) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }
      
      if (data.quantity < 0 || data.minStock < 0 || data.price < 0) {
        throw new Error('Số lượng và giá phải là số dương');
      }
      
      const response = await apiClient.put<Inventory>(`/inventory/${id}`, data);
      console.log('✅ Inventory updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Update inventory error:', error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể cập nhật hàng tồn kho';
      throw new Error(message);
    }
  }

  async updateStock(id: number, quantity: number): Promise<void> {
    try {
      console.log('📦 Updating stock:', id, 'new quantity:', quantity);
      
      if (quantity < 0) {
        throw new Error('Số lượng không thể âm');
      }
      
      await apiClient.put(`/inventory/${id}/stock`, null, {
        params: { quantity }
      });
      console.log('✅ Stock updated successfully');
    } catch (error: any) {
      console.error('❌ Update stock error:', error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể cập nhật số lượng';
      throw new Error(message);
    }
  }

  async deleteInventory(id: number): Promise<void> {
    try {
      console.log('🗑️ Deleting inventory:', id);
      await apiClient.delete(`/inventory/${id}`);
      console.log('✅ Inventory deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete inventory error:', error);
      const message = error.response?.data?.message || 
                      error.message || 
                      'Không thể xóa hàng tồn kho';
      throw new Error(message);
    }
  }

  // ============ UTILITY METHODS ============
  
  /**
   * Tính toán thống kê kho hàng
   */
  calculateStats(inventory: Inventory[]): InventoryStats {
    const stats: InventoryStats = {
      totalItems: inventory.length,
      totalValue: 0,
      lowStockCount: 0,
      categories: {},
    };

    inventory.forEach(item => {
      // Tổng giá trị
      stats.totalValue += item.quantity * item.price;
      
      // Đếm hàng sắp hết
      if (item.quantity <= item.minStock) {
        stats.lowStockCount++;
      }
      
      // Đếm theo danh mục
      if (!stats.categories[item.category]) {
        stats.categories[item.category] = 0;
      }
      stats.categories[item.category]++;
    });

    return stats;
  }

  /**
   * Lọc hàng tồn kho theo điều kiện
   */
  filterInventory(
    inventory: Inventory[], 
    filters: {
      search?: string;
      category?: string;
      lowStock?: boolean;
    }
  ): Inventory[] {
    return inventory.filter(item => {
      // Tìm kiếm theo tên
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!item.name.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Lọc theo danh mục
      if (filters.category && filters.category !== 'all') {
        if (item.category !== filters.category) {
          return false;
        }
      }

      // Lọc hàng sắp hết
      if (filters.lowStock) {
        if (item.quantity > item.minStock) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sắp xếp hàng tồn kho
   */
  sortInventory(
    inventory: Inventory[], 
    sortBy: 'name' | 'quantity' | 'price' | 'lastUpdated',
    order: 'asc' | 'desc' = 'asc'
  ): Inventory[] {
    const sorted = [...inventory].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'lastUpdated':
          const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }
}

export default new InventoryService();