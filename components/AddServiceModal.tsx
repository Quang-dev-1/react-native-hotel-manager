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

interface AddServiceModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AddServiceModal({ visible, onClose }: AddServiceModalProps) {
    const [newService, setNewService] = useState({
        name: '',
        price: '',
        category: 'food',
    });

    const handleAddService = () => {
        if (!newService.name || !newService.price) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }
        Alert.alert('Thành công', `Đã thêm dịch vụ ${newService.name}`, [
            {
                text: 'OK',
                onPress: () => {
                    onClose();
                    setNewService({ name: '', price: '', category: 'food' });
                },
            },
        ]);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm dịch vụ</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Tên dịch vụ</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: Giặt là, Massage..."
                                value={newService.name}
                                onChangeText={(text) => setNewService({ ...newService, name: text })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Giá dịch vụ (VNĐ)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ví dụ: 50000"
                                value={newService.price}
                                onChangeText={(text) => setNewService({ ...newService, price: text })}
                                keyboardType="numeric"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Loại dịch vụ</Text>
                            <View style={styles.radioGroup}>
                                {['food', 'laundry', 'spa', 'other'].map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        style={[
                                            styles.radioButton,
                                            newService.category === category && styles.radioButtonActive,
                                        ]}
                                        onPress={() => setNewService({ ...newService, category })}>
                                        <Text
                                            style={[
                                                styles.radioText,
                                                newService.category === category &&
                                                styles.radioTextActive,
                                            ]}>
                                            {category === 'food'
                                                ? 'Ăn uống'
                                                : category === 'laundry'
                                                    ? 'Giặt là'
                                                    : category === 'spa'
                                                        ? 'Spa'
                                                        : 'Khác'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={handleAddService}>
                            <LinearGradient
                                colors={['#ec4899', '#db2777']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.submitGradient}>
                                <Text style={styles.submitButtonText}>Thêm dịch vụ</Text>
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
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#1e293b',
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
    submitGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});