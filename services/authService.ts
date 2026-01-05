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