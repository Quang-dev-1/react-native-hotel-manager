import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import authService from '../services/authService';

interface ChangePasswordModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ChangePasswordModal({
    visible,
    onClose,
    onSuccess,
}: ChangePasswordModalProps) {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const validateForm = (): boolean => {
        if (!oldPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu cũ');
            return false;
        }

        if (!newPassword.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
            return false;
        }

        if (newPassword.length < 6) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }

        if (newPassword === oldPassword) {
            Alert.alert('Lỗi', 'Mật khẩu mới phải khác mật khẩu cũ');
            return false;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
            return false;
        }

        return true;
    };

    const handleChangePassword = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            await authService.changePassword({
                oldPassword,
                newPassword,
            });

            Alert.alert(
                'Thành công',
                'Đổi mật khẩu thành công',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            onSuccess();
                        },
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <View style={styles.headerIconContainer}>
                            <Ionicons name="lock-closed" size={24} color="#4a90e2" />
                        </View>
                        <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Mật khẩu cũ */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu cũ</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={20}
                                    color="#94a3b8"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    placeholder="Nhập mật khẩu cũ"
                                    secureTextEntry={!showOldPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowOldPassword(!showOldPassword)}
                                    style={styles.eyeButton}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showOldPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#94a3b8"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Mật khẩu mới */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mật khẩu mới</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="lock-open-outline"
                                    size={20}
                                    color="#94a3b8"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                    secureTextEntry={!showNewPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                    style={styles.eyeButton}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#94a3b8"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Xác nhận mật khẩu */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons
                                    name="checkmark-circle-outline"
                                    size={20}
                                    color="#94a3b8"
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Nhập lại mật khẩu mới"
                                    secureTextEntry={!showConfirmPassword}
                                    autoCapitalize="none"
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeButton}
                                    disabled={loading}
                                >
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#94a3b8"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Lưu ý */}
                        <View style={styles.noteContainer}>
                            <Ionicons name="information-circle" size={16} color="#64748b" />
                            <Text style={styles.noteText}>
                                Mật khẩu phải có ít nhất 6 ký tự và khác mật khẩu cũ
                            </Text>
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleChangePassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark" size={20} color="#fff" />
                                    <Text style={styles.saveButtonText}>Đổi mật khẩu</Text>
                                </>
                            )}
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

    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
        maxHeight: '90%',
    },

    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },

    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginLeft: 12,
    },

    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
    },

    form: {
        padding: 20,
        gap: 20,
    },

    inputGroup: {
        gap: 8,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 4,
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingHorizontal: 12,
    },

    inputIcon: {
        marginRight: 8,
    },

    input: {
        flex: 1,
        height: 48,
        fontSize: 15,
        color: '#1e293b',
    },

    eyeButton: {
        padding: 8,
    },

    noteContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#4a90e2',
    },

    noteText: {
        flex: 1,
        fontSize: 13,
        color: '#64748b',
        lineHeight: 18,
    },

    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
    },

    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 12,
        gap: 8,
    },

    cancelButton: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },

    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },

    saveButton: {
        backgroundColor: '#4a90e2',
    },

    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});