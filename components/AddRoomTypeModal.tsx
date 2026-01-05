// app/(drawer)/components/modals/AddRoomTypeModal.tsx
import roomService from '@/services/roomService';
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

interface AddRoomTypeModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddRoomTypeModal({ visible, onClose, onSuccess }: AddRoomTypeModalProps) {
    const [loading, setLoading] = useState(false);

    const [newRoomType, setNewRoomType] = useState({
        name: '',
        price: '',
        capacity: '',
        description: '',
    });

    const [errors, setErrors] = useState({
        name: '',
        price: '',
        capacity: '',
    });

    const validateName = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập tên loại phòng';
        }
        if (text.trim().length < 2) {
            return 'Tên loại phòng phải có ít nhất 2 ký tự';
        }
        return '';
    };

    const validatePrice = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập giá phòng';
        }
        const price = parseInt(text);
        if (isNaN(price) || price <= 0) {
            return 'Giá phòng phải là số dương';
        }
        return '';
    };

    const validateCapacity = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập sức chứa';
        }
        const capacity = parseInt(text);
        if (isNaN(capacity) || capacity <= 0) {
            return 'Sức chứa phải là số dương';
        }
        return '';
    };

    const handleNameChange = (text: string) => {
        setNewRoomType({ ...newRoomType, name: text });
        setErrors({ ...errors, name: validateName(text) });
    };

    const handlePriceChange = (text: string) => {
        setNewRoomType({ ...newRoomType, price: text });
        setErrors({ ...errors, price: validatePrice(text) });
    };

    const handleCapacityChange = (text: string) => {
        setNewRoomType({ ...newRoomType, capacity: text });
        setErrors({ ...errors, capacity: validateCapacity(text) });
    };

    const handleAddRoomType = async () => {
        const nameError = validateName(newRoomType.name);
        const priceError = validatePrice(newRoomType.price);
        const capacityError = validateCapacity(newRoomType.capacity);

        setErrors({
            name: nameError,
            price: priceError,
            capacity: capacityError,
        });

        if (nameError || priceError || capacityError) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setLoading(true);

            const roomTypeData = {
                name: newRoomType.name.trim(),
                basePrice: parseInt(newRoomType.price),
                maxOccupancy: parseInt(newRoomType.capacity),
                description: newRoomType.description.trim(),
            };

            await roomService.addRoomType(roomTypeData);

            Alert.alert('Thành công', `Đã thêm loại phòng "${newRoomType.name}" thành công!`, [
                {
                    text: 'OK',
                    onPress: () => {
                        onClose();
                        setNewRoomType({ name: '', price: '', capacity: '', description: '' });
                        setErrors({ name: '', price: '', capacity: '' });
                        if (onSuccess) onSuccess();
                    },
                },
            ]);
        } catch (error: any) {
            console.error('Error adding room type:', error);
            Alert.alert('Lỗi', error.message || 'Không thể thêm loại phòng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm loại phòng mới</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Tên loại phòng <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrapper,
                                errors.name ? styles.inputError : null
                            ]}>
                                <Ionicons name="pricetag-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ví dụ: Phòng Deluxe, Phòng Hướng Biển..."
                                    value={newRoomType.name}
                                    onChangeText={handleNameChange}
                                    placeholderTextColor="#94a3b8"
                                    editable={!loading}
                                />
                            </View>
                            {errors.name ? (
                                <Text style={styles.errorText}>{errors.name}</Text>
                            ) : null}
                        </View>

                        {/* Price */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Giá phòng (VNĐ/đêm) <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrapper,
                                errors.price ? styles.inputError : null
                            ]}>
                                <Ionicons name="cash-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ví dụ: 500000, 800000..."
                                    value={newRoomType.price}
                                    onChangeText={handlePriceChange}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94a3b8"
                                    editable={!loading}
                                />
                                <Text style={styles.currency}>đ</Text>
                            </View>
                            {errors.price ? (
                                <Text style={styles.errorText}>{errors.price}</Text>
                            ) : null}
                            {newRoomType.price && !errors.price && (
                                <Text style={styles.helperText}>
                                    {parseInt(newRoomType.price).toLocaleString('vi-VN')} đồng/đêm
                                </Text>
                            )}
                        </View>

                        {/* Capacity */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Sức chứa (người) <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrapper,
                                errors.capacity ? styles.inputError : null
                            ]}>
                                <Ionicons name="people-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ví dụ: 2, 4..."
                                    value={newRoomType.capacity}
                                    onChangeText={handleCapacityChange}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94a3b8"
                                    editable={!loading}
                                />
                                <Text style={styles.unit}>người</Text>
                            </View>
                            {errors.capacity ? (
                                <Text style={styles.errorText}>{errors.capacity}</Text>
                            ) : null}
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mô tả</Text>
                            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Mô tả về loại phòng, tiện nghi, đặc điểm..."
                                    value={newRoomType.description}
                                    onChangeText={(text) =>
                                        setNewRoomType({ ...newRoomType, description: text })
                                    }
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor="#94a3b8"
                                    editable={!loading}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={loading}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleAddRoomType}
                            disabled={loading}>
                            <LinearGradient
                                colors={loading ? ['#94a3b8', '#64748b'] : ['#8b5cf6', '#7c3aed']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                        <Text style={styles.submitButtonText}>Thêm loại phòng</Text>
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
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
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
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
    },
    required: {
        color: '#ef4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 1.5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        paddingVertical: 14,
        fontWeight: '500',
    },
    currency: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    unit: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        marginLeft: 4,
    },
    helperText: {
        fontSize: 12,
        color: '#8b5cf6',
        marginTop: 4,
        marginLeft: 4,
        fontWeight: '600',
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
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
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    submitButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});