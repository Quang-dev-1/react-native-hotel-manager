import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const user = {
    name: 'Admin',
    email: 'admin@hotel.com',
    phone: '0367470332',
    role: 'Quản lý',
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/login'),
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Thông tin cá nhân',
      subtitle: 'Cập nhật thông tin tài khoản',
      onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển'),
    },
    {
      icon: 'lock-closed-outline',
      title: 'Đổi mật khẩu',
      subtitle: 'Thay đổi mật khẩu đăng nhập',
      onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển'),
    },
    {
      icon: 'notifications-outline',
      title: 'Thông báo',
      subtitle: 'Cài đặt thông báo',
      onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Trợ giúp',
      subtitle: 'Hướng dẫn sử dụng',
      onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển'),
    },
    {
      icon: 'information-circle-outline',
      title: 'Về ứng dụng',
      subtitle: 'Phiên bản 1.0.0',
      onPress: () => Alert.alert('Hotel Manager', 'Phiên bản 1.0.0\n© 2025'),
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4a90e2', '#357abd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#fff" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
          </View>
          <View style={styles.userDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={16} color="#64748b" />
              <Text style={styles.detailText}>{user.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={16} color="#64748b" />
              <Text style={styles.detailText}>{user.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={24} color="#4a90e2" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hotel Manager v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2025 All rights reserved</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4a90e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  userDetails: {
    width: '100%',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fee2e2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    padding: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
});