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
import roomService, { RoomType } from '../services/roomService';

interface EditRoomTypeModalProps {
    visible: boolean;
    roomType: RoomType | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditRoomTypeModal({ visible, roomType, onClose, onSuccess }: EditRoomTypeModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [maxOccupancy, setMaxOccupancy] = useState('');
    const [amenities, setAmenities] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && roomType) {
            setName(roomType.name);
            setDescription(roomType.description || '');
            setBasePrice(roomType.basePrice.toString());
            setMaxOccupancy(roomType.maxOccupancy.toString());
            setAmenities(roomType.amenities || '');
        }
    }, [visible, roomType]);

    const handleSubmit = async () => {
        if (!name.trim() || !basePrice || !maxOccupancy) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const priceNum = parseFloat(basePrice);
        const occupancyNum = parseInt(maxOccupancy);

        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert('Lỗi', 'Giá phải là số dương');
            return;
        }

        if (isNaN(occupancyNum) || occupancyNum <= 0) {
            Alert.alert('Lỗi', 'Số người tối đa phải là số dương');
            return;
        }

        try {
            setLoading(true);
            await roomService.updateRoomType(roomType!.id!, {
                name: name.trim(),
                description: description.trim(),
                basePrice: priceNum,
                maxOccupancy: occupancyNum,
                amenities: amenities.trim()
            });

            Alert.alert('Thành công', 'Cập nhật loại phòng thành công');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật loại phòng');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setBasePrice('');
        setMaxOccupancy('');
        setAmenities('');
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
                        <Text style={styles.title}>Chỉnh sửa loại phòng</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tên loại phòng *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ví dụ: Phòng Deluxe"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mô tả</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Mô tả về loại phòng..."
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Giá cơ bản (VND) *</Text>
                            <TextInput
                                style={styles.input}
                                value={basePrice}
                                onChangeText={setBasePrice}
                                placeholder="Ví dụ: 500000"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số người tối đa *</Text>
                            <TextInput
                                style={styles.input}
                                value={maxOccupancy}
                                onChangeText={setMaxOccupancy}
                                placeholder="Ví dụ: 2"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tiện nghi</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={amenities}
                                onChangeText={setAmenities}
                                placeholder="Ví dụ: WiFi, TV, Điều hòa..."
                                multiline
                                numberOfLines={3}
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
        color: '#334155',
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
        height: 80
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
        backgroundColor: '#8b5cf6'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});