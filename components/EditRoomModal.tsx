import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import roomService, { Room, RoomType } from '../services/roomService';

interface EditRoomModalProps {
    visible: boolean;
    room: Room | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditRoomModal({ visible, room, onClose, onSuccess }: EditRoomModalProps) {
    const [roomNumber, setRoomNumber] = useState('');
    const [roomTypeId, setRoomTypeId] = useState('');
    const [floor, setFloor] = useState('');
    const [price, setPrice] = useState('');
    const [status, setStatus] = useState('AVAILABLE');
    const [description, setDescription] = useState('');
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(false);

    const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);

    useEffect(() => {
        if (visible) {
            loadRoomTypes();
            if (room) {
                setRoomNumber(room.roomNumber);
                setFloor(room.floor.toString());
                setPrice(room.price.toString());
                setStatus(room.status);
                setDescription(room.description || '');
            }
        }
    }, [visible, room]);

    const loadRoomTypes = async () => {
        try {
            setLoadingTypes(true);
            const data = await roomService.getRoomTypes();
            setRoomTypes(data);

            if (room && data.length > 0) {
                const matchedType = data.find(rt => rt.name === room.roomTypeName);
                if (matchedType) {
                    setRoomTypeId(matchedType.id!.toString());
                }
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải danh sách loại phòng');
        } finally {
            setLoadingTypes(false);
        }
    };

    const handleSubmit = async () => {
        if (!roomNumber.trim() || !roomTypeId || !floor || !price) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            const selectedRoomType = roomTypes.find(rt => rt.id?.toString() === roomTypeId);

            await roomService.updateRoom(room!.id!, {
                roomNumber: roomNumber.trim(),
                roomTypeName: selectedRoomType?.name || '',
                floor: parseInt(floor),
                price: parseFloat(price),
                status,
                description: description.trim()
            });

            Alert.alert('Thành công', 'Cập nhật phòng thành công');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật phòng');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setRoomNumber('');
        setRoomTypeId('');
        setFloor('');
        setPrice('');
        setStatus('AVAILABLE');
        setDescription('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chỉnh sửa phòng</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số phòng *</Text>
                            <TextInput
                                style={styles.input}
                                value={roomNumber}
                                onChangeText={setRoomNumber}
                                placeholder="Ví dụ: 101"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Loại phòng *</Text>
                            {loadingTypes ? (
                                <ActivityIndicator color="#3b82f6" />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.selectButton}
                                        onPress={() => setShowRoomTypeModal(true)}
                                    >
                                        <Text style={[styles.selectButtonText, !roomTypeId && styles.placeholderText]}>
                                            {roomTypeId
                                                ? roomTypes.find(t => t.id?.toString() === roomTypeId)?.name
                                                : 'Chọn loại phòng'}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#64748b" />
                                    </TouchableOpacity>

                                    <Modal visible={showRoomTypeModal} transparent animationType="fade">
                                        <TouchableOpacity
                                            style={styles.modalOverlay}
                                            activeOpacity={1}
                                            onPress={() => setShowRoomTypeModal(false)}
                                        >
                                            <View style={styles.optionsContainer}>
                                                <ScrollView>
                                                    {roomTypes.map((type) => (
                                                        <TouchableOpacity
                                                            key={type.id}
                                                            style={styles.optionItem}
                                                            onPress={() => {
                                                                setRoomTypeId(type.id!.toString());
                                                                setShowRoomTypeModal(false);
                                                            }}
                                                        >
                                                            <Text style={styles.optionText}>{type.name}</Text>
                                                            {roomTypeId === type.id?.toString() && (
                                                                <Ionicons name="checkmark" size={20} color="#3b82f6" />
                                                            )}
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        </TouchableOpacity>
                                    </Modal>
                                </>
                            )}
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tầng *</Text>
                            <TextInput
                                style={styles.input}
                                value={floor}
                                onChangeText={setFloor}
                                placeholder="Ví dụ: 1"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Giá (VND) *</Text>
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="Ví dụ: 500000"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Trạng thái *</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowStatusModal(true)}
                            >
                                <Text style={styles.selectButtonText}>
                                    {status === 'AVAILABLE' ? 'Trống' :
                                        status === 'OCCUPIED' ? 'Đang sử dụng' :
                                            status === 'MAINTENANCE' ? 'Bảo trì' : 'Đang dọn'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#64748b" />
                            </TouchableOpacity>

                            <Modal visible={showStatusModal} transparent animationType="fade">
                                <TouchableOpacity
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowStatusModal(false)}
                                >
                                    <View style={styles.optionsContainer}>
                                        {[
                                            { label: 'Trống', value: 'AVAILABLE' },
                                            { label: 'Đang sử dụng', value: 'OCCUPIED' },
                                            { label: 'Bảo trì', value: 'MAINTENANCE' },
                                            { label: 'Đang dọn', value: 'CLEANING' }
                                        ].map((item) => (
                                            <TouchableOpacity
                                                key={item.value}
                                                style={styles.optionItem}
                                                onPress={() => {
                                                    setStatus(item.value);
                                                    setShowStatusModal(false);
                                                }}
                                            >
                                                <Text style={styles.optionText}>{item.label}</Text>
                                                {status === item.value && (
                                                    <Ionicons name="checkmark" size={20} color="#3b82f6" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mô tả</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Mô tả về phòng..."
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Cập nhật</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end'
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b'
    },
    content: {
        padding: 20
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#03080e',
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#1e293b'
    },
    textArea: {
        height: 100
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        backgroundColor: '#fff',
        minHeight: 50
    },
    selectButtonText: {
        fontSize: 15,
        color: '#1e293b',
        flex: 1
    },
    placeholderText: {
        color: '#94a3b8'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    optionsContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        width: '85%',
        maxHeight: '70%',
        padding: 8
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    optionText: {
        fontSize: 16,
        color: '#1e293b',
        flex: 1,
        fontWeight: '500'
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        overflow: 'hidden'
    },
    picker: {
        height: 50,
        color: '#010307'
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0'
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    cancelButton: {
        backgroundColor: '#f1f5f9'
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600'
    },
    submitButton: {
        backgroundColor: '#3b82f6'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});