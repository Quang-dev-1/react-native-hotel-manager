import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import authService from '../services/authService';

export default function ProfileDetailScreen() {
    const [user, setUser] = useState<any>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await authService.getCurrentUser();
        if (data) {
            setUser(data);
            setFullName(data.fullName || '');
            setPhone(data.phone || '');
        }
    };

    const handleUpdate = async () => {
        if (!fullName || !phone) {
            Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
        try {
            setLoading(true);
            await authService.updateProfile(user.id, { fullName, phone });
            Alert.alert('Thành công', 'Thông tin đã được cập nhật');
            router.back(); // Quay lại trang Profile sau khi sửa xong
        } catch (e: any) {
            Alert.alert('Lỗi', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.title}>Thông tin cá nhân</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <View style={styles.largeAvatar}>
                        <Ionicons name="person" size={60} color="#fff" />
                    </View>
                    <Text style={styles.roleLabel}>{user?.role || 'USER'}</Text>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.inputWrap}>
                        <Text style={styles.label}>Email tài khoản</Text>
                        <View style={[styles.inputField, styles.disabled]}>
                            <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                            <Text style={styles.disabledText}>{user?.email}</Text>
                        </View>
                        <Text style={styles.hint}>Email dùng để đăng nhập và không thể thay đổi</Text>
                    </View>

                    <View style={styles.inputWrap}>
                        <Text style={styles.label}>Họ và tên</Text>
                        <View style={styles.inputField}>
                            <Ionicons name="person-outline" size={20} color="#4a90e2" />
                            <TextInput
                                style={styles.textInput}
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Nhập họ tên của bạn"
                            />
                        </View>
                    </View>

                    <View style={styles.inputWrap}>
                        <Text style={styles.label}>Số điện thoại</Text>
                        <View style={styles.inputField}>
                            <Ionicons name="call-outline" size={20} color="#4a90e2" />
                            <TextInput
                                style={styles.textInput}
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                                placeholder="Nhập số điện thoại"
                            />
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={loading}>
                    <LinearGradient colors={['#4a90e2', '#357abd']} style={styles.gradient}>
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Lưu thay đổi</Text>}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    customHeader: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    title: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    scrollContent: { padding: 20 },
    avatarSection: { alignItems: 'center', marginBottom: 30 },
    largeAvatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#4a90e2', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    roleLabel: { fontSize: 12, fontWeight: 'bold', color: '#4a90e2', backgroundColor: '#eff6ff', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15 },
    infoCard: { gap: 20, marginBottom: 30 },
    inputWrap: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    inputField: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0', gap: 10 },
    disabled: { backgroundColor: '#f1f5f9' },
    disabledText: { flex: 1, paddingVertical: 14, color: '#94a3b8', fontSize: 15 },
    textInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#1e293b' },
    hint: { fontSize: 11, color: '#94a3b8', marginLeft: 5 },
    updateBtn: { borderRadius: 15, overflow: 'hidden', elevation: 3 },
    gradient: { paddingVertical: 16, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' }
});