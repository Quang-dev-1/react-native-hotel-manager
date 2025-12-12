// app/(drawer)/_layout.tsx
import { BookingProvider } from '@/contexts/BookingContext';
import { RoomProvider } from '@/contexts/RoomContext';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BookingFormScreen from '../(drawer)/BookingFormScreen';
import BookingsScreen from '../(drawer)/bookings';
import DashboardScreen from '../(drawer)/dashboard';
import ProfileScreen from '../(drawer)/profile';
import RentalScreen from '../(drawer)/rental';
import FinanceScreen from './finance';
import LogsScreen from './logs';
import SystemScreen from './system';
import WarehouseScreen from './warehouse';

const Drawer = createDrawerNavigator();

function CustomDrawerContent() {
  const user = {
    name: 'thienquynhfff',
    avatar: require('../../assets/images/HotelManager.png')
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
      component: DashboardScreen,
    },
    {
      name: 'Quản lý thu chi',
      icon: 'card-outline',
      screen: 'finance',
      component: DashboardScreen,
    },
    {
      name: 'Quản lý hệ thống',
      icon: 'settings-outline',
      screen: 'system',
      component: DashboardScreen,
    },
    {
      name: 'Nhật ký hệ thống',
      icon: 'time-outline',
      screen: 'logs',
      component: DashboardScreen,
    },
    {
      name: 'Tài khoản',
      icon: 'person-outline',
      screen: 'profile',
      component: ProfileScreen,
    },
  ];

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => router.replace('/(auth)/login'),
      },
    ]);
  };

  return (
    <LinearGradient
      colors={['#5da9e9', '#4a90e2']}
      style={styles.drawerContainer}>
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.hotelIconWrapper}>
          <Image
            source={user.avatar}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Ionicons name="swap-horizontal" size={20} color="#dbeafe" />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
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

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutSection}
        onPress={handleLogout}
        activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
        <Ionicons name="chevron-forward" size={18} color="#dbeafe" />
      </TouchableOpacity>

      {/* Contact Section */}
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
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
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