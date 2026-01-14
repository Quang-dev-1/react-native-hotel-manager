// EditBookingModal.tsx
import { Booking } from '@/services/bookingService';
import hotelServiceAPI, { BookingServiceItem } from '@/services/hotelService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    View,
} from 'react-native';

interface EditBookingModalProps {
    visible: boolean;
    booking: Booking | null;
    onClose: () => void;
    onSave: (bookingId: number, data: UpdateBookingData) => Promise<void>;
}

export interface UpdateBookingData {
    customerName: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    deposit: number;
    notes?: string;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
    visible,
    booking,
    onClose,
    onSave,
}) => {
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [deposit, setDeposit] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [bookingServices, setBookingServices] = useState<BookingServiceItem[]>([]);

    // Load dữ liệu booking và services khi modal mở
    useEffect(() => {
        if (visible && booking) {
            setCustomerName(booking.customerName || '');
            setPhone(booking.phone || '');
            setCheckIn(booking.checkIn || '');
            setCheckOut(booking.checkOut || '');
            setDeposit(booking.deposit?.toString() || '');
            setNotes(booking.notes || '');

            // Load services của booking
            loadBookingServices();
        }
    }, [visible, booking]);

    const loadBookingServices = async () => {
        if (!booking?.id) return;

        try {
            setServicesLoading(true);
            const services = await hotelServiceAPI.getBookingServices(booking.id);
            setBookingServices(services);
        } catch (error: any) {
            console.error('Error loading services:', error);
            // Không hiển thị alert ở đây để không làm phiền người dùng
        } finally {
            setServicesLoading(false);
        }
    };

    const handleRemoveService = async (serviceItemId: number) => {
        if (!booking?.id) return;

        Alert.alert(
            'Xóa dịch vụ',
            'Bạn có chắc muốn xóa dịch vụ này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await hotelServiceAPI.removeServiceFromBooking(booking.id!, serviceItemId);
                            Alert.alert('Thành công', 'Đã xóa dịch vụ');
                            loadBookingServices(); // Reload services
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể xóa dịch vụ');
                        }
                    },
                },
            ]
        );
    };

    const validateForm = (): boolean => {
        if (!customerName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên khách hàng');
            return false;
        }

        if (!phone.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
            return false;
        }

        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phone.trim())) {
            Alert.alert('Lỗi', 'Số điện thoại không hợp lệ (10-11 chữ số)');
            return false;
        }

        if (!checkIn.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập ngày nhận phòng');
            return false;
        }

        if (!checkOut.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập ngày trả phòng');
            return false;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(checkIn.trim()) || !dateRegex.test(checkOut.trim())) {
            Alert.alert('Lỗi', 'Định dạng ngày không đúng (YYYY-MM-DD)');
            return false;
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        if (checkOutDate <= checkInDate) {
            Alert.alert('Lỗi', 'Ngày trả phòng phải sau ngày nhận phòng');
            return false;
        }

        if (!deposit.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiền đặt cọc');
            return false;
        }

        const depositNum = parseFloat(deposit);
        if (isNaN(depositNum) || depositNum < 0) {
            Alert.alert('Lỗi', 'Tiền đặt cọc không hợp lệ');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        if (!booking?.id) return;

        setLoading(true);
        try {
            const updateData: UpdateBookingData = {
                customerName: customerName.trim(),
                phone: phone.trim(),
                checkIn: checkIn.trim(),
                checkOut: checkOut.trim(),
                deposit: parseFloat(deposit),
                notes: notes.trim(),
            };

            await onSave(booking.id, updateData);
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật booking');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
        }
    };

    // Tính tổng tiền dịch vụ
    const totalServiceAmount = bookingServices.reduce((sum, service) => sum + service.totalPrice, 0);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chỉnh sửa booking</Text>
                        <TouchableOpacity onPress={handleClose} disabled={loading}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollView}>
                        <View style={styles.modalBody}>
                            {/* Room Info */}
                            <View style={styles.roomInfoBox}>
                                <Ionicons name="bed" size={20} color="#4a90e2" />
                                <View style={styles.roomInfoText}>
                                    <Text style={styles.roomInfoNumber}>
                                        Phòng {booking?.roomNumber}
                                    </Text>
                                    <View style={styles.statusBadge}>
                                        <Text style={styles.statusText}>
                                            {booking?.status === 'PENDING' && 'Chờ xác nhận'}
                                            {booking?.status === 'CONFIRMED' && 'Đã xác nhận'}
                                            {booking?.status === 'CHECKED_IN' && 'Đang thuê'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Customer Name */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Tên khách hàng <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="person-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập tên khách hàng"
                                        value={customerName}
                                        onChangeText={setCustomerName}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Phone */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Số điện thoại <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="call-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập số điện thoại"
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Check-in Date */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Ngày nhận phòng <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="calendar-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        value={checkIn}
                                        onChangeText={setCheckIn}
                                        editable={!loading}
                                    />
                                </View>
                                <Text style={styles.inputHint}>Ví dụ: 2024-12-25</Text>
                            </View>

                            {/* Check-out Date */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Ngày trả phòng <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="calendar-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="YYYY-MM-DD"
                                        value={checkOut}
                                        onChangeText={setCheckOut}
                                        editable={!loading}
                                    />
                                </View>
                                <Text style={styles.inputHint}>Ví dụ: 2024-12-27</Text>
                            </View>

                            {/* Deposit */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>
                                    Tiền đặt cọc <Text style={styles.required}>*</Text>
                                </Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="cash-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Nhập tiền đặt cọc"
                                        value={deposit}
                                        onChangeText={setDeposit}
                                        keyboardType="numeric"
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Notes */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Ghi chú</Text>
                                <View style={styles.inputWithIcon}>
                                    <Ionicons name="document-text-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        placeholder="Nhập ghi chú (nếu có)"
                                        value={notes}
                                        onChangeText={setNotes}
                                        multiline
                                        numberOfLines={3}
                                        editable={!loading}
                                    />
                                </View>
                            </View>

                            {/* Services Section */}
                            <View style={styles.servicesSection}>
                                <View style={styles.servicesSectionHeader}>
                                    <Ionicons name="cube-outline" size={20} color="#4a90e2" />
                                    <Text style={styles.servicesSectionTitle}>Dịch vụ đã sử dụng</Text>
                                </View>

                                {servicesLoading ? (
                                    <ActivityIndicator size="small" color="#4a90e2" style={{ marginVertical: 16 }} />
                                ) : bookingServices.length === 0 ? (
                                    <Text style={styles.emptyServicesText}>Chưa có dịch vụ nào</Text>
                                ) : (
                                    bookingServices.map((service) => (
                                        <View key={service.id} style={styles.serviceItem}>
                                            <View style={styles.serviceItemLeft}>
                                                <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                                                <View style={styles.serviceItemInfo}>
                                                    <Text style={styles.serviceItemName}>
                                                        {service.serviceName}
                                                    </Text>
                                                    <Text style={styles.serviceItemDetail}>
                                                        {service.quantity} x {service.price.toLocaleString('vi-VN')}đ
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.serviceItemRight}>
                                                <Text style={styles.serviceItemTotal}>
                                                    {service.totalPrice.toLocaleString('vi-VN')}đ
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => handleRemoveService(service.id!)}
                                                    style={styles.removeServiceButton}>
                                                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))
                                )}
                            </View>

                            {/* Booking Summary */}
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryTitle}>Tổng kết</Text>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Số đêm:</Text>
                                    <Text style={styles.summaryValue}>{booking?.nights} đêm</Text>
                                </View>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Tiền phòng:</Text>
                                    <Text style={styles.summaryValue}>
                                        {booking?.totalAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                                {totalServiceAmount > 0 && (
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Tiền dịch vụ:</Text>
                                        <Text style={styles.summaryValue}>
                                            {totalServiceAmount.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                )}
                                <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                                    <Text style={styles.summaryLabelTotal}>Tổng cộng:</Text>
                                    <Text style={styles.summaryValueTotal}>
                                        {((booking?.totalAmount || 0) + totalServiceAmount).toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={loading}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                            onPress={handleSave}
                            disabled={loading}>
                            <LinearGradient
                                colors={loading ? ['#94a3b8', '#64748b'] : ['#4a90e2', '#357abd']}
                                style={styles.submitButtonGradient}>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Lưu thay đổi</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 500,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
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
    modalScrollView: {
        maxHeight: 500,
    },
    modalBody: {
        padding: 20,
    },
    roomInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    roomInfoText: {
        flex: 1,
    },
    roomInfoNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 6,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1e40af',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    required: {
        color: '#ef4444',
    },
    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        paddingVertical: 12,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputHint: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
        marginLeft: 4,
    },
    servicesSection: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    servicesSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    servicesSectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    emptyServicesText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        paddingVertical: 16,
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
    },
    serviceItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    serviceItemInfo: {
        flex: 1,
    },
    serviceItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    serviceItemDetail: {
        fontSize: 12,
        color: '#64748b',
    },
    serviceItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    serviceItemTotal: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4a90e2',
    },
    removeServiceButton: {
        padding: 4,
    },
    summaryBox: {
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 12,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e40af',
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    summaryRowTotal: {
        borderTopWidth: 1,
        borderTopColor: '#cbd5e1',
        paddingTop: 12,
        marginTop: 4,
    },
    summaryLabelTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    summaryValueTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4a90e2',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
    submitButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});

export default EditBookingModal;