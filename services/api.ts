import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

const COMPUTER_IP = '192.168.1.14';

const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  } else if (Platform.OS === 'ios') {
    return `http://${COMPUTER_IP}:8080/api`;
  } else {
    return `http://${COMPUTER_IP}:8080/api`;
  }
};

const API_BASE_URL = getBaseURL();

console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout');
    } else if (error.message === 'Network Error') {
      console.error('🚫 Network Error - Cannot connect to server');
      console.error('Check:');
      console.error('1. Backend is running');
      console.error('2. IP address is correct:', COMPUTER_IP);
      console.error('3. Phone and computer on same WiFi');
      console.error('4. Firewall allows port 8080');
    } else {
      console.error('❌ Response error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userEmail');
      await AsyncStorage.removeItem('userRole');
    }
    return Promise.reject(error);
  }
);

export default apiClient;