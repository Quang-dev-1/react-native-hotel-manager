import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import ChangePasswordModal from '@/components/ChangePasswordModal';
import EditProfileModal from '@/components/EditProfileModal';
import authService from '../../services/authService';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      console.log('📱 User data loaded:', userData);
      setUser(userData);
    } catch (error) {
      console.error('❌ Error loading user:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await authService.logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleUpdateSuccess = (updatedUser: any) => {
    setUser(updatedUser);
    setShowEditModal(false);
  };

  const handleChangePasswordSuccess = async () => {
    setShowChangePasswordModal(false);

    // Đăng xuất và chuyển về trang login
    await authService.logout();

    Alert.alert(
      'Thành công',
      'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
      [
        {
          text: 'Đăng nhập',
          onPress: () => router.replace('/(auth)/login'),
        },
      ],
      { cancelable: false } // Không cho phép đóng alert bằng cách tap ra ngoài
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Thông tin cá nhân',
      subtitle: 'Cập nhật thông tin tài khoản',
      onPress: () => router.push('/profile-detail'),
      badge: null,
    },
    {
      icon: 'lock-closed-outline',
      title: 'Đổi mật khẩu',
      subtitle: 'Thay đổi mật khẩu đăng nhập',
      onPress: () => setShowChangePasswordModal(true),
      badge: null,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Bảo mật',
      subtitle: 'Cài đặt bảo mật tài khoản',
      onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển'),
      badge: null,
    },
    {
      icon: 'notifications-outline',
      title: 'Thông báo',
      subtitle: 'Cài đặt thông báo',
      onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển'),
      badge: '3',
    },
    {
      icon: 'help-circle-outline',
      title: 'Trợ giúp',
      subtitle: 'Hướng dẫn sử dụng',
      onPress: () => Alert.alert('Thông báo', 'Chức năng đang phát triển'),
      badge: null,
    },
    {
      icon: 'information-circle-outline',
      title: 'Về ứng dụng',
      subtitle: 'Phiên bản 1.0.0',
      onPress: () =>
        Alert.alert('Hotel Manager', 'Phiên bản 1.0.0\n© 2025 All rights reserved'),
      badge: null,
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4a90e2" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>Không tìm thấy thông tin người dùng</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.retryButtonText}>Đăng nhập lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4a90e2', '#357abd']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
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
            <Text style={styles.userName}>
              {user.fullName || 'Chưa cập nhật'}
            </Text>

            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#4a90e2" />
              <Text style={styles.userRole}>{user.role || 'USER'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Cài đặt</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={24} color="#4a90e2" />
              </View>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>

              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}

              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Hotel Manager v1.0.0</Text>
          <Text style={styles.footerSubtext}>© 2025 All rights reserved</Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={showEditModal}
        user={user}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleUpdateSuccess}
      />

      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={handleChangePasswordSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },

  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 12,
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#4a90e2',
    borderRadius: 12,
  },

  retryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
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
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  userRole: {
    fontSize: 12,
    color: '#4a90e2',
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  menuSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
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

  badge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },

  badgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
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