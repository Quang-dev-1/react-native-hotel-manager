import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#1f2035ff', '#151165ff']}
          style={styles.avatar}>
          <Image
            style={{ width: 145, height: 145 }}
            source={require('../../assets/images/logo_shopp.png')}
          />
        </LinearGradient>
        <Text style={styles.name}>Nguyễn Hữu Quang</Text>
        <Text style={styles.email}>nguyenhuuquang150805@gmail.com</Text>
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="bag-handle-outline" size={24} color="#374151" />
          <Text style={styles.menuItemText}>My Orders</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="heart-outline" size={24} color="#374151" />
          <Text style={styles.menuItemText}>Favorites</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#374151" />
          <Text style={styles.menuItemText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#374151" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#dc2626" />
          <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#dc2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ✅ FIXED: Đổi tên từ 'profileStyles' thành 'styles'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  menuList: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#dc2626',
  },
});