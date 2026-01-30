import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import hotelServiceAPI, { HotelService } from '../services/hotelService';

interface EditServiceModalProps {
    visible: boolean;
    service: HotelService | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditServiceModal({ visible, service, onClose, onSuccess }: EditServiceModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('FOOD');
    const [available, setAvailable] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);

    useEffect(() => {
        if (visible && service) {
            setName(service.name);
            setDescription(service.description || '');
            setPrice(service.price.toString());
            setCategory(service.category);
            setAvailable(service.available);
        }
    }, [visible, service]);

    const handleSubmit = async () => {
        if (!name.trim() || !price) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert('Lỗi', 'Giá phải là số dương');
            return;
        }

        try {
            setLoading(true);
            await hotelServiceAPI.updateService(service!.id!, {
                name: name.trim(),
                description: description.trim(),
                price: priceNum,
                category,
                available
            });

            Alert.alert('Thành công', 'Cập nhật dịch vụ thành công');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setPrice('');
        setCategory('FOOD');
        setAvailable(true);
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
                        <Text style={styles.title}>Chỉnh sửa dịch vụ</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tên dịch vụ *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ví dụ: Massage"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mô tả</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Mô tả về dịch vụ..."
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Giá (VND) *</Text>
                            <TextInput
                                style={styles.input}
                                value={price}
                                onChangeText={setPrice}
                                placeholder="Ví dụ: 100000"
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Danh mục *</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowCategoryModal(true)}
                            >
                                <Text style={styles.selectButtonText}>
                                    {category === 'FOOD' ? 'Ăn uống' :
                                        category === 'ENTERTAINMENT' ? 'Giải trí' :
                                            category === 'SPA' ? 'Spa & Massage' :
                                                category === 'LAUNDRY' ? 'Giặt ủi' :
                                                    category === 'TRANSPORT' ? 'Vận chuyển' : 'Khác'}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#64748b" />
                            </TouchableOpacity>

                            <Modal visible={showCategoryModal} transparent animationType="fade">
                                <TouchableOpacity
                                    style={styles.modalOverlay}
                                    activeOpacity={1}
                                    onPress={() => setShowCategoryModal(false)}
                                >
                                    <View style={styles.optionsContainer}>
                                        {[
                                            { label: 'Ăn uống', value: 'FOOD' },
                                            { label: 'Giải trí', value: 'ENTERTAINMENT' },
                                            { label: 'Spa & Massage', value: 'SPA' },
                                            { label: 'Giặt ủi', value: 'LAUNDRY' },
                                            { label: 'Vận chuyển', value: 'TRANSPORT' },
                                            { label: 'Khác', value: 'OTHER' }
                                        ].map((item) => (
                                            <TouchableOpacity
                                                key={item.value}
                                                style={styles.optionItem}
                                                onPress={() => {
                                                    setCategory(item.value);
                                                    setShowCategoryModal(false);
                                                }}
                                            >
                                                <Text style={styles.optionText}>{item.label}</Text>
                                                {category === item.value && (
                                                    <Ionicons name="checkmark" size={20} color="#ec4899" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </TouchableOpacity>
                            </Modal>
                        </View>
                        <View style={styles.switchGroup}>
                            <View style={styles.switchLabel}>
                                <Text style={styles.label}>Khả dụng</Text>
                                <Text style={styles.subLabel}>
                                    {available ? 'Đang hoạt động' : 'Tạm ngưng'}
                                </Text>
                            </View>
                            <Switch
                                value={available}
                                onValueChange={setAvailable}
                                trackColor={{ false: '#cbd5e1', true: '#86efac' }}
                                thumbColor={available ? '#10b981' : '#64748b'}
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
    subLabel: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        overflow: 'hidden'
    },
    picker: {
        height: 50
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        marginTop: 10
    },
    switchLabel: {
        flex: 1
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
        backgroundColor: '#ec4899'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
});