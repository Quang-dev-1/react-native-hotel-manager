import apiClient from './api';

export interface User {
    id?: number;
    fullName?: string;
    email: string;
    phone?: string;
    role?: string;
}

export interface UpdateProfileRequest {
    fullName: string;
    phone: string;
}

class UserService {
    /**
     * Lấy thông tin user theo ID
     */
    async getUserById(userId: number): Promise<User> {
        try {
            console.log('🔍 Getting user by ID:', userId);
            const response = await apiClient.get<User>(`/users/${userId}`);
            console.log('✅ User data:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get user error:', error.response?.data || error.message);

            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy người dùng');
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Không thể tải thông tin người dùng');
        }
    }

    /**
     * Cập nhật thông tin profile user
     */
    async updateProfile(userId: number, data: UpdateProfileRequest): Promise<User> {
        try {
            console.log('🔄 Updating profile for user:', userId, data);
            const response = await apiClient.put<User>(`/users/${userId}`, data);
            console.log('✅ Profile updated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Update profile error:', error.response?.data || error.message);

            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy người dùng');
            }
            if (error.response?.status === 400) {
                throw new Error(error.response.data.message || 'Dữ liệu không hợp lệ');
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Không thể cập nhật thông tin');
        }
    }

    /**
     * Lấy danh sách tất cả users (dành cho admin)
     */
    async getAllUsers(): Promise<User[]> {
        try {
            console.log('📋 Getting all users');
            const response = await apiClient.get<User[]>('/users');
            console.log('✅ Users loaded:', response.data.length);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get users error:', error.response?.data || error.message);
            throw new Error('Không thể tải danh sách người dùng');
        }
    }

    /**
     * Xóa user (dành cho admin)
     */
    async deleteUser(userId: number): Promise<void> {
        try {
            console.log('🗑️ Deleting user:', userId);
            await apiClient.delete(`/users/${userId}`);
            console.log('✅ User deleted successfully');
        } catch (error: any) {
            console.error('❌ Delete user error:', error.response?.data || error.message);

            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy người dùng');
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Không thể xóa người dùng');
        }
    }
}

export default new UserService();