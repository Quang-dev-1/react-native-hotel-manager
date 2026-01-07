import HotelServiceAPI from '@/services/hotelService';
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

interface AddServiceModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void; // Callback khi thêm thành công
}

export default function AddServiceModal({ visible, onClose, onSuccess }: AddServiceModalProps) {
    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price: '',
        category: 'FOOD',
    });
    const [loading, setLoading] = useState(false);

    const categoryOptions = [
        { value: 'FOOD', label: 'Ăn uống' },
        { value: 'LAUNDRY', label: 'Giặt là' },
        { value: 'SPA', label: 'Spa & Massage' },
        { value: 'ROOM_SERVICE', label: 'Phục vụ phòng' },
        { value: 'TRANSPORT', label: 'Vận chuyển' },
        { value: 'OTHER', label: 'Khác' },
    ];

    const handleAddService = async () => {
        // Validation
        if (!newService.name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên dịch vụ');
            return;
        }

        if (!newService.price.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập giá dịch vụ');
            return;
        }

        const price = parseFloat(newService.price);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Lỗi', 'Giá dịch vụ phải là số dương');
            return;
        }

        setLoading(true);

        try {
            const serviceData = {
                name: newService.name.trim(),
                description: newService.description.trim() || undefined,
                price: price,
                category: newService.category,
                available: true, // Mặc định là available
            };

            console.log('📤 Adding service:', serviceData);

            await HotelServiceAPI.addService(serviceData);

            Alert.alert(
                'Thành công',
                `Đã thêm dịch vụ "${newService.name}"`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setNewService({
                                name: '',
                                description: '',
                                price: '',
                                category: 'FOOD',
                            });

                            // Callback để refresh danh sách
                            if (onSuccess) {
                                onSuccess();
                            }

                            onClose();
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('❌ Add service error:', error);
            Alert.alert(
                'Lỗi',
                error.message || 'Không thể thêm dịch vụ. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setNewService({
                name: '',
                description: '',
                price: '',
                category: 'FOOD',
            });
            onClose();
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm dịch vụ</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Tên dịch vụ <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: Giặt là, Massage..."
                                value={newService.name}
                                onChangeText={(text) =>
                                    setNewService({ ...newService, name: text })
                                }
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mô tả dịch vụ</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Mô tả chi tiết về dịch vụ..."
                                value={newService.description}
                                onChangeText={(text) =>
                                    setNewService({ ...newService, description: text })
                                }
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Giá dịch vụ (VNĐ) <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: 50000"
                                value={newService.price}
                                onChangeText={(text) =>
                                    setNewService({ ...newService, price: text })
                                }
                                keyboardType="numeric"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Loại dịch vụ <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.radioGroup}>
                                {categoryOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        style={[
                                            styles.radioButton,
                                            newService.category === option.value &&
                                            styles.radioButtonActive,
                                        ]}
                                        onPress={() =>
                                            !loading &&
                                            setNewService({
                                                ...newService,
                                                category: option.value,
                                            })
                                        }
                                        disabled={loading}>
                                        <Text
                                            style={[
                                                styles.radioText,
                                                newService.category === option.value &&
                                                styles.radioTextActive,
                                            ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
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
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleAddService}
                            disabled={loading}>
                            <LinearGradient
                                colors={loading ? ['#94a3b8', '#64748b'] : ['#ec4899', '#db2777']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Thêm dịch vụ</Text>
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
        maxHeight: '85%',
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
        marginBottom: 20,
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
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
    },
    textArea: {
        minHeight: 80,
        paddingTop: 12,
    },
    radioGroup: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    radioButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    radioButtonActive: {
        backgroundColor: '#ec4899',
        borderColor: '#ec4899',
    },
    radioText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    radioTextActive: {
        color: '#fff',
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
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});