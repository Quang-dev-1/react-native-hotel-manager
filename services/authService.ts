import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './api';
import userService from './userService';

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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
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

        let userData: User;

        if (response.data.user) {
          userData = response.data.user;
        } else {
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

      // Sử dụng userService để update profile
      const updatedUser = await userService.updateProfile(userId, data);
      console.log('✅ Update profile response:', updatedUser);

      // Lấy thông tin user hiện tại từ storage
      const currentUser = await this.getCurrentUser();

      // Merge với data mới
      const userData: User = {
        id: updatedUser.id || currentUser?.id || userId,
        email: updatedUser.email || currentUser?.email || '',
        role: updatedUser.role || currentUser?.role || 'USER',
        fullName: updatedUser.fullName || data.fullName,
        phone: updatedUser.phone || data.phone,
      };

      // Lưu vào AsyncStorage
      console.log('💾 Saving updated user data:', userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('✅ User data updated successfully');

      return userData;
    } catch (error: any) {
      console.error('❌ Update profile error:', error);
      throw error; // Re-throw error từ userService
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      console.log('🔐 Change password request');
      const currentUser = await this.getCurrentUser();

      if (!currentUser?.email) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

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

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    try {
      console.log('📧 Forgot password request:', data.email);
      const response = await apiClient.post('/auth/forgot-password', data);
      console.log('✅ OTP sent successfully:', response.data);
    } catch (error: any) {
      console.error('❌ Forgot password error:', error.response?.data || error.message);

      if (error.response?.status === 404) {
        throw new Error('Email không tồn tại trong hệ thống');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Không thể gửi mã OTP. Vui lòng thử lại');
    }
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      console.log('🔐 Reset password request:', { token: data.token });
      const response = await apiClient.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword
      });
      console.log('✅ Password reset successfully:', response.data);
    } catch (error: any) {
      console.error('❌ Reset password error:', error.response?.data || error.message);

      if (error.response?.status === 400) {
        throw new Error('Mã xác thực không hợp lệ hoặc đã hết hạn');
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error('Không thể đặt lại mật khẩu. Vui lòng thử lại');
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