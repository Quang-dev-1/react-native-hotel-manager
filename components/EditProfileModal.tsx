import authService, { User } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditProfileModalProps {
    visible: boolean;
    user: User | null;
    onClose: () => void;
    onSuccess: (updatedUser: User) => void;
}

export default function EditProfileModal({ visible, user, onClose, onSuccess }: EditProfileModalProps) {
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
            return;
        }

        if (!phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return;
        }

        // Validate phone number (Vietnamese format)
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone)) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 chữ số)');
            return;
        }

        try {
            setLoading(true);

            if (!user?.id) {
                Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
                return;
            }

            const updatedUser = await authService.updateProfile(user.id, {
                fullName: fullName.trim(),
                phone: phone.trim(),
            });

            Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân');
            onSuccess(updatedUser);
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Reset form về giá trị ban đầu khi đóng
        setFullName(user?.fullName || '');
        setPhone(user?.phone || '');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            disabled={loading}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.modalBody}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.avatarSection}>
                            <View style={styles.avatarLarge}>
                                <Ionicons name="person" size={60} color="#fff" />
                            </View>
                            <Text style={styles.emailText}>{user?.email}</Text>
                            <View style={styles.roleBadge}>
                                <Text style={styles.roleText}>{user?.role || 'USER'}</Text>
                            </View>
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Họ và tên <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="person-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập họ và tên"
                                        value={fullName}
                                        onChangeText={setFullName}
                                        editable={!loading}
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Số điện thoại <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="call-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập số điện thoại"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        editable={!loading}
                                        placeholderTextColor="#94a3b8"
                                        maxLength={11}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <View style={[styles.inputWrapper, styles.inputDisabled]}>
                                    <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                    <TextInput
                                        style={[styles.input, styles.inputDisabledText]}
                                        value={user?.email}
                                        editable={false}
                                        placeholderTextColor="#94a3b8"
                                    />
                                    <Ionicons name="lock-closed" size={16} color="#94a3b8" />
                                </View>
                                <Text style={styles.helperText}>Email không thể thay đổi</Text>
                            </View>

                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle" size={20} color="#4a90e2" />
                                <Text style={styles.infoText}>
                                    Thông tin này sẽ được hiển thị trong hệ thống và có thể được
                                    sử dụng để liên hệ.
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={loading}>
                            <LinearGradient
                                colors={loading ? ['#94a3b8', '#64748b'] : ['#4a90e2', '#357abd']}
                                style={styles.saveButtonGradient}>
                                {loading ? (
                                    <>
                                        <ActivityIndicator size="small" color="#fff" />
                                        <Text style={styles.saveButtonText}>Đang lưu...</Text>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBody: {
        maxHeight: 500,
    },
    avatarSection: {
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
    },
    avatarLarge: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#4a90e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#4a90e2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    emailText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: '#eff6ff',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
    },
    roleText: {
        fontSize: 12,
        color: '#4a90e2',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    formSection: {
        padding: 20,
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    required: {
        color: '#ef4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    inputDisabled: {
        backgroundColor: '#f1f5f9',
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    inputDisabledText: {
        color: '#94a3b8',
    },
    helperText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
        marginTop: 4,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1e40af',
        fontWeight: '500',
        lineHeight: 18,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748b',
    },
    saveButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});