import { BookingProvider } from '@/contexts/BookingContext';
import { RoomProvider } from '@/contexts/RoomContext';
import AuthService from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import DashboardScreen from '../(drawer)/dashboard';
import ProfileScreen from '../(drawer)/profile';
import RentalScreen from '../(drawer)/rental';
import BookingFormScreen from './BookingFormScreen';

import BookingsScreen from './bookings';
import CheckoutPaymentScreen from './CheckoutPaymentScreen';
import FinanceScreen from './finance';
import InvoiceScreen from './invoice';
import LogsScreen from './logs';
import PaymentScreen from './PaymentScreen';
import PromotionsScreen from './promotions';
import RecentHistoryScreen from './RecentHistoryScreen';
import RoomTypesScreen from './room-types';
import RoomsScreen from './rooms';
import ServicesScreen from './services';
import SettingsScreen from './settings';
import StatisticsScreen from './statistics';
import SystemScreen from './system';
import WarehouseScreen from './warehouse';

const Drawer = createDrawerNavigator();

function CustomDrawerContent() {
  const [userEmail, setUserEmail] = useState<string>('Đang tải...');

  useEffect(() => {
    loadUserEmail();
  }, []);

  const loadUserEmail = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      if (userData?.email) {
        setUserEmail(userData.email);
      } else {
        setUserEmail('Khách');
      }
    } catch (error) {
      console.error('Error loading user email:', error);
      setUserEmail('Khách');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          try {
            await AuthService.logout();
            router.replace('/(auth)/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Lỗi', 'Đăng xuất không thành công');
          }
        },
      },
    ]);
  };

  const menuItems = [
    {
      name: 'Trang chính',
      icon: 'home-outline',
      screen: 'dashboard',
      component: DashboardScreen,
    },
    {
      name: 'Đặt phòng',
      icon: 'calendar-outline',
      screen: 'bookings',
      component: BookingsScreen,
    },
    {
      name: 'Thuê - trả phòng',
      icon: 'repeat-outline',
      screen: 'rental',
      component: RentalScreen,
    },
    {
      name: 'Quản lý kho',
      icon: 'cube-outline',
      screen: 'warehouse',
      component: WarehouseScreen,
    },
    {
      name: 'Quản lý thu chi',
      icon: 'card-outline',
      screen: 'finance',
      component: FinanceScreen,
    },
    {
      name: 'Quản lý hệ thống',
      icon: 'settings-outline',
      screen: 'system',
      component: SystemScreen,
    },

    {
      name: 'Tài khoản',
      icon: 'person-outline',
      screen: 'profile',
      component: ProfileScreen,
    },
  ];

  return (
    <LinearGradient
      colors={['#5da9e9', '#4a90e2']}
      style={styles.drawerContainer}>
      <View style={styles.profileSection}>
        <View style={styles.hotelIconWrapper}>
          <Image
            source={require('../../assets/images/HotelManager.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{userEmail}</Text>
          <TouchableOpacity onPress={() => router.push('/(drawer)/profile')}>
            <Ionicons name="swap-horizontal" size={20} color="#dbeafe" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => router.push(`/(drawer)/${item.screen}` as any)}
            activeOpacity={0.7}>
            <Ionicons name={item.icon as any} size={22} color="#fff" />
            <Text style={styles.menuText}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={18} color="#dbeafe" />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.logoutSection}
        onPress={handleLogout}
        activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
        <Ionicons name="chevron-forward" size={18} color="#dbeafe" />
      </TouchableOpacity>

      <View style={styles.contactSection}>
        <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
        <Text style={styles.contactText}>0367470332</Text>
      </View>
    </LinearGradient>
  );
}

export default function DrawerLayout() {
  return (
    <RoomProvider>
      <BookingProvider>
        <Drawer.Navigator
          drawerContent={() => <CustomDrawerContent />}
          screenOptions={{
            headerShown: false,
            drawerType: 'slide',
            drawerStyle: {
              width: '75%',
            },
          }}>
          <Drawer.Screen name="dashboard" component={DashboardScreen} />
          <Drawer.Screen name="bookings" component={BookingsScreen} />
          <Drawer.Screen name="rental" component={RentalScreen} />
          <Drawer.Screen name="BookingFormScreen" component={BookingFormScreen} />
          <Drawer.Screen name="profile" component={ProfileScreen} />
          <Drawer.Screen name="warehouse" component={WarehouseScreen} />
          <Drawer.Screen name="finance" component={FinanceScreen} />
          <Drawer.Screen name="system" component={SystemScreen} />
          <Drawer.Screen name="logs" component={LogsScreen} />
          <Drawer.Screen name="services" component={ServicesScreen} />
          <Drawer.Screen name="rooms" component={RoomsScreen} />
          <Drawer.Screen name="room-types" component={RoomTypesScreen} />
          <Drawer.Screen name="promotions" component={PromotionsScreen} />
          <Drawer.Screen name="PaymentScreen" component={PaymentScreen} />
          <Drawer.Screen name="CheckoutPaymentScreen" component={CheckoutPaymentScreen} />
          <Drawer.Screen name="inventory" component={InvoiceScreen} />
          <Drawer.Screen name="statistics" component={StatisticsScreen} />
          <Drawer.Screen name="settings" component={SettingsScreen} />
          <Drawer.Screen name="RecentHistory" component={RecentHistoryScreen}
            options={{
              headerShown: false,
              drawerLabel: 'Lịch sử gần đây',
              drawerIcon: ({ color, size }) => (
                <Ionicons name="time-outline" size={size} color={color} />
              )
            }}
          />
        </Drawer.Navigator>
      </BookingProvider>
    </RoomProvider>

  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    paddingTop: 50,
  },
  profileSection: {
    padding: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  hotelIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  logoutSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  contactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});