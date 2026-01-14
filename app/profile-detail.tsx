import authService, { User } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProfileDetailScreen() {
    const navigation = useNavigation<any>();
    const [user, setUser] = useState<User | null>(null);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadUserData = async () => {
        try {
            setLoading(true);
            console.log('🔍 Loading user data...');
            const userData = await authService.getCurrentUser();
            console.log('📱 User data received:', userData);

            if (userData) {
                setUser(userData);
                const loadedFullName = userData.fullName || '';
                const loadedPhone = userData.phone || '';

                console.log('📝 Setting form values:', {
                    fullName: loadedFullName,
                    phone: loadedPhone
                });

                setFullName(loadedFullName);
                setPhone(loadedPhone);

                console.log('✅ User data loaded for editing successfully');
            } else {
                console.log('⚠️ No user data found');
                Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
            }
        } catch (error) {
            console.error('❌ Load user data error:', error);
            Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [])
    );

    const validatePhone = (phone: string): boolean => {
        const phoneRegex = /^[0-9]{10,11}$/;
        return phoneRegex.test(phone);
    };

    const handleSave = async () => {
        console.log('💾 Attempting to save:', { fullName, phone });

        // Validation
        if (!fullName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
            return;
        }

        if (!phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return;
        }

        if (!validatePhone(phone.trim())) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 chữ số)');
            return;
        }

        try {
            setSaving(true);

            // Nếu không có user.id, sử dụng email để tìm user
            if (!user?.id && !user?.email) {
                console.log('⚠️ No user ID or email found:', user);
                Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
                return;
            }

            console.log('🔄 Calling updateProfile API...');

            // Nếu có ID thì dùng ID, nếu không thì backend cần xử lý bằng email
            const userId = user.id || 0; // Backend cần sửa để accept email

            await authService.updateProfile(userId, {
                fullName: fullName.trim(),
                phone: phone.trim(),
            });

            console.log('✅ Profile updated successfully');
            Alert.alert(
                'Thành công',
                'Thông tin đã được cập nhật',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ Save error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset về giá trị ban đầu
        setFullName(user?.fullName || '');
        setPhone(user?.phone || '');
        navigation.goBack();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.customHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.customHeader}>
                <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <LinearGradient
                        colors={['#4a90e2', '#357abd']}
                        style={styles.largeAvatar}>
                        <Ionicons name="person" size={60} color="#fff" />
                    </LinearGradient>
                    <TouchableOpacity style={styles.changeAvatarButton}>
                        <Ionicons name="camera" size={16} color="#4a90e2" />
                        <Text style={styles.changeAvatarText}>Đổi ảnh đại diện</Text>
                    </TouchableOpacity>
                    <View style={styles.roleLabel}>
                        <Ionicons name="shield-checkmark" size={14} color="#4a90e2" />
                        <Text style={styles.roleLabelText}>{user?.role || 'USER'}</Text>
                    </View>
                </View>


                {/* Form Section */}
                <View style={styles.formCard}>
                    <Text style={styles.formTitle}>Thông tin tài khoản</Text>

                    {/* Email - Readonly */}
                    <View style={styles.inputWrap}>
                        <Text style={styles.label}>Email tài khoản</Text>
                        <View style={[styles.inputField, styles.disabled]}>
                            <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                            <Text style={styles.disabledText}>{user?.email}</Text>
                            <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                        </View>
                        <Text style={styles.hint}>
                            Email dùng để đăng nhập và không thể thay đổi
                        </Text>
                    </View>

                    {/* ID - Readonly (nếu có) */}
                    {user?.id && (
                        <View style={styles.inputWrap}>
                            <Text style={styles.label}>ID người dùng</Text>
                            <View style={[styles.inputField, styles.disabled]}>
                                <Ionicons name="finger-print-outline" size={20} color="#94a3b8" />
                                <Text style={styles.disabledText}>#{user.id}</Text>
                            </View>
                        </View>
                    )}

                    {/* Full Name - Editable */}
                    <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                            Họ và tên <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={[
                            styles.inputField,
                            fullName ? styles.inputFieldFilled : null
                        ]}>
                            <Ionicons name="person-outline" size={20} color="#4a90e2" />
                            <TextInput
                                style={styles.textInput}
                                value={fullName}
                                onChangeText={(text) => {
                                    console.log('📝 FullName changed to:', text);
                                    setFullName(text);
                                }}
                                placeholder="Nhập họ và tên của bạn"
                                placeholderTextColor="#94a3b8"
                                editable={!saving}
                            />
                            {fullName ? (
                                <TouchableOpacity onPress={() => setFullName('')}>
                                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </View>

                    {/* Phone - Editable */}
                    <View style={styles.inputWrap}>
                        <Text style={styles.label}>
                            Số điện thoại <Text style={styles.required}>*</Text>
                        </Text>
                        <View style={[
                            styles.inputField,
                            phone ? styles.inputFieldFilled : null
                        ]}>
                            <Ionicons name="call-outline" size={20} color="#4a90e2" />
                            <TextInput
                                style={styles.textInput}
                                value={phone}
                                onChangeText={(text) => {
                                    console.log('📱 Phone changed to:', text);
                                    setPhone(text);
                                }}
                                keyboardType="phone-pad"
                                placeholder="Nhập số điện thoại (10-11 số)"
                                placeholderTextColor="#94a3b8"
                                maxLength={11}
                                editable={!saving}
                            />
                            {phone ? (
                                <TouchableOpacity onPress={() => setPhone('')}>
                                    <Ionicons name="close-circle" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <Text style={styles.hint}>
                            Số điện thoại sẽ được sử dụng để liên hệ
                        </Text>
                    </View>

                    {/* Role - Readonly */}
                    <View style={styles.inputWrap}>
                        <Text style={styles.label}>Vai trò</Text>
                        <View style={[styles.inputField, styles.disabled]}>
                            <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" />
                            <Text style={styles.disabledText}>{user?.role || 'USER'}</Text>
                        </View>
                    </View>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color="#4a90e2" />
                    <Text style={styles.infoBoxText}>
                        Vui lòng nhập đầy đủ và chính xác thông tin. Thông tin này sẽ được
                        hiển thị trong hệ thống và có thể được sử dụng để liên hệ.
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={handleCancel}
                        disabled={saving}>
                        <Text style={styles.cancelBtnText}>Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={saving}>
                        <LinearGradient
                            colors={saving ? ['#94a3b8', '#64748b'] : ['#4a90e2', '#357abd']}
                            style={styles.gradient}>
                            {saving ? (
                                <>
                                    <ActivityIndicator color="#fff" size="small" />
                                    <Text style={styles.saveBtnText}>Đang lưu...</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
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
    customHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#fef3c7',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#f59e0b',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400e',
        lineHeight: 18,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    largeAvatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#4a90e2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    changeAvatarButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#eff6ff',
        borderRadius: 20,
        marginBottom: 12,
    },
    changeAvatarText: {
        fontSize: 13,
        color: '#4a90e2',
        fontWeight: '600',
    },
    roleLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    roleLabelText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4a90e2',
        textTransform: 'uppercase',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
    },
    inputWrap: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    required: {
        color: '#ef4444',
    },
    inputField: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    inputFieldFilled: {
        borderColor: '#4a90e2',
        backgroundColor: '#fff',
    },
    disabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
    },
    disabledText: {
        flex: 1,
        paddingVertical: 14,
        color: '#94a3b8',
        fontSize: 15,
        fontWeight: '500',
    },
    textInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    hint: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 6,
        marginLeft: 4,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoBoxText: {
        flex: 1,
        fontSize: 13,
        color: '#1e40af',
        fontWeight: '500',
        lineHeight: 18,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    cancelBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    saveBtn: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#4a90e2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    gradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});