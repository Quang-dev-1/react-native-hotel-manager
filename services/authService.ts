import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  token: string;
  email?: string;
  role?: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    role?: string;
  };
}

export interface User {
  id?: number;
  fullName?: string;
  email: string;
  phone?: string;
  role?: string;
}

class AuthService {
  async register(data: RegisterRequest): Promise<User> {
    try {
      console.log('📝 Registration request:', { ...data, password: '***' });
      const response = await apiClient.post<User>('/auth/register', data);
      console.log('✅ Registration response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('🔐 Login request:', { email: data.email, password: '***' });
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      console.log('✅ Login response:', response.data);

      if (response.data.token) {
        await AsyncStorage.setItem('authToken', response.data.token);
        console.log('💾 Token saved');

        // Xử lý user data từ response
        let userData: User;

        if (response.data.user) {
          // Format 1: Backend trả về { token, user: {...} }
          userData = response.data.user;
        } else {
          // Format 2: Backend trả về { token, email, role }
          userData = {
            email: response.data.email || data.email,
            role: response.data.role || 'USER',
          };
        }

        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        console.log('💾 User data saved:', userData);
      }

      return response.data;
    } catch (error: any) {
      console.error('❌ Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 500) {
        throw new Error('Server error. Please check if user exists and credentials are correct.');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async updateProfile(userId: number, data: { fullName: string; phone: string }): Promise<User> {
    try {
      console.log('🔄 Updating profile for user:', userId, data);
      const response = await apiClient.put<User>(`/users/${userId}`, data);
      console.log('✅ Update profile response:', response.data);

      const currentUser = await this.getCurrentUser();

      const updatedUser: User = {
        id: currentUser?.id || userId,
        email: currentUser?.email || response.data.email || '',
        role: currentUser?.role || response.data.role || 'USER',
        fullName: data.fullName,
        phone: data.phone,
      };

      console.log('💾 Saving updated user data:', updatedUser);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      console.log('✅ User data updated successfully');

      return updatedUser;
    } catch (error: any) {
      console.error('❌ Update profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      console.log('🔐 Change password request');
      const currentUser = await this.getCurrentUser();

      if (!currentUser?.email) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Gọi API đổi mật khẩu - Endpoint: POST /api/auth/change-password
      const response = await apiClient.post('/auth/change-password', {
        email: currentUser.email,
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      console.log('✅ Password changed successfully:', response.data);
    } catch (error: any) {
      console.error('❌ Change password error:', error.response?.data || error.message);

      if (error.response?.status === 400) {
        throw new Error('Mật khẩu cũ không chính xác');
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Không thể đổi mật khẩu. Vui lòng thử lại');
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        console.log('⚠️ No user data found');
        return null;
      }
      const user = JSON.parse(userData);
      console.log('✅ Current user:', user);
      return user;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }
}

export default new AuthService();