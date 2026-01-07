import bookingService, { Booking } from '@/services/bookingService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BookingsScreen() {
    const navigation = useNavigation();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getActiveBookings();
            setBookings(data);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải danh sách đặt phòng');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    // Xác nhận đặt phòng (PENDING -> CONFIRMED)
    const handleConfirmBooking = async (id: number, roomNumber: string) => {
        Alert.alert(
            'Xác nhận đặt phòng',
            `Bạn có chắc muốn xác nhận đặt phòng ${roomNumber}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            await bookingService.confirmBooking(id);
                            Alert.alert('Thành công', 'Đã xác nhận đặt phòng');
                            fetchBookings();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể xác nhận đặt phòng');
                        }
                    },
                },
            ]
        );
    };

    // Nhận phòng (CONFIRMED -> CHECKED_IN)
    const handleCheckIn = async (id: number, roomNumber: string) => {
        Alert.alert(
            'Nhận phòng',
            `Xác nhận khách đã nhận phòng ${roomNumber}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Nhận phòng',
                    onPress: async () => {
                        try {
                            await bookingService.checkIn(id);
                            Alert.alert('Thành công', 'Khách đã nhận phòng');
                            fetchBookings();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể nhận phòng');
                        }
                    },
                },
            ]
        );
    };

    // Trả phòng (CHECKED_IN -> CHECKED_OUT)
    const handleCheckOut = async (id: number, roomNumber: string) => {
        Alert.alert(
            'Xác nhận trả phòng',
            `Bạn có chắc khách đã trả phòng ${roomNumber}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Trả phòng',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.checkOut(id);
                            Alert.alert('Thành công', 'Đã trả phòng thành công');
                            fetchBookings();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể trả phòng');
                        }
                    },
                },
            ]
        );
    };

    const handleCancelBooking = async (id: number, roomNumber: string) => {
        Alert.alert(
            'Hủy đặt phòng',
            `Bạn có chắc muốn hủy đặt phòng ${roomNumber}?`,
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy đặt phòng',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.cancelBooking(id);
                            Alert.alert('Thành công', 'Đã hủy đặt phòng');
                            fetchBookings();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể hủy đặt phòng');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CHECKED_IN':
                return '#22c55e';
            case 'PENDING':
                return '#f59e0b';
            case 'CONFIRMED':
                return '#3b82f6';
            case 'CHECKED_OUT':
                return '#8b5cf6';
            case 'COMPLETED':
                return '#06b6d4';
            case 'CANCELLED':
                return '#ef4444';
            default:
                return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'CHECKED_IN':
                return 'Đang thuê';
            case 'CHECKED_OUT':
                return 'Đã trả';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
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
                            style={styles.menuButton}
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Quản lý đặt phòng</Text>
                    </View>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            </View>
        );
    }

    if (bookings.length === 0) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Quản lý đặt phòng</Text>
                    </View>
                </LinearGradient>

                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={80} color="#cbd5e1" />
                    <Text style={styles.emptyTitle}>Chưa có đặt phòng</Text>
                    <Text style={styles.emptySubtitle}>
                        Danh sách đặt phòng sẽ hiển thị ở đây
                    </Text>
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
                        style={styles.menuButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                        <Ionicons name="menu" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Quản lý đặt phòng</Text>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingHeaderText}>
                        Có {bookings.length} phòng cần xử lý
                    </Text>
                </View>

                {bookings.map((booking) => (
                    <View key={booking.id} style={styles.bookingCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.roomInfo}>
                                <View style={styles.roomNumberBadge}>
                                    <Ionicons name="bed" size={18} color="#fff" />
                                    <Text style={styles.roomNumber}>{booking.roomNumber}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.statusBadge,
                                        { backgroundColor: `${getStatusColor(booking.status)}20` },
                                    ]}>
                                    <View
                                        style={[
                                            styles.statusDot,
                                            { backgroundColor: getStatusColor(booking.status) },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.statusText,
                                            { color: getStatusColor(booking.status) },
                                        ]}>
                                        {getStatusText(booking.status)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={18} color="#64748b" />
                                <Text style={styles.infoLabel}>Khách hàng:</Text>
                                <Text style={styles.infoValue}>{booking.customerName}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={18} color="#64748b" />
                                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                                <Text style={styles.infoValue}>{booking.phone}</Text>
                            </View>

                            <View style={styles.dateContainer}>
                                <View style={styles.dateBox}>
                                    <Ionicons name="enter-outline" size={18} color="#22c55e" />
                                    <View style={styles.dateInfo}>
                                        <Text style={styles.dateLabel}>Nhận phòng</Text>
                                        <Text style={styles.dateValue}>{booking.checkIn}</Text>
                                    </View>
                                </View>

                                <Ionicons name="arrow-forward" size={20} color="#cbd5e1" />

                                <View style={styles.dateBox}>
                                    <Ionicons name="exit-outline" size={18} color="#ef4444" />
                                    <View style={styles.dateInfo}>
                                        <Text style={styles.dateLabel}>Trả phòng</Text>
                                        <Text style={styles.dateValue}>{booking.checkOut}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.priceRow}>
                                <View style={styles.nightsInfo}>
                                    <Ionicons name="moon-outline" size={16} color="#64748b" />
                                    <Text style={styles.nightsText}>{booking.nights} đêm</Text>
                                </View>
                                <Text style={styles.totalPrice}>
                                    {booking.totalAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            {/* Nút Hủy - hiện với mọi trạng thái */}
                            <TouchableOpacity
                                style={[styles.actionButton, styles.cancelButton]}
                                onPress={() =>
                                    handleCancelBooking(booking.id!, booking.roomNumber!)
                                }>
                                <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>

                            {/* Nút Xác nhận - chỉ hiện khi PENDING */}
                            {booking.status === 'PENDING' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.confirmButton]}
                                    onPress={() => handleConfirmBooking(booking.id!, booking.roomNumber!)}>
                                    <LinearGradient
                                        colors={['#3b82f6', '#2563eb']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.confirmGradient}>
                                        <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
                                        <Text style={styles.confirmButtonText}>Xác nhận</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}

                            {/* Nút Nhận phòng - chỉ hiện khi CONFIRMED */}
                            {booking.status === 'CONFIRMED' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.checkInButton]}
                                    onPress={() => handleCheckIn(booking.id!, booking.roomNumber!)}>
                                    <LinearGradient
                                        colors={['#22c55e', '#16a34a']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.checkInGradient}>
                                        <Ionicons name="enter-outline" size={20} color="#fff" />
                                        <Text style={styles.checkInButtonText}>Nhận phòng</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}

                            {/* Nút Trả phòng - chỉ hiện khi CHECKED_IN */}
                            {booking.status === 'CHECKED_IN' && (
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.checkoutButton]}
                                    onPress={() => handleCheckOut(booking.id!, booking.roomNumber!)}>
                                    <LinearGradient
                                        colors={['#4a90e2', '#357abd']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.checkoutGradient}>
                                        <Ionicons name="exit-outline" size={20} color="#fff" />
                                        <Text style={styles.checkoutButtonText}>Trả phòng</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
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
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    menuButton: {
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
    bookingHeader: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    bookingHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    bookingCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        padding: 16,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    roomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    roomNumberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4a90e2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    roomNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardBody: {
        padding: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        flex: 1,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
        marginBottom: 12,
    },
    dateBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    dateInfo: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 2,
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    nightsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nightsText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    totalPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4a90e2',
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    actionButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#ef4444',
        paddingVertical: 12,
    },
    cancelButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ef4444',
    },
    confirmButton: {
        flex: 1,
    },
    confirmGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    confirmButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    checkInButton: {
        flex: 1,
    },
    checkInGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    checkInButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    checkoutButton: {
        flex: 1,
    },
    checkoutGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    checkoutButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
});