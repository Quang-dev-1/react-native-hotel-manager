import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CheckoutPaymentModalProps {
    visible: boolean;
    booking: {
        id: number;
        roomNumber?: string;
        customerName: string;
        totalAmount: number;
        deposit: number;
    } | null;
    remainingAmount: number;
    onClose: () => void;
    onConfirm: (paymentMethod: 'cash' | 'online') => void;
}

export default function CheckoutPaymentModal({
    visible,
    booking,
    remainingAmount,
    onClose,
    onConfirm,
}: CheckoutPaymentModalProps) {
    if (!booking) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        {/* Booking Info */}
                        <View style={styles.bookingInfo}>
                            <View style={styles.bookingInfoRow}>
                                <Ionicons name="bed" size={18} color="#4a90e2" />
                                <Text style={styles.bookingInfoText}>
                                    Phòng {booking.roomNumber}
                                </Text>
                            </View>
                            <View style={styles.bookingInfoRow}>
                                <Ionicons name="person" size={18} color="#4a90e2" />
                                <Text style={styles.bookingInfoText}>
                                    {booking.customerName}
                                </Text>
                            </View>
                        </View>

                        {/* Amount Summary */}
                        <View style={styles.amountCard}>
                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Tổng tiền:</Text>
                                <Text style={styles.amountValue}>
                                    {booking.totalAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Đã cọc:</Text>
                                <Text style={[styles.amountValue, { color: '#22c55e' }]}>
                                    -{booking.deposit.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabelHighlight}>Còn phải thu:</Text>
                                <Text style={styles.amountValueHighlight}>
                                    {remainingAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </View>

                        {/* Payment Methods */}
                        <Text style={styles.sectionTitle}>Chọn phương thức:</Text>

                        <TouchableOpacity
                            style={styles.paymentOption}
                            onPress={() => {
                                onClose();
                                onConfirm('cash');
                            }}>
                            <View style={styles.paymentOptionContent}>
                                <View style={styles.paymentIconContainer}>
                                    <Ionicons name="cash" size={28} color="#4a90e2" />
                                </View>
                                <View style={styles.paymentTextContainer}>
                                    <Text style={styles.paymentTitle}>Tiền mặt</Text>
                                    <Text style={styles.paymentDesc}>
                                        Thu tiền mặt trực tiếp
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.paymentOption}
                            onPress={() => {
                                onClose();
                                onConfirm('online');
                            }}>
                            <View style={styles.paymentOptionContent}>
                                <View style={styles.paymentIconContainer}>
                                    <Ionicons name="card" size={28} color="#4a90e2" />
                                </View>
                                <View style={styles.paymentTextContainer}>
                                    <Text style={styles.paymentTitle}>Chuyển khoản</Text>
                                    <Text style={styles.paymentDesc}>
                                        Quét mã QR PayOS
                                    </Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        {/* Info Box */}
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={16} color="#4a90e2" />
                            <Text style={styles.infoText}>
                                Sau khi thanh toán, phòng sẽ chuyển sang trạng thái CẦN DỌN DẸP
                            </Text>
                        </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
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
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalBody: {
        padding: 20,
    },
    bookingInfo: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    bookingInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    bookingInfoText: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
    amountCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    amountLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    amountValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
    },
    amountLabelHighlight: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '700',
    },
    amountValueHighlight: {
        fontSize: 20,
        color: '#4a90e2',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#bfdbfe',
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    paymentOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    paymentIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentTextContainer: {
        flex: 1,
    },
    paymentTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    paymentDesc: {
        fontSize: 13,
        color: '#64748b',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#eff6ff',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 18,
    },
});