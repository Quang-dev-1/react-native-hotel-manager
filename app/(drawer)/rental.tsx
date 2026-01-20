import EditBookingModal, { UpdateBookingData } from '@/components/EditBookingModal';
import bookingService, { Booking } from '@/services/bookingService';
import financeService from '@/services/financeService';
import historyService from '@/services/historyService';
import hotelServiceAPI, { HotelService } from '@/services/hotelService';
import roomService, { Room } from '@/services/roomService';
import { styles } from '@/styles/rental.styles';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const ServiceModal = ({
    visible,
    booking,
    onClose,
    onAddService,
}: {
    visible: boolean;
    booking: Booking | null;
    onClose: () => void;
    onAddService: (bookingId: number, serviceId: number, quantity: number) => void;
}) => {
    const [services, setServices] = useState<HotelService[]>([]);
    const [selectedService, setSelectedService] = useState<HotelService | null>(null);
    const [quantity, setQuantity] = useState('1');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (visible && booking) {
            fetchServices();
        } else if (!visible) {
            // Reset khi đóng modal
            setSelectedService(null);
            setQuantity('1');
        }
    }, [visible, booking]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const data = await hotelServiceAPI.getAvailableServices();
            setServices(data);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải danh sách dịch vụ');
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = () => {
        if (!booking?.id) {
            Alert.alert('Lỗi', 'Thông tin booking không hợp lệ');
            onClose();
            return;
        }

        if (!selectedService?.id) {
            Alert.alert('Lỗi', 'Vui lòng chọn dịch vụ');
            return;
        }

        const quantityNum = parseInt(quantity);
        if (isNaN(quantityNum) || quantityNum <= 0) {
            Alert.alert('Lỗi', 'Số lượng không hợp lệ');
            return;
        }

        console.log('📝 Submitting service:', { bookingId: booking.id, serviceId: selectedService.id, quantity: quantityNum });
        onAddService(booking.id, selectedService.id, quantityNum);
        onClose();
    };

    if (!booking) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.serviceModalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm dịch vụ</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollView}>
                        <View style={styles.modalBody}>
                            <View style={styles.bookingInfoBox}>
                                <Ionicons name="bed" size={20} color="#4a90e2" />
                                <View style={styles.bookingInfoBoxText}>
                                    <Text style={styles.bookingInfoBoxTitle}>
                                        Phòng {booking.roomNumber}
                                    </Text>
                                    <Text style={styles.bookingInfoBoxSubtitle}>
                                        {booking.customerName}
                                    </Text>
                                </View>
                            </View>

                            <Text style={styles.sectionTitle}>Chọn dịch vụ:</Text>

                            {loading ? (
                                <ActivityIndicator size="small" color="#4a90e2" />
                            ) : services.length === 0 ? (
                                <Text style={styles.emptyText}>Không có dịch vụ khả dụng</Text>
                            ) : (
                                services.map(service => (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={[
                                            styles.serviceOption,
                                            selectedService?.id === service.id && styles.serviceOptionSelected,
                                        ]}
                                        onPress={() => setSelectedService(service)}>
                                        <View style={styles.serviceOptionLeft}>
                                            <Ionicons
                                                name="cube-outline"
                                                size={20}
                                                color={selectedService?.id === service.id ? '#4a90e2' : '#64748b'}
                                            />
                                            <View style={styles.serviceOptionInfo}>
                                                <Text style={styles.serviceOptionName}>{service.name}</Text>
                                                {service.description && (
                                                    <Text style={styles.serviceOptionDesc}>
                                                        {service.description}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <Text style={styles.serviceOptionPrice}>
                                            {service.price.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}

                            {selectedService && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Số lượng</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Nhập số lượng"
                                        value={quantity}
                                        onChangeText={setQuantity}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !selectedService && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedService}>
                            <LinearGradient
                                colors={selectedService ? ['#4a90e2', '#357abd'] : ['#94a3b8', '#64748b']}
                                style={styles.submitButtonGradient}>
                                <Text style={styles.submitButtonText}>Thêm</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const ChangeRoomModal = ({
    visible,
    booking,
    rooms,
    onClose,
    onChangeRoom,
}: {
    visible: boolean;
    booking: Booking | null;
    rooms: Room[];
    onClose: () => void;
    onChangeRoom: (bookingId: number, newRoomId: number) => void;
}) => {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    useEffect(() => {
        if (!visible) {
            setSelectedRoom(null);
        }
    }, [visible]);

    const availableRooms = rooms.filter(
        r => r.status === 'AVAILABLE' && r.id !== booking?.roomId
    );

    const handleSubmit = () => {
        if (!booking?.id) {
            Alert.alert('Lỗi', 'Thông tin booking không hợp lệ');
            onClose();
            return;
        }

        if (!selectedRoom?.id) {
            Alert.alert('Lỗi', 'Vui lòng chọn phòng');
            return;
        }

        onChangeRoom(booking.id, selectedRoom.id);
        onClose();
    };

    if (!booking) return null;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.changeRoomModalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Đổi phòng</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalScrollView}>
                        <View style={styles.modalBody}>
                            <View style={styles.currentRoomInfo}>
                                <Text style={styles.currentRoomLabel}>Phòng hiện tại:</Text>
                                <Text style={styles.currentRoomValue}>
                                    Phòng {booking.roomNumber}
                                </Text>
                            </View>

                            <Text style={styles.sectionTitle}>Chọn phòng mới:</Text>

                            {availableRooms.length === 0 ? (
                                <Text style={styles.emptyText}>Không có phòng trống</Text>
                            ) : (
                                availableRooms.map(room => (
                                    <TouchableOpacity
                                        key={room.id}
                                        style={[
                                            styles.roomOption,
                                            selectedRoom?.id === room.id && styles.roomOptionSelected,
                                        ]}
                                        onPress={() => setSelectedRoom(room)}>
                                        <View style={styles.roomOptionLeft}>
                                            <Ionicons name="bed" size={20} color="#4a90e2" />
                                            <View>
                                                <Text style={styles.roomOptionNumber}>
                                                    Phòng {room.roomNumber}
                                                </Text>
                                                <Text style={styles.roomOptionType}>
                                                    {room.roomTypeName} - Tầng {room.floor}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.roomOptionPrice}>
                                            {room.price.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </View>
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                !selectedRoom && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedRoom}>
                            <LinearGradient
                                colors={
                                    selectedRoom
                                        ? ['#4a90e2', '#357abd']
                                        : ['#94a3b8', '#64748b']
                                }
                                style={styles.submitButtonGradient}>
                                <Text style={styles.submitButtonText}>Đổi phòng</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const BookingMenuModal = ({
    visible,
    booking,
    onClose,
    onEdit,
    onConfirm,
    onAddService,
    onCheckOut,
    onChangeRoom,
    onCleanRoom,
    onDelete,
}: {
    visible: boolean;
    booking: Booking | null;
    onClose: () => void;
    onEdit: () => void;
    onConfirm: () => void;
    onAddService: () => void;
    onCheckOut: () => void;
    onChangeRoom: () => void;
    onCleanRoom: () => void;
    onDelete: () => void;
}) => {
    const isCheckedIn = booking?.status === 'CHECKED_IN';
    const isPending = booking?.status === 'PENDING';
    const isConfirmed = booking?.status === 'CONFIRMED';

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={styles.menuModalOverlay}
                activeOpacity={1}
                onPress={onClose}>
                <View style={styles.menuModalContainer}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            onClose();
                            onEdit();
                        }}>
                        <Ionicons name="create-outline" size={20} color="#64748b" />
                        <Text style={styles.menuItemText}>Chỉnh sửa</Text>
                    </TouchableOpacity>

                    {(isPending || isConfirmed) && (
                        <>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    onChangeRoom();
                                }}>
                                <Ionicons name="swap-horizontal-outline" size={20} color="#64748b" />
                                <Text style={styles.menuItemText}>Đổi phòng</Text>
                            </TouchableOpacity>

                            {isPending && (
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => {
                                        onClose();
                                        onConfirm();
                                    }}>
                                    <Ionicons name="checkmark-circle-outline" size={20} color="#22c55e" />
                                    <Text style={[styles.menuItemText, { color: '#22c55e' }]}>Xác nhận booking</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}

                    {isCheckedIn && (
                        <>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    onAddService();
                                }}>
                                <Ionicons name="add-circle-outline" size={20} color="#64748b" />
                                <Text style={styles.menuItemText}>Thêm dịch vụ</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    onCheckOut();
                                }}>
                                <Ionicons name="log-out-outline" size={20} color="#64748b" />
                                <Text style={styles.menuItemText}>Trả phòng</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={styles.menuDivider} />

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                            onClose();
                            onDelete();
                        }}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

export default function RentalScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<
        'all' | 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT'
    >('all');
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [bookingsWithServices, setBookingsWithServices] = useState<{ [key: number]: any }>({});


    const { filter } = (route.params as { filter?: string }) || {};

    useFocusEffect(
        useCallback(() => {
            const params = route.params as { filter?: string };
            if (params?.filter) {
                console.log('🔵 Received filter from Dashboard:', params.filter);

                const filterValue = params.filter;

                if (['all', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(filterValue)) {
                    setSelectedStatus(filterValue as any);
                    console.log('✅ Set selectedStatus to:', filterValue);
                } else {
                    setSelectedStatus('all');
                    console.log('⚠️ Invalid filter, set to all');
                }
            }
        }, [route.params])
    );

    const fetchBookingServices = async (bookingId: number) => {
        try {
            const bookingDetail = await bookingService.getBookingWithServices(bookingId);
            setBookingsWithServices(prev => ({
                ...prev,
                [bookingId]: bookingDetail
            }));
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [roomsData, bookingsData] = await Promise.all([
                roomService.getRooms(),
                bookingService.getAllBookings(),
            ]);
            setRooms(roomsData);
            const activeBookings = bookingsData.filter(
                b => ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(b.status)
            );
            setBookings(activeBookings);
            const checkedInBookings = activeBookings.filter(b => b.status === 'CHECKED_IN');
            for (const booking of checkedInBookings) {
                if (booking.id) {
                    await fetchBookingServices(booking.id);
                }
            }
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

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.phone.includes(searchQuery);
        const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const statusFilters = [
        { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
        { key: 'PENDING', label: 'Phòng chờ', icon: 'time-outline' },
        { key: 'CONFIRMED', label: 'Đã xác nhận', icon: 'checkmark-circle-outline' },
        { key: 'CHECKED_IN', label: 'Đang thuê', icon: 'person-outline' },
        { key: 'CHECKED_OUT', label: 'Cần dọn', icon: 'brush-outline' },
    ];

    const handleConfirmBooking = async (booking: Booking) => {
        if (!booking?.id) return;

        Alert.alert(
            'Xác nhận booking',
            `Xác nhận booking của ${booking.customerName} cho phòng ${booking.roomNumber}?\n\nBooking sẽ chuyển từ "Phòng chờ" sang "Đã xác nhận".`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            await bookingService.confirmBooking(booking.id!);
                            Alert.alert('Thành công', 'Đã xác nhận booking');
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleEditBooking = async (bookingId: number, data: UpdateBookingData) => {
        try {
            await bookingService.updateBooking(bookingId, data);
            Alert.alert('Thành công', 'Đã cập nhật thông tin booking');
            fetchData();
            setShowEditModal(false);
            setSelectedBooking(null);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật booking');
        }
    };

    const handleCheckIn = async (booking: Booking) => {
        if (!booking?.id) return;

        Alert.alert(
            'Nhận phòng',
            `Xác nhận khách ${booking.customerName} đã nhận phòng ${booking.roomNumber}?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Nhận phòng',
                    onPress: async () => {
                        try {
                            await bookingService.checkIn(booking.id!);
                            Alert.alert('Thành công', 'Đã nhận phòng thành công');
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleCheckOut = async (booking: Booking) => {
        if (!booking?.id || !booking.roomId) return;

        Alert.alert(
            'Trả phòng',
            `Xác nhận khách ${booking.customerName} đã trả phòng ${booking.roomNumber}?\n\nSau khi trả phòng, phòng sẽ chuyển sang trạng thái CẦN DỌN DẸP và thông tin sẽ được lưu vào lịch sử.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Trả phòng',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const bookingWithServices = await bookingService.getBookingWithServices(booking.id!);

                            await bookingService.checkOut(booking.id!);

                            const room = rooms.find(r => r.id === booking.roomId);
                            if (room?.id) {
                                await roomService.updateRoomStatus(room.id, 'CLEANING');
                            }
                            const remainingAmount = bookingWithServices.totalAmount - booking.deposit;

                            if (remainingAmount > 0) {
                                await financeService.createTransaction({
                                    type: 'INCOME',
                                    category: 'room_rental',
                                    amount: remainingAmount,
                                    description: `Thu tiền phòng ${booking.roomNumber} - ${booking.customerName}`,
                                    transactionDate: new Date().toISOString().split('T')[0],
                                    paymentMethod: 'CASH',
                                    bookingId: booking.id
                                });
                            }

                            if (booking.deposit > 0) {
                                await financeService.createTransaction({
                                    type: 'INCOME',
                                    category: 'room_rental',
                                    amount: booking.deposit,
                                    description: `Tiền cọc phòng ${booking.roomNumber} - ${booking.customerName}`,
                                    transactionDate: booking.checkIn,
                                    paymentMethod: 'TRANSFER',
                                    bookingId: booking.id
                                });
                            }

                            const historyData = {
                                bookingId: booking.id!,
                                roomNumber: booking.roomNumber || '',
                                customerName: booking.customerName,
                                phone: booking.phone,
                                checkIn: booking.checkIn,
                                checkOut: booking.checkOut,
                                actualCheckOut: new Date().toISOString().split('T')[0],
                                nights: booking.nights,
                                roomAmount: bookingWithServices.roomAmount,
                                serviceAmount: bookingWithServices.serviceAmount,
                                totalAmount: bookingWithServices.totalAmount,
                                deposit: booking.deposit,
                                notes: booking.notes,
                            };

                            await historyService.createHistory(historyData);

                            Alert.alert(
                                'Thành công',
                                'Đã trả phòng, chuyển phòng sang trạng thái CẦN DỌN DẸP và lưu vào lịch sử'
                            );
                            fetchData();
                        } catch (error: any) {
                            console.error('❌ Checkout error:', error);
                            Alert.alert('Lỗi', error.message || 'Không thể trả phòng');
                        }
                    },
                },
            ]
        );
    };

    const handleCleanRoom = async (booking: Booking) => {
        if (!booking?.id || !booking.roomId) return;

        const room = rooms.find(r => r.id === booking.roomId);
        if (!room?.id) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin phòng');
            return;
        }

        Alert.alert(
            'Hoàn tất dọn phòng',
            `Xác nhận đã dọn dẹp xong phòng ${booking.roomNumber}?\n\nPhòng sẽ chuyển sang trạng thái TRỐNG và sẵn sàng cho khách mới.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Hoàn tất',
                    onPress: async () => {
                        try {
                            await roomService.updateRoomStatus(room.id!, 'AVAILABLE');
                            await bookingService.completeBooking(booking.id!);

                            Alert.alert('Thành công', 'Đã hoàn tất dọn phòng. Phòng sẵn sàng cho khách mới.');
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleCancelBooking = async (booking: Booking) => {
        if (!booking?.id) return;

        Alert.alert(
            'Hủy đặt phòng',
            `Bạn có chắc muốn hủy đặt phòng của ${booking.customerName}?\n\nHành động này không thể hoàn tác.`,
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy đặt phòng',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await bookingService.cancelBooking(booking.id!);
                            Alert.alert('Thành công', 'Đã hủy đặt phòng');
                            fetchData();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message);
                        }
                    },
                },
            ]
        );
    };

    const handleAddService = async (bookingId: number, serviceId: number, quantity: number) => {
        try {
            console.log('🔵 handleAddService called with:', { bookingId, serviceId, quantity });
            await hotelServiceAPI.addServiceToBooking(bookingId, serviceId, quantity);
            Alert.alert('Thành công', 'Đã thêm dịch vụ vào booking');
            await fetchBookingServices(bookingId);
            fetchData();
            setShowServiceModal(false);
            setSelectedBooking(null);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể thêm dịch vụ');
        }
    };

    const handleChangeRoom = async (bookingId: number, newRoomId: number) => {
        const currentBooking = bookings.find(b => b.id === bookingId);
        const newRoom = rooms.find(r => r.id === newRoomId);

        if (!currentBooking || !newRoom) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin phòng');
            return;
        }

        Alert.alert(
            'Xác nhận đổi phòng',
            `Đổi từ phòng ${currentBooking.roomNumber} sang phòng ${newRoom.roomNumber}?\n\nPhòng cũ sẽ chuyển về trạng thái TRỐNG, phòng mới sẽ cập nhật theo trạng thái booking.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đổi phòng',
                    onPress: async () => {
                        try {
                            await bookingService.changeRoom(bookingId, newRoomId);
                            Alert.alert('Thành công', `Đã đổi sang phòng ${newRoom.roomNumber}`);
                            fetchData();

                            setShowChangeRoomModal(false);
                            setSelectedBooking(null);
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể đổi phòng');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { bg: '#fef3c7', text: '#92400e', icon: 'time' };
            case 'CONFIRMED':
                return { bg: '#dbeafe', text: '#1e40af', icon: 'checkmark-circle' };
            case 'CHECKED_IN':
                return { bg: '#dcfce7', text: '#166534', icon: 'person' };
            case 'CHECKED_OUT':
                return { bg: '#fce7f3', text: '#9f1239', icon: 'brush' };
            default:
                return { bg: '#f1f5f9', text: '#64748b', icon: 'help-circle' };
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'Phòng chờ';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'CHECKED_IN':
                return 'Đang thuê';
            case 'CHECKED_OUT':
                return 'Cần dọn dẹp';
            default:
                return status;
        }
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        checkedIn: bookings.filter(b => b.status === 'CHECKED_IN').length,
        checkedOut: bookings.filter(b => b.status === 'CHECKED_OUT').length,
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
                        <Text style={styles.headerTitle}>Phòng đang thuê</Text>
                        <TouchableOpacity
                            style={styles.historyButton}
                            onPress={() => navigation.navigate('RecentHistory')}>
                            <Ionicons name="time-outline" size={24} color="#fff" />
                        </TouchableOpacity>
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
                    <Text style={styles.headerTitle}>Phòng đang thuê</Text>
                    <TouchableOpacity
                        style={styles.historyButton}
                        onPress={() => navigation.navigate('RecentHistory')}>
                        <Ionicons name="time-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm theo phòng, khách hàng, SĐT..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersScroll}
                    contentContainerStyle={styles.filtersContent}>
                    {statusFilters.map(filterItem => (
                        <TouchableOpacity
                            key={filterItem.key}
                            style={[
                                styles.filterChip,
                                selectedStatus === filterItem.key && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedStatus(filterItem.key as any)}>
                            <Ionicons
                                name={filterItem.icon as any}
                                size={18}
                                color={selectedStatus === filterItem.key ? '#fff' : '#64748b'}
                            />
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedStatus === filterItem.key && styles.filterTextActive,
                                ]}>
                                {filterItem.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.bookingsContent}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Tổng</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Chờ</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#3b82f6' }]}>
                            {stats.confirmed}
                        </Text>
                        <Text style={styles.statLabel}>Xác nhận</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#22c55e' }]}>
                            {stats.checkedIn}
                        </Text>
                        <Text style={styles.statLabel}>Đang ở</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#ec4899' }]}>
                            {stats.checkedOut}
                        </Text>
                        <Text style={styles.statLabel}>Cần dọn</Text>
                    </View>
                </View>

                <View style={styles.bookingHeader}>
                    <Text style={styles.bookingHeaderText}>
                        {filteredBookings.length} booking
                    </Text>
                </View>

                {filteredBookings.map(booking => {
                    const statusColor = getStatusColor(booking.status);

                    return (
                        <View key={booking.id} style={styles.bookingCard}>
                            <View style={styles.bookingCardHeader}>
                                <View style={styles.bookingCardLeft}>
                                    <View style={styles.roomBadge}>
                                        <Ionicons name="bed" size={18} color="#4a90e2" />
                                        <Text style={styles.roomBadgeText}>
                                            Phòng {booking.roomNumber}
                                        </Text>
                                    </View>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: statusColor.bg },
                                        ]}>
                                        <Ionicons
                                            name={statusColor.icon as any}
                                            size={12}
                                            color={statusColor.text}
                                        />
                                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                                            {getStatusLabel(booking.status)}
                                        </Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    style={styles.moreButton}
                                    onPress={() => {
                                        setSelectedBooking(booking);
                                        setShowMenuModal(true);
                                    }}>
                                    <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.bookingCardBody}>
                                <View style={styles.bookingInfo}>
                                    <Ionicons name="person-outline" size={16} color="#64748b" />
                                    <Text style={styles.bookingInfoText}>{booking.customerName}</Text>
                                </View>
                                <View style={styles.bookingInfo}>
                                    <Ionicons name="call-outline" size={16} color="#64748b" />
                                    <Text style={styles.bookingInfoText}>{booking.phone}</Text>
                                </View>
                                <View style={styles.bookingInfo}>
                                    <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                    <Text style={styles.bookingInfoText}>
                                        {booking.checkIn} → {booking.checkOut}
                                    </Text>
                                </View>
                                {booking.status === 'CHECKED_IN' && bookingsWithServices[booking.id!] && (
                                    <>
                                        {bookingsWithServices[booking.id!].services &&
                                            bookingsWithServices[booking.id!].services.length > 0 && (
                                                <View style={styles.servicesSection}>
                                                    <View style={styles.servicesSectionHeader}>
                                                        <Ionicons name="cube-outline" size={14} color="#4a90e2" />
                                                        <Text style={styles.servicesSectionTitle}>Dịch vụ:</Text>
                                                    </View>
                                                    {bookingsWithServices[booking.id!].services.map((service: any, index: number) => (
                                                        <View key={index} style={styles.serviceItem}>
                                                            <Text style={styles.serviceItemName}>
                                                                • {service.serviceName} x{service.quantity}
                                                            </Text>
                                                            <Text style={styles.serviceItemPrice}>
                                                                {service.totalPrice.toLocaleString('vi-VN')}đ
                                                            </Text>
                                                        </View>
                                                    ))}
                                                    <View style={styles.serviceTotalRow}>
                                                        <Text style={styles.serviceTotalLabel}>Tổng DV:</Text>
                                                        <Text style={styles.serviceTotalValue}>
                                                            {bookingsWithServices[booking.id!].serviceAmount.toLocaleString('vi-VN')}đ
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}
                                    </>
                                )}
                                <View style={styles.bookingInfo}>
                                    <Ionicons name="cash-outline" size={16} color="#4a90e2" />
                                    <Text style={styles.bookingPrice}>
                                        Tổng: {booking.totalAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                                {booking.deposit > 0 && (
                                    <View style={styles.bookingInfo}>
                                        <Ionicons name="wallet-outline" size={16} color="#22c55e" />
                                        <Text style={[styles.bookingInfoText, { color: '#22c55e', fontWeight: '600' }]}>
                                            Đã cọc: {booking.deposit.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                )}
                                {booking.deposit > 0 && (
                                    <View style={styles.bookingInfo}>
                                        <Ionicons name="card-outline" size={16} color="#ef4444" />
                                        <Text style={[styles.bookingInfoText, { color: '#ef4444', fontWeight: '600' }]}>
                                            Còn thu: {(booking.totalAmount - booking.deposit).toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {booking.status === 'PENDING' && (
                                <View style={styles.bookingCardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.actionButtonDanger]}
                                        onPress={() => handleCancelBooking(booking)}>
                                        <Ionicons name="close-circle" size={16} color="#ef4444" />
                                        <Text style={styles.actionButtonTextDanger}>Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.actionButtonSuccess]}
                                        onPress={() => handleConfirmBooking(booking)}>
                                        <Ionicons name="checkmark-circle" size={16} color="#fff" />
                                        <Text style={styles.actionButtonTextPrimary}>Xác nhận</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {booking.status === 'CONFIRMED' && (
                                <View style={styles.bookingCardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.actionButtonDanger]}
                                        onPress={() => handleCancelBooking(booking)}>
                                        <Ionicons name="close-circle" size={16} color="#ef4444" />
                                        <Text style={styles.actionButtonTextDanger}>Hủy</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.actionButtonSuccess]}
                                        onPress={() => handleCheckIn(booking)}>
                                        <Ionicons name="log-in" size={16} color="#fff" />
                                        <Text style={styles.actionButtonTextPrimary}>Nhận phòng</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {booking.status === 'CHECKED_IN' && (
                                <View style={styles.bookingCardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.actionButtonSecondary]}
                                        onPress={() => {
                                            console.log('🔵 Opening service modal for booking:', booking.id);
                                            setSelectedBooking(booking);
                                            setShowServiceModal(true);
                                        }}>
                                        <Ionicons name="add-circle" size={16} color="#4a90e2" />
                                        <Text style={styles.actionButtonTextSecondary}>Dịch vụ</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.actionButtonWarning]}
                                        onPress={() => handleCheckOut(booking)}>
                                        <Ionicons name="log-out" size={16} color="#fff" />
                                        <Text style={styles.actionButtonTextPrimary}>Trả phòng</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {booking.status === 'CHECKED_OUT' && (
                                <View style={styles.bookingCardActions}>
                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.actionButtonPurple]}
                                        onPress={() => handleCleanRoom(booking)}>
                                        <Ionicons name="checkmark-done" size={16} color="#fff" />
                                        <Text style={styles.actionButtonTextPrimary}>Hoàn tất dọn phòng</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                })}

                {filteredBookings.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>Không có booking</Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? 'Thử tìm kiếm với từ khóa khác'
                                : 'Chưa có booking nào trong danh sách'}
                        </Text>
                    </View>
                )}
            </ScrollView>

            <ServiceModal
                visible={showServiceModal}
                booking={selectedBooking}
                onClose={() => {
                    setShowServiceModal(false);
                    setSelectedBooking(null);
                }}
                onAddService={handleAddService}
            />

            <ChangeRoomModal
                visible={showChangeRoomModal}
                booking={selectedBooking}
                rooms={rooms}
                onClose={() => {
                    setShowChangeRoomModal(false);
                    setSelectedBooking(null);
                }}
                onChangeRoom={handleChangeRoom}
            />

            <BookingMenuModal
                visible={showMenuModal}
                booking={selectedBooking}
                onClose={() => {
                    setShowMenuModal(false);
                    setSelectedBooking(null);
                }}
                onEdit={() => {
                    setShowEditModal(true);
                }}
                onConfirm={() => {
                    if (selectedBooking) {
                        handleConfirmBooking(selectedBooking);
                    }
                }}
                onAddService={() => {
                    console.log('🔵 Menu: Opening service modal');
                    setShowServiceModal(true);
                }}
                onCheckOut={() => {
                    if (selectedBooking) {
                        handleCheckOut(selectedBooking);
                    }
                }}
                onChangeRoom={() => {
                    setShowChangeRoomModal(true);
                }}
                onCleanRoom={() => {
                    if (selectedBooking) {
                        handleCleanRoom(selectedBooking);
                    }
                }}
                onDelete={() => {
                    if (selectedBooking) {
                        handleCancelBooking(selectedBooking);
                    }
                }}
            />

            <EditBookingModal
                visible={showEditModal}
                booking={selectedBooking}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedBooking(null);
                }}
                onSave={handleEditBooking}
            />
        </View>
    );
}

