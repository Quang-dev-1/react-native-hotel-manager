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
    onSuccess?: () => void;
}

export default function AddServiceModal({ visible, onClose, onSuccess }: AddServiceModalProps) {
    const initialState = {
        name: '',
        description: '',
        price: '',
        category: 'FOOD',
    };

    const [newService, setNewService] = useState(initialState);
    const [loading, setLoading] = useState(false);

    const categoryOptions = [
        { value: 'FOOD', label: 'Ăn uống' },
        { value: 'LAUNDRY', label: 'Giặt là' },
        { value: 'SPA', label: 'Spa' },
        { value: 'ROOM_SERVICE', label: 'Phòng' },
        { value: 'TRANSPORT', label: 'Xe' },
        { value: 'OTHER', label: 'Khác' },
    ];

    const handleAddService = async () => {
        if (!newService.name.trim() || !newService.price.trim()) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tên và Giá dịch vụ');
            return;
        }

        const priceNum = parseFloat(newService.price);
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert('Lỗi', 'Giá phải là số dương');
            return;
        }

        setLoading(true);
        try {
            await HotelServiceAPI.addService({
                name: newService.name.trim(),
                description: newService.description.trim(),
                price: priceNum,
                category: newService.category,
                available: true,
            });

            Alert.alert('Thành công', 'Đã thêm dịch vụ mới');
            setNewService(initialState); // Reset form
            if (onSuccess) onSuccess(); // Gọi để load lại danh sách ở trang cha
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể kết nối máy chủ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm dịch vụ</Text>
                        <TouchableOpacity onPress={onClose} disabled={loading}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <Text style={styles.inputLabel}>Tên dịch vụ *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Tên dịch vụ..."
                            value={newService.name}
                            onChangeText={(text) => setNewService({ ...newService, name: text })}
                        />

                        <Text style={styles.inputLabel}>Giá (VNĐ) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ví dụ: 50000"
                            keyboardType="numeric"
                            value={newService.price}
                            onChangeText={(text) => setNewService({ ...newService, price: text })}
                        />

                        <Text style={styles.inputLabel}>Mô tả</Text>
                        <TextInput
                            style={[styles.input, { height: 80 }]}
                            multiline
                            placeholder="Mô tả ngắn..."
                            value={newService.description}
                            onChangeText={(text) => setNewService({ ...newService, description: text })}
                        />

                        <Text style={styles.inputLabel}>Loại dịch vụ</Text>
                        <View style={styles.radioGroup}>
                            {categoryOptions.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => setNewService({ ...newService, category: opt.value })}
                                    style={[styles.radioButton, newService.category === opt.value && styles.radioButtonActive]}
                                >
                                    <Text style={[styles.radioText, newService.category === opt.value && { color: '#fff' }]}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity style={styles.submitButton} onPress={handleAddService} disabled={loading}>
                            <LinearGradient colors={['#ec4899', '#db2777']} style={styles.submitGradient}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Xác nhận thêm</Text>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, maxHeight: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    modalBody: { padding: 20 },
    inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#444' },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 15 },
    radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    radioButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
    radioButtonActive: { backgroundColor: '#ec4899', borderColor: '#ec4899' },
    radioText: { fontSize: 12, color: '#64748b' },
    modalFooter: { padding: 20 },
    submitButton: { borderRadius: 10, overflow: 'hidden' },
    submitGradient: { padding: 15, alignItems: 'center' },
    submitButtonText: { color: '#fff', fontWeight: 'bold' }
});