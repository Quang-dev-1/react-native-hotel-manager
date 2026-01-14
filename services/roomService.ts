import apiClient from './api';

export interface Room {
  id?: number;
  roomNumber: string;
  roomTypeName: string;
  floor: number;
  price: number;
  status: string;
  description?: string;
}

export interface RoomType {
  id?: number;
  name: string;
  description?: string;
  basePrice: number;
  maxOccupancy: number;
  amenities?: string;
}

class RoomService {
  // ============ ROOM APIs ============

  async getRooms(): Promise<Room[]> {
    try {
      console.log('📋 Fetching all rooms...');
      const response = await apiClient.get<Room[]>('/rooms');
      console.log('✅ Rooms fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get rooms error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phòng');
    }
  }

  async getRoomById(id: number): Promise<Room> {
    try {
      const response = await apiClient.get<Room>(`/rooms/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get room by id error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin phòng');
    }
  }

  async getRoomsByStatus(status: string): Promise<Room[]> {
    try {
      const response = await apiClient.get<Room[]>(`/rooms/status/${status}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get rooms by status error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phòng theo trạng thái');
    }
  }

  async getRoomsByFloor(floor: number): Promise<Room[]> {
    try {
      const response = await apiClient.get<Room[]>(`/rooms/floor/${floor}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get rooms by floor error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách phòng theo tầng');
    }
  }

  async addRoom(data: Room): Promise<Room> {
    try {
      console.log('➕ Adding room:', data);
      const response = await apiClient.post<Room>('/rooms', data);
      console.log('✅ Room added:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Add room error:', error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Không thể thêm phòng');
    }
  }

  async updateRoom(id: number, data: Room): Promise<Room> {
    try {
      console.log('🔄 Updating room:', id, data);
      const response = await apiClient.put<Room>(`/rooms/${id}`, data);
      console.log('✅ Room updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update room error:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật phòng');
    }
  }

  async updateRoomStatus(id: number, status: string): Promise<void> {
    try {
      await apiClient.put(`/rooms/${id}/status?status=${status}`);
      console.log('✅ Room status updated');
    } catch (error: any) {
      console.error('❌ Update room status error:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật trạng thái phòng');
    }
  }

  async deleteRoom(id: number): Promise<void> {
    try {
      console.log('🗑️ Deleting room:', id);
      await apiClient.delete(`/rooms/${id}`);
      console.log('✅ Room deleted');
    } catch (error: any) {
      console.error('❌ Delete room error:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa phòng');
    }
  }

  // ============ ROOM TYPE APIs ============

  async getRoomTypes(): Promise<RoomType[]> {
    try {
      console.log('📋 Fetching all room types...');
      const response = await apiClient.get<RoomType[]>('/room-types');
      console.log('✅ Room types fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get room types error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách loại phòng');
    }
  }

  async getRoomTypeById(id: number): Promise<RoomType> {
    try {
      const response = await apiClient.get<RoomType>(`/room-types/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get room type by id error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin loại phòng');
    }
  }

  async addRoomType(data: RoomType): Promise<RoomType> {
    try {
      console.log('➕ Adding room type:', data);
      const response = await apiClient.post<RoomType>('/room-types', data);
      console.log('✅ Room type added:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Add room type error:', error.response?.data || error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Không thể thêm loại phòng');
    }
  }

  async updateRoomType(id: number, data: RoomType): Promise<RoomType> {
    try {
      console.log('🔄 Updating room type:', id, data);
      const response = await apiClient.put<RoomType>(`/room-types/${id}`, data);
      console.log('✅ Room type updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update room type error:', error);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật loại phòng');
    }
  }

  async deleteRoomType(id: number): Promise<void> {
    try {
      console.log('🗑️ Deleting room type:', id);
      await apiClient.delete(`/room-types/${id}`);
      console.log('✅ Room type deleted');
    } catch (error: any) {
      console.error('❌ Delete room type error:', error);
      throw new Error(error.response?.data?.message || 'Không thể xóa loại phòng');
    }
  }
}

export default new RoomService();