import bookingService from '@/services/bookingService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function InvoiceScreen() {
    const navigation = useNavigation<any>();
    const params = useLocalSearchParams();
    const bookingId = params.bookingId ? parseInt(params.bookingId as string) : null;

    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (bookingId) {
            fetchBookingData();
        }
    }, [bookingId]);

    const fetchBookingData = async () => {
        try {
            setLoading(true);
            const bookingData = await bookingService.getBookingWithServices(bookingId!);
            setBooking(bookingData);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải thông tin hóa đơn');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        Alert.alert('Thông báo', 'Chức năng in hóa đơn đang được phát triển');
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Hóa đơn thanh toán</Text>
                    </View>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Đang tải hóa đơn...</Text>
                </View>
            </View>
        );
    }

    if (!booking) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Hóa đơn thanh toán</Text>
                    </View>
                </LinearGradient>
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={64} color="#cbd5e1" />
                    <Text style={styles.emptyText}>Không tìm thấy thông tin hóa đơn</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4a90e2', '#357abd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hóa đơn thanh toán</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}>
                <View style={styles.invoiceCard}>
                    {/* Header */}
                    <View style={styles.invoiceHeader}>
                        <Text style={styles.hotelName}>KHÁCH SẠN ABC</Text>
                        <Text style={styles.invoiceTitle}>HÓA ĐƠN THANH TOÁN</Text>
                        <Text style={styles.invoiceDate}>
                            Ngày: {new Date().toLocaleDateString('vi-VN')}
                        </Text>
                    </View>

                    {/* Thông tin khách hàng */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Họ tên:</Text>
                            <Text style={styles.infoValue}>{booking.customerName}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Số điện thoại:</Text>
                            <Text style={styles.infoValue}>{booking.phone}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phòng:</Text>
                            <Text style={styles.infoValue}>{booking.roomNumber}</Text>
                        </View>
                    </View>

                    {/* Thời gian lưu trú */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>THỜI GIAN LƯU TRÚ</Text>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nhận phòng:</Text>
                            <Text style={styles.infoValue}>{booking.checkIn}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Trả phòng:</Text>
                            <Text style={styles.infoValue}>{booking.checkOut}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Số đêm:</Text>
                            <Text style={styles.infoValue}>{booking.nights} đêm</Text>
                        </View>
                    </View>

                    {/* Chi tiết thanh toán */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>CHI TIẾT THANH TOÁN</Text>

                        {/* Tiền phòng */}
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Tiền phòng ({booking.nights} đêm)</Text>
                            <Text style={styles.detailAmount}>
                                {booking.roomAmount?.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>

                        {/* Dịch vụ */}
                        {booking.services && booking.services.length > 0 && (
                            <>
                                <View style={styles.serviceHeader}>
                                    <Text style={styles.detailLabel}>Dịch vụ</Text>
                                </View>
                                {booking.services.map((service: any, index: number) => (
                                    <View key={index} style={styles.serviceRow}>
                                        <Text style={styles.serviceName}>
                                            • {service.serviceName} x{service.quantity}
                                        </Text>
                                        <Text style={styles.serviceAmount}>
                                            {service.totalPrice.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                ))}
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Tổng dịch vụ</Text>
                                    <Text style={styles.detailAmount}>
                                        {booking.serviceAmount?.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            </>
                        )}

                        <View style={styles.divider} />

                        {/* Tổng cộng */}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TỔNG CỘNG</Text>
                            <Text style={styles.totalAmount}>
                                {booking.totalAmount?.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>

                        {/* Đã cọc */}
                        {booking.deposit > 0 && (
                            <View style={styles.detailRow}>
                                <Text style={styles.paidLabel}>Đã đặt cọc</Text>
                                <Text style={styles.paidAmount}>
                                    -{booking.deposit.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        )}

                        {/* Còn phải thu */}
                        <View style={styles.remainingRow}>
                            <Text style={styles.remainingLabel}>CÒN PHẢI THU</Text>
                            <Text style={styles.remainingAmount}>
                                {((booking.totalAmount || 0) - booking.deposit).toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>

                    {/* Ghi chú */}
                    {booking.notes && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>GHI CHÚ</Text>
                            <Text style={styles.notesText}>{booking.notes}</Text>
                        </View>
                    )}

                    {/* Footer */}
                    <View style={styles.invoiceFooter}>
                        <Text style={styles.thankYouText}>
                            Cảm ơn quý khách đã sử dụng dịch vụ!
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Print Button */}
            <View style={styles.printButtonContainer}>
                <TouchableOpacity
                    style={styles.printButton}
                    onPress={handlePrint}>
                    <LinearGradient
                        colors={['#4a90e2', '#357abd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.printButtonGradient}>
                        <Ionicons name="print-outline" size={20} color="#fff" />
                        <Text style={styles.printButtonText}>In hóa đơn</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    invoiceCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    invoiceHeader: {
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#e2e8f0',
        paddingBottom: 20,
        marginBottom: 20,
    },
    hotelName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    invoiceTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4a90e2',
        marginBottom: 4,
    },
    invoiceDate: {
        fontSize: 14,
        color: '#64748b',
    },
    section: {
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4a90e2',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        flex: 2,
        textAlign: 'right',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
        flex: 1,
    },
    detailAmount: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    serviceHeader: {
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        paddingLeft: 12,
    },
    serviceName: {
        fontSize: 13,
        color: '#475569',
        flex: 1,
    },
    serviceAmount: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4a90e2',
    },
    paidLabel: {
        fontSize: 14,
        color: '#22c55e',
        fontWeight: '600',
    },
    paidAmount: {
        fontSize: 15,
        fontWeight: '600',
        color: '#22c55e',
    },
    remainingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    remainingLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#92400e',
    },
    remainingAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#f59e0b',
    },
    notesText: {
        fontSize: 14,
        color: '#1e293b',
        lineHeight: 20,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
    },
    invoiceFooter: {
        alignItems: 'center',
        paddingTop: 16,
        marginTop: 16,
        borderTopWidth: 2,
        borderTopColor: '#e2e8f0',
    },
    thankYouText: {
        fontSize: 15,
        fontStyle: 'italic',
        color: '#64748b',
    },
    printButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
    },
    printButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    printButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    printButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
});