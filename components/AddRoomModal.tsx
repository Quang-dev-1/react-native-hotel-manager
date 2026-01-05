import roomService from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
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

interface AddRoomModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

interface RoomType {
    id?: number;
    name: string;
    basePrice: number;
    maxOccupancy: number;
    description?: string;
}

export default function AddRoomModal({ visible, onClose, onSuccess }: AddRoomModalProps) {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

    const [newRoom, setNewRoom] = useState({
        number: '',
        type: '',
        floor: '1',
        description: '',
    });

    const [errors, setErrors] = useState({
        number: '',
        floor: '',
        type: '',
    });

    useEffect(() => {
        if (visible) {
            fetchRoomTypes();
        }
    }, [visible]);

    const fetchRoomTypes = async () => {
        try {
            setLoadingRoomTypes(true);
            const types = await roomService.getRoomTypes();
            setRoomTypes(types);

            if (types.length > 0 && !newRoom.type) {
                setNewRoom(prev => ({ ...prev, type: types[0].name }));
            }
        } catch (error: any) {
            console.error('Error fetching room types:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tải danh sách loại phòng');
        } finally {
            setLoadingRoomTypes(false);
        }
    };

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

    const validateRoomType = (type: string) => {
        if (!type.trim()) {
            return 'Vui lòng chọn loại phòng';
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

    const handleAddRoom = async () => {
        const numberError = validateRoomNumber(newRoom.number);
        const floorError = validateFloor(newRoom.floor);
        const typeError = validateRoomType(newRoom.type);

        setErrors({
            number: numberError,
            floor: floorError,
            type: typeError,
        });

        if (numberError || floorError || typeError) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
            return;
        }

        const selectedRoomType = roomTypes.find(rt => rt.name === newRoom.type);
        if (!selectedRoomType) {
            Alert.alert('Lỗi', 'Loại phòng không hợp lệ');
            return;
        }

        try {
            setLoading(true);

            const roomData = {
                roomNumber: newRoom.number.trim(),
                roomTypeName: newRoom.type,
                floor: parseInt(newRoom.floor),
                price: selectedRoomType.basePrice,
                status: 'AVAILABLE',
                description: newRoom.description.trim(),
            };

            await roomService.addRoom(roomData);

            Alert.alert('Thành công', `Đã thêm phòng ${newRoom.number} thành công!`, [
                {
                    text: 'OK',
                    onPress: () => {
                        onClose();
                        setNewRoom({
                            number: '',
                            type: roomTypes[0]?.name || '',
                            floor: '1',
                            description: '',
                        });
                        setErrors({ number: '', floor: '', type: '' });
                        if (onSuccess) onSuccess();
                    },
                },
            ]);
        } catch (error: any) {
            console.error('Error adding room:', error);
            Alert.alert('Lỗi', error.message || 'Không thể thêm phòng');
        } finally {
            setLoading(false);
        }
    };

    if (loadingRoomTypes) {
        return (
            <Modal visible={visible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4a90e2" />
                            <Text style={styles.loadingText}>Đang tải...</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm phòng mới</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
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
                                    editable={!loading}
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
                            {roomTypes.length === 0 ? (
                                <Text style={styles.noDataText}>
                                    Chưa có loại phòng nào. Vui lòng thêm loại phòng trước.
                                </Text>
                            ) : (
                                <View style={styles.radioGroup}>
                                    {roomTypes.map((roomType) => (
                                        <TouchableOpacity
                                            key={roomType.id}
                                            style={[
                                                styles.radioButton,
                                                newRoom.type === roomType.name && styles.radioButtonActive,
                                            ]}
                                            onPress={() => setNewRoom({ ...newRoom, type: roomType.name })}
                                            disabled={loading}>
                                            <View style={styles.radioContent}>
                                                <View style={styles.radioLeft}>
                                                    <Text
                                                        style={[
                                                            styles.radioText,
                                                            newRoom.type === roomType.name && styles.radioTextActive,
                                                        ]}>
                                                        {roomType.name}
                                                    </Text>
                                                    <Text
                                                        style={[
                                                            styles.radioCapacity,
                                                            newRoom.type === roomType.name && styles.radioCapacityActive,
                                                        ]}>
                                                        <Ionicons name="people" size={12} /> {roomType.maxOccupancy} người
                                                    </Text>
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.radioPriceText,
                                                        newRoom.type === roomType.name && styles.radioPriceTextActive,
                                                    ]}>
                                                    {roomType.basePrice.toLocaleString('vi-VN')}đ
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            {errors.type ? (
                                <Text style={styles.errorText}>{errors.type}</Text>
                            ) : null}
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
                                    editable={!loading}
                                />
                            </View>
                            {errors.floor ? (
                                <Text style={styles.errorText}>{errors.floor}</Text>
                            ) : null}
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Mô tả phòng</Text>
                            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Mô tả về phòng, vị trí, view, đặc điểm riêng..."
                                    value={newRoom.description}
                                    onChangeText={(text) =>
                                        setNewRoom({ ...newRoom, description: text })
                                    }
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor="#94a3b8"
                                    editable={!loading}
                                />
                            </View>
                            <Text style={styles.helperText}>
                                Ví dụ: Phòng hướng biển, view đẹp, gần thang máy...
                            </Text>
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
                            onPress={handleAddRoom}
                            disabled={loading || roomTypes.length === 0}>
                            <LinearGradient
                                colors={loading || roomTypes.length === 0 ? ['#94a3b8', '#64748b'] : ['#4a90e2', '#357abd']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                                        <Text style={styles.submitButtonText}>Thêm phòng</Text>
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
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        marginLeft: 4,
    },
    helperText: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
        marginLeft: 4,
        fontStyle: 'italic',
    },
    radioGroup: {
        gap: 12,
    },
    radioButton: {
        paddingHorizontal: 16,
        paddingVertical: 14,
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
    radioLeft: {
        flex: 1,
        gap: 4,
    },
    radioText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    radioTextActive: {
        color: '#4a90e2',
    },
    radioCapacity: {
        fontSize: 12,
        fontWeight: '500',
        color: '#94a3b8',
    },
    radioCapacityActive: {
        color: '#4a90e2',
    },
    radioPriceText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94a3b8',
    },
    radioPriceTextActive: {
        color: '#4a90e2',
    },
    noDataText: {
        fontSize: 14,
        color: '#ef4444',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 12,
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
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
});