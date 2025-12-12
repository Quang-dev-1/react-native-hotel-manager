// app/(drawer)/components/modals/AddRoomModal.tsx
import { useRoom } from '@/contexts/RoomContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddRoomModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AddRoomModal({ visible, onClose }: AddRoomModalProps) {
    const { addRoom, roomTypes, getRoomTypeByName } = useRoom();

    const [newRoom, setNewRoom] = useState({
        number: '',
        type: roomTypes[0]?.name || 'Tiêu chuẩn',
        floor: '1',
    });

    const [errors, setErrors] = useState({
        number: '',
        floor: '',
    });

    const validateRoomNumber = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập số phòng';
        }
        if (!/^[0-9A-Za-z]+$/.test(text.trim())) {
            return 'Số phòng chỉ chứa chữ và số';
        }
        return '';
    };

    const validateFloor = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập số tầng';
        }
        const floorNum = parseInt(text);
        if (isNaN(floorNum) || floorNum < 1) {
            return 'Số tầng phải là số dương';
        }
        return '';
    };

    const handleRoomNumberChange = (text: string) => {
        setNewRoom({ ...newRoom, number: text });
        setErrors({ ...errors, number: validateRoomNumber(text) });
    };

    const handleFloorChange = (text: string) => {
        setNewRoom({ ...newRoom, floor: text });
        setErrors({ ...errors, floor: validateFloor(text) });
    };

    const handleAddRoom = () => {
        const numberError = validateRoomNumber(newRoom.number);
        const floorError = validateFloor(newRoom.floor);

        setErrors({
            number: numberError,
            floor: floorError,
        });

        if (numberError || floorError) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
            return;
        }

        const roomType = getRoomTypeByName(newRoom.type);
        if (!roomType) {
            Alert.alert('Lỗi', 'Loại phòng không hợp lệ');
            return;
        }

        addRoom({
            roomNumber: newRoom.number.trim(),
            type: newRoom.type,
            floor: parseInt(newRoom.floor),
            price: roomType.price,
        });

        Alert.alert('Thành công', `Đã thêm phòng ${newRoom.number} thành công!`, [
            {
                text: 'OK',
                onPress: () => {
                    onClose();
                    setNewRoom({ number: '', type: roomTypes[0]?.name || 'Tiêu chuẩn', floor: '1' });
                    setErrors({ number: '', floor: '' });
                },
            },
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm phòng mới</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Room Number */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Số phòng <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrapper,
                                errors.number ? styles.inputError : null
                            ]}>
                                <Ionicons name="home-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ví dụ: 101, 102, A01..."
                                    value={newRoom.number}
                                    onChangeText={handleRoomNumberChange}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            {errors.number ? (
                                <Text style={styles.errorText}>{errors.number}</Text>
                            ) : null}
                        </View>

                        {/* Room Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Loại phòng <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.radioGroup}>
                                {roomTypes.map((roomType) => (
                                    <TouchableOpacity
                                        key={roomType.id}
                                        style={[
                                            styles.radioButton,
                                            newRoom.type === roomType.name && styles.radioButtonActive,
                                        ]}
                                        onPress={() => setNewRoom({ ...newRoom, type: roomType.name })}>
                                        <View style={styles.radioContent}>
                                            <Text
                                                style={[
                                                    styles.radioText,
                                                    newRoom.type === roomType.name && styles.radioTextActive,
                                                ]}>
                                                {roomType.name}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.radioPriceText,
                                                    newRoom.type === roomType.name && styles.radioPriceTextActive,
                                                ]}>
                                                {roomType.price.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Floor */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Tầng <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[
                                styles.inputWrapper,
                                errors.floor ? styles.inputError : null
                            ]}>
                                <Ionicons name="layers-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập số tầng"
                                    value={newRoom.floor}
                                    onChangeText={handleFloorChange}
                                    keyboardType="numeric"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                            {errors.floor ? (
                                <Text style={styles.errorText}>{errors.floor}</Text>
                            ) : null}
                        </View>

                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleAddRoom}>
                            <LinearGradient
                                colors={['#4a90e2', '#357abd']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}>
                                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                <Text style={styles.submitButtonText}>Thêm phòng</Text>
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
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        marginLeft: 4,
    },
    radioGroup: {
        gap: 12,
    },
    radioButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
    },
    radioButtonActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#4a90e2',
    },
    radioContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    radioText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    radioTextActive: {
        color: '#4a90e2',
    },
    radioPriceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
    },
    radioPriceTextActive: {
        color: '#4a90e2',
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