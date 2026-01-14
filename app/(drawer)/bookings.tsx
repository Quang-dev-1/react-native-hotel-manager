import bookingService, { Booking } from '@/services/bookingService';
import roomService, { Room } from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Modal xem chi tiết booking
const BookingDetailModal = ({
    visible,
    booking,
    onClose,
    onConfirm,
    onCheckIn,
    onCheckOut,
    onCancel,
    hasActiveBookingForRoom,
}: {
    visible: boolean;
    booking: Booking | null;
    onClose: () => void;
    onConfirm: (id: number, roomNumber: string) => void;
    onCheckIn: (id: number, roomNumber: string) => void;
    onCheckOut: (id: number, roomNumber: string) => void;
    onCancel: (id: number, roomNumber: string, status: string) => void;
    hasActiveBookingForRoom: boolean;
}) => {
    if (!booking) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CHECKED_IN': return '#22c55e';
            case 'PENDING': return '#f59e0b';
            case 'CONFIRMED': return '#3b82f6';
            default: return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'CONFIRMED': return 'Chờ nhận phòng';
            case 'CHECKED_IN': return 'Đang thuê';
            default: return status;
        }
    };

    // Kiểm tra xem có thể xác nhận/nhận phòng không
    const canConfirm = booking.status === 'PENDING' && !hasActiveBookingForRoom;
    const canCheckIn = booking.status === 'CONFIRMED' && !hasActiveBookingForRoom;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.detailModalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chi tiết đặt phòng</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        <View style={styles.detailCard}>
                            <View style={styles.detailRow}>
                                <View style={styles.roomBadge}>
                                    <Ionicons name="bed" size={20} color="#fff" />
                                    <Text style={styles.roomBadgeText}>Phòng {booking.roomNumber}</Text>
                                </View>
                                <View
                                    style={[
                                        styles.detailStatusBadge,
                                        { backgroundColor: `${getStatusColor(booking.status)}20` },
                                    ]}>
                                    <Text style={[styles.detailStatusText, { color: getStatusColor(booking.status) }]}>
                                        {getStatusText(booking.status)}
                                    </Text>
                                </View>
                            </View>

                            {/* Cảnh báo nếu có booking đang active */}
                            {hasActiveBookingForRoom && booking.status !== 'CHECKED_IN' && (
                                <View style={styles.warningBox}>
                                    <Ionicons name="warning" size={20} color="#f59e0b" />
                                    <Text style={styles.warningText}>
                                        Phòng này đang có booking đang hoạt động. Phải trả phòng trước mới có thể {booking.status === 'PENDING' ? 'xác nhận' : 'nhận phòng'} booking này.
                                    </Text>
                                </View>
                            )}

                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Khách hàng</Text>
                                <View style={styles.detailValueRow}>
                                    <Ionicons name="person-outline" size={18} color="#4a90e2" />
                                    <Text style={styles.detailValue}>{booking.customerName}</Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Số điện thoại</Text>
                                <View style={styles.detailValueRow}>
                                    <Ionicons name="call-outline" size={18} color="#4a90e2" />
                                    <Text style={styles.detailValue}>{booking.phone}</Text>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Thời gian</Text>
                                <View style={styles.dateDetailContainer}>
                                    <View style={styles.dateDetailBox}>
                                        <Ionicons name="enter-outline" size={18} color="#22c55e" />
                                        <View>
                                            <Text style={styles.dateDetailLabel}>Nhận phòng</Text>
                                            <Text style={styles.dateDetailValue}>{booking.checkIn}</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="arrow-forward" size={20} color="#cbd5e1" />
                                    <View style={styles.dateDetailBox}>
                                        <Ionicons name="exit-outline" size={18} color="#ef4444" />
                                        <View>
                                            <Text style={styles.dateDetailLabel}>Trả phòng</Text>
                                            <Text style={styles.dateDetailValue}>{booking.checkOut}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.detailSection}>
                                <Text style={styles.detailLabel}>Chi phí</Text>
                                <View style={styles.priceDetailRow}>
                                    <View style={styles.nightsDetail}>
                                        <Ionicons name="moon-outline" size={16} color="#64748b" />
                                        <Text style={styles.nightsDetailText}>{booking.nights} đêm</Text>
                                    </View>
                                    <Text style={styles.totalPriceDetail}>
                                        {booking.totalAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                                <View style={styles.depositRow}>
                                    <Text style={styles.depositLabel}>Đã đặt cọc:</Text>
                                    <Text style={styles.depositValue}>
                                        {booking.deposit.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            </View>

                            {booking.notes && (
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>Ghi chú</Text>
                                    <Text style={styles.notesText}>{booking.notes}</Text>
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        {booking.status === 'PENDING' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={() => {
                                        onClose();
                                        onCancel(booking.id!, booking.roomNumber!, booking.status);
                                    }}>
                                    <Text style={styles.cancelModalButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.confirmModalButton,
                                        !canConfirm && styles.disabledButton
                                    ]}
                                    onPress={() => {
                                        if (canConfirm) {
                                            onClose();
                                            onConfirm(booking.id!, booking.roomNumber!);
                                        } else {
                                            Alert.alert(
                                                'Không thể xác nhận',
                                                'Phòng này đang có booking đang hoạt động. Vui lòng trả phòng trước.'
                                            );
                                        }
                                    }}
                                    disabled={!canConfirm}>
                                    <LinearGradient
                                        colors={canConfirm ? ['#3b82f6', '#2563eb'] : ['#94a3b8', '#64748b']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.modalButtonGradient}>
                                        <Text style={styles.confirmModalButtonText}>Xác nhận</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {booking.status === 'CONFIRMED' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelModalButton]}
                                    onPress={() => {
                                        onClose();
                                        onCancel(booking.id!, booking.roomNumber!, booking.status);
                                    }}>
                                    <Text style={styles.cancelModalButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.checkInModalButton,
                                        !canCheckIn && styles.disabledButton
                                    ]}
                                    onPress={() => {
                                        if (canCheckIn) {
                                            onClose();
                                            onCheckIn(booking.id!, booking.roomNumber!);
                                        } else {
                                            Alert.alert(
                                                'Không thể nhận phòng',
                                                'Phòng này đang có booking đang hoạt động. Vui lòng trả phòng trước.'
                                            );
                                        }
                                    }}
                                    disabled={!canCheckIn}>
                                    <LinearGradient
                                        colors={canCheckIn ? ['#22c55e', '#16a34a'] : ['#94a3b8', '#64748b']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.modalButtonGradient}>
                                        <Text style={styles.confirmModalButtonText}>Nhận phòng</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {booking.status === 'CHECKED_IN' && (
                            <TouchableOpacity
                                style={[styles.modalButton, styles.checkOutModalButton]}
                                onPress={() => {
                                    onClose();
                                    onCheckOut(booking.id!, booking.roomNumber!);
                                }}>
                                <LinearGradient
                                    colors={['#8b5cf6', '#7c3aed']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.modalButtonGradient}>
                                    <Text style={styles.confirmModalButtonText}>Trả phòng</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function BookingsScreen() {
    const navigation = useNavigation<any>();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const getDaysFromTodayToEndOfMonth = () => {
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const year = today.getFullYear();
        const month = today.getMonth();
        const lastDayOfMonth = new Date(year, month + 1, 0);
        lastDayOfMonth.setHours(0, 0, 0, 0);
        let currentDate = new Date(today);

        while (currentDate <= lastDayOfMonth) {
            days.push({
                date: currentDate.toLocaleDateString('en-CA'),
                display: `${currentDate.getDate()}/${currentDate.getMonth() + 1}`,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return days;
    };

    const [dates] = useState(getDaysFromTodayToEndOfMonth());

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsData, bookingsData] = await Promise.all([
                roomService.getRooms(),
                bookingService.getActiveBookings(),
            ]);
            setRooms(roomsData);
            setBookings(bookingsData);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const getBookingsForRoomAndDate = (roomId: number, date: string): Booking[] => {
        return bookings.filter((booking) => {
            if (booking.roomId !== roomId) return false;
            const checkIn = new Date(booking.checkIn);
            const checkOut = new Date(booking.checkOut);
            const targetDate = new Date(date);
            return targetDate >= checkIn && targetDate < checkOut;
        });
    };

    // Kiểm tra xem phòng có booking nào đang CHECKED_IN không
    const hasActiveCheckedInBooking = (roomId: number): boolean => {
        return bookings.some(
            booking => booking.roomId === roomId && booking.status === 'CHECKED_IN'
        );
    };

    const handleCellPress = (room: Room, date: string) => {
        const roomBookings = getBookingsForRoomAndDate(room.id!, date);

        if (roomBookings.length > 0) {
            // Nếu có nhiều booking, hiển thị booking đầu tiên (hoặc có thể cho chọn)
            setSelectedBooking(roomBookings[0]);
            setShowDetailModal(true);
        } else {
            navigation.navigate('BookingFormScreen', {
                room,
                preselectedCheckIn: date,
            });
        }
    };

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
                            Alert.alert('Thành công', 'Đã đặt phòng thành công', [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        fetchData();

                                    }
                                }
                            ]);
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể xác nhận đặt phòng');
                        }
                    },
                },
            ]
        );
    };

    const handleCheckIn = async (id: number, roomNumber: string) => {
        Alert.alert('Nhận phòng', `Xác nhận khách đã nhận phòng ${roomNumber}?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Nhận phòng',
                onPress: async () => {
                    try {
                        await bookingService.checkIn(id);
                        Alert.alert('Thành công', `Khách đã nhận phòng ${roomNumber}`);
                        fetchData();
                    } catch (error: any) {
                        Alert.alert('Lỗi', error.message || 'Không thể nhận phòng');
                    }
                },
            },
        ]);
    };

    const handleCheckOut = async (id: number, roomNumber: string) => {
        Alert.alert('Xác nhận trả phòng', `Bạn có chắc khách đã trả phòng ${roomNumber}?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Trả phòng',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await bookingService.checkOut(id);

                        Alert.alert('Thành công', 'Đã trả phòng thành công', [
                            {
                                text: 'OK',
                                onPress: () => {
                                    fetchData();

                                }
                            }
                        ]);
                    } catch (error: any) {
                        Alert.alert('Lỗi', error.message || 'Không thể trả phòng');
                    }
                },
            },
        ]);
    };

    const handleCancelBooking = async (id: number, roomNumber: string, currentStatus: string) => {
        Alert.alert('Hủy đặt phòng', `Bạn có chắc muốn hủy đặt phòng ${roomNumber}?`, [
            { text: 'Không', style: 'cancel' },
            {
                text: 'Hủy đặt phòng',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await bookingService.cancelBooking(id);
                        Alert.alert('Thành công', 'Đã hủy đặt phòng');
                        fetchData();
                    } catch (error: any) {
                        Alert.alert('Lỗi', error.message || 'Không thể hủy đặt phòng');
                    }
                },
            },
        ]);
    };

    const getBookingColor = (booking: Booking) => {
        switch (booking.status) {
            case 'PENDING': return '#fef3c7';
            case 'CONFIRMED': return '#dbeafe';
            case 'CHECKED_IN': return '#dcfce7';
            default: return '#f1f5f9';
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
                        <Text style={styles.headerTitle}>Lịch đặt phòng</Text>
                    </View>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
                    <Text style={styles.headerTitle}>Lịch đặt phòng</Text>
                </View>
            </LinearGradient>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.calendarContainer}>
                    <View style={styles.mainGrid}>
                        <View style={styles.fixedColumn}>
                            <View style={styles.roomColumnHeader}>
                                <Ionicons name="bed-outline" size={20} color="#64748b" />
                                <Text style={styles.roomHeaderText}>Phòng</Text>
                            </View>
                            <View>
                                {rooms.map((room) => (
                                    <View key={room.id} style={styles.roomInfoCell}>
                                        <Text style={styles.roomNumberText}>{room.roomNumber}</Text>
                                        <Text style={styles.roomTypeSmall} numberOfLines={1}>{room.roomTypeName}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false}>
                            <View>
                                <View style={styles.calendarHeader}>
                                    {dates.map((day) => (
                                        <View key={day.date} style={styles.dateColumn}>
                                            <Text style={styles.dateText}>{day.display}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View>
                                    {rooms.map((room) => (
                                        <View key={room.id} style={styles.roomRow}>
                                            {dates.map((day, index) => {
                                                const roomBookings = getBookingsForRoomAndDate(room.id!, day.date);
                                                const primaryBooking = roomBookings.find(b => b.status === 'CHECKED_IN') || roomBookings[0];

                                                const nextDay = dates[index + 1];
                                                const isContinuous = nextDay && primaryBooking &&
                                                    getBookingsForRoomAndDate(room.id!, nextDay.date).some(b => b.id === primaryBooking.id);

                                                return (
                                                    <TouchableOpacity
                                                        key={day.date}
                                                        style={[
                                                            styles.dateCell,
                                                            primaryBooking && {
                                                                backgroundColor: getBookingColor(primaryBooking),
                                                                borderRightWidth: isContinuous ? 0 : 1,
                                                                marginRight: isContinuous ? -0.5 : 0,
                                                            },
                                                        ]}
                                                        onPress={() => handleCellPress(room, day.date)}
                                                    >
                                                        {primaryBooking && (!dates[index - 1] || !getBookingsForRoomAndDate(room.id!, dates[index - 1]?.date).some(b => b.id === primaryBooking.id)) ? (
                                                            <View style={styles.bookingIndicatorWrapper}>
                                                                <Ionicons name="person" size={12} color="#1e293b" opacity={0.5} />
                                                                {roomBookings.length > 1 && (
                                                                    <View style={styles.multiBookingBadge}>
                                                                        <Text style={styles.multiBookingText}>{roomBookings.length}</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        ) : null}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </View>

                    <View style={styles.legend}>
                        <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#fef3c7' }]} /><Text style={styles.legendText}>Chờ</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#dbeafe' }]} /><Text style={styles.legendText}>Xác nhận</Text></View>
                        <View style={styles.legendItem}><View style={[styles.legendBox, { backgroundColor: '#dcfce7' }]} /><Text style={styles.legendText}>Đang ở</Text></View>
                    </View>
                </View>
            </ScrollView>

            <BookingDetailModal
                visible={showDetailModal}
                booking={selectedBooking}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedBooking(null);
                }}
                onConfirm={handleConfirmBooking}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancelBooking}
                hasActiveBookingForRoom={selectedBooking ? hasActiveCheckedInBooking(selectedBooking.roomId) : false}
            />
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
    calendarContainer: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 10,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    mainGrid: {
        flexDirection: 'row',
        flex: 1,
    },
    fixedColumn: {
        width: 85,
        backgroundColor: '#f8fafc',
        borderRightWidth: 2,
        borderRightColor: '#cbd5e1',
        zIndex: 10,
    },
    roomColumnHeader: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#f1f5f9',
    },
    roomHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#64748b',
    },
    roomInfoCell: {
        height: 60,
        justifyContent: 'center',
        paddingLeft: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    roomNumberText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    roomTypeSmall: {
        fontSize: 10,
        color: '#94a3b8',
    },
    calendarHeader: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    dateColumn: {
        width: 65,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    roomRow: {
        flexDirection: 'row',
        height: 60,
    },
    dateCell: {
        width: 65,
        height: 60,
        borderRightWidth: 1,
        borderRightColor: '#f1f5f9',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookingIndicatorWrapper: {
        position: 'relative',
    },
    multiBookingBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    multiBookingText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    legend: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        backgroundColor: '#fff',
        justifyContent: 'space-around',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendBox: {
        width: 14,
        height: 14,
        borderRadius: 3,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#64748b',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    detailModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '90%',
        maxWidth: 500,
        maxHeight: '80%',
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
    detailCard: {
        gap: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    roomBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#4a90e2',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    roomBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    detailStatusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    detailStatusText: {
        fontSize: 13,
        fontWeight: '600',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: '#f59e0b',
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: '#92400e',
        lineHeight: 18,
    },
    detailSection: {
        gap: 8,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        textTransform: 'uppercase',
    },
    detailValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    dateDetailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
    },
    dateDetailBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    dateDetailLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    dateDetailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    priceDetailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
    },
    nightsDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nightsDetailText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    totalPriceDetail: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4a90e2',
    },
    depositRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 4,
    },
    depositLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    depositValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#22c55e',
    },
    notesText: {
        fontSize: 14,
        color: '#1e293b',
        lineHeight: 20,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cancelModalButton: {
        borderWidth: 2,
        borderColor: '#ef4444',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelModalButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#ef4444',
    },
    confirmModalButton: {
        flex: 1,
    },
    checkInModalButton: {
        flex: 1,
    },
    checkOutModalButton: {
        flex: 1,
    },
    disabledButton: {
        opacity: 0.6,
    },
    modalButtonGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmModalButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});