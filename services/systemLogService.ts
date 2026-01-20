import apiClient from './api';

export interface SystemLog {
  id?: number;
  type: string;
  action: string;
  user: string;
  description: string;
  details?: string;
  timestamp?: string;
}

class SystemLogService {

  async getAllLogs(): Promise<SystemLog[]> {
    try {
      console.log('📋 Fetching all logs...');
      const response = await apiClient.get<SystemLog[]>('/logs');
      console.log('✅ Logs fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get logs error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy danh sách log');
    }
  }

  async getLogsByType(type: string): Promise<SystemLog[]> {
    try {
      const response = await apiClient.get<SystemLog[]>(`/logs/type/${type}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get logs by type error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy log theo loại');
    }
  }

  async getLogsByUser(user: string): Promise<SystemLog[]> {
    try {
      const response = await apiClient.get<SystemLog[]>(`/logs/user/${user}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get logs by user error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy log theo người dùng');
    }
  }

  async getLogsByDateRange(startDate: string, endDate: string): Promise<SystemLog[]> {
    try {
      const response = await apiClient.get<SystemLog[]>(
        `/logs/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ Get logs by date range error:', error);
      throw new Error(error.response?.data?.message || 'Không thể lấy log theo khoảng thời gian');
    }
  }
}

export default new SystemLogService();