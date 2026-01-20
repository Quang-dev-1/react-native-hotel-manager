import bookingService from '@/services/bookingService';
import { Room } from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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

const CalendarPicker = ({
    visible,
    onClose,
    onSelect,
    selectedDate,
    minDate,
    bookedDates = []
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    selectedDate: Date;
    minDate?: Date;
    bookedDates?: string[];
}) => {
    const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
    const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

    const monthNames = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay();
    };

    const previousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const isDateDisabled = (day: number) => {
        if (!minDate) return false;
        const date = new Date(currentYear, currentMonth, day);
        date.setHours(0, 0, 0, 0);
        const min = new Date(minDate);
        min.setHours(0, 0, 0, 0);
        return date < min;
    };

    const isDateBooked = (day: number) => {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return bookedDates.includes(dateStr);
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
    };

    const isSelected = (day: number) => {
        return day === selectedDate.getDate() &&
            currentMonth === selectedDate.getMonth() &&
            currentYear === selectedDate.getFullYear();
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const disabled = isDateDisabled(day);
            const booked = isDateBooked(day);
            const today = isToday(day);
            const selected = isSelected(day);

            days.push(
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.calendarDay,
                        today && styles.calendarDayToday,
                        selected && styles.calendarDaySelected,
                        (disabled || booked) && styles.calendarDayDisabled,
                        booked && !selected && styles.calendarDayBooked,
                    ]}
                    onPress={() => {
                        if (!disabled && !booked) {
                            const newDate = new Date(currentYear, currentMonth, day);
                            newDate.setHours(12, 0, 0, 0);
                            onSelect(newDate);
                            onClose();
                        }
                    }}
                    disabled={disabled || booked}>
                    <Text style={[
                        styles.calendarDayText,
                        today && styles.calendarDayTextToday,
                        selected && styles.calendarDayTextSelected,
                        (disabled || booked) && styles.calendarDayTextDisabled,
                        booked && !selected && styles.calendarDayTextBooked,
                    ]}>
                        {day}
                    </Text>
                </TouchableOpacity>
            );
        }

        return days;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity onPress={previousMonth} style={styles.calendarNavButton}>
                            <Ionicons name="chevron-back" size={24} color="#4a90e2" />
                        </TouchableOpacity>
                        <Text style={styles.calendarTitle}>
                            {monthNames[currentMonth]} {currentYear}
                        </Text>
                        <TouchableOpacity onPress={nextMonth} style={styles.calendarNavButton}>
                            <Ionicons name="chevron-forward" size={24} color="#4a90e2" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.calendarWeekdays}>
                        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                            <Text key={day} style={styles.calendarWeekday}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.calendarDays}>
                        {renderCalendar()}
                    </View>

                    {bookedDates.length > 0 && (
                        <View style={styles.calendarLegend}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendBox, { backgroundColor: '#fecaca' }]} />
                                <Text style={styles.legendText}>Đã có booking</Text>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.calendarCloseButton}
                        onPress={onClose}>
                        <Text style={styles.calendarCloseButtonText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function BookingFormScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const params = route.params as { room?: Room; preselectedCheckIn?: string } | undefined;
    const room = params?.room;
    const preselectedCheckIn = params?.preselectedCheckIn;

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [checkInDate, setCheckInDate] = useState(
        preselectedCheckIn ? new Date(preselectedCheckIn + 'T12:00:00') : today
    );
    const [checkOutDate, setCheckOutDate] = useState(tomorrow);
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
    const [deposit, setDeposit] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');

    const [errors, setErrors] = useState({
        customerName: '',
        phone: '',
        deposit: '',
    });

    useEffect(() => {
        if (!room) {
            Alert.alert(
                'Lỗi',
                'Không tìm thấy thông tin phòng. Vui lòng thử lại.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } else {
            loadBookedDates();
        }
    }, [room, navigation]);

    const loadBookedDates = async () => {
        if (!room?.id) return;
        try {
            const dates = await bookingService.getBookedDatesByRoom(room.id);
            setBookedDates(dates);
        } catch (error) {
            console.error('Error loading booked dates:', error);
        }
    };

    if (!room) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={{ marginTop: 16, color: '#64748b' }}>Đang tải...</Text>
            </View>
        );
    }

    const validatePhone = (text: string) => {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!text.trim()) return 'Vui lòng nhập số điện thoại';
        if (!phoneRegex.test(text.trim())) return 'Số điện thoại không hợp lệ (10-11 chữ số)';
        return '';
    };

    const validateCustomerName = (text: string) => {
        if (!text.trim()) return 'Vui lòng nhập tên khách hàng';
        if (text.trim().length < 2) return 'Tên khách hàng phải có ít nhất 2 ký tự';
        return '';
    };

    const validateDeposit = (text: string) => {
        if (paymentMethod === 'online' && !text) {
            return 'Vui lòng nhập số tiền cọc khi thanh toán online';
        }
        if (text && isNaN(Number(text))) return 'Tiền cọc phải là số';
        if (text && Number(text) < 0) return 'Tiền cọc không thể âm';
        if (paymentMethod === 'online' && Number(text) < 10000) {
            return 'Số tiền tối thiểu là 10,000đ';
        }
        return '';
    };

    const handleCustomerNameChange = (text: string) => {
        setCustomerName(text);
        setErrors(prev => ({ ...prev, customerName: validateCustomerName(text) }));
    };

    const handlePhoneChange = (text: string) => {
        setPhone(text);
        setErrors(prev => ({ ...prev, phone: validatePhone(text) }));
    };

    const handleDepositChange = (text: string) => {
        setDeposit(text);
        setErrors(prev => ({ ...prev, deposit: validateDeposit(text) }));
    };

    const formatDateForAPI = (date: Date) => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleCheckInDateSelect = (date: Date) => {
        setCheckInDate(date);
        const currentCheckOut = new Date(checkOutDate);
        currentCheckOut.setHours(12, 0, 0, 0);
        const selectedCheckIn = new Date(date);
        selectedCheckIn.setHours(12, 0, 0, 0);

        if (selectedCheckIn >= currentCheckOut) {
            const newCheckOut = new Date(date);
            newCheckOut.setDate(newCheckOut.getDate() + 1);
            newCheckOut.setHours(12, 0, 0, 0);
            setCheckOutDate(newCheckOut);
        }
    };

    const handleCheckOutDateSelect = (date: Date) => {
        setCheckOutDate(date);
    };

    const calculateNights = () => {
        const checkIn = new Date(checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(checkOutDate);
        checkOut.setHours(0, 0, 0, 0);
        const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 0;
    };

    const calculateTotal = () => {
        return room.price * calculateNights();
    };

    const checkDateOverlap = (checkIn: string, checkOut: string): boolean => {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        const datesInRange: string[] = [];
        for (let d = new Date(checkInDate); d < checkOutDate; d.setDate(d.getDate() + 1)) {
            datesInRange.push(d.toISOString().split('T')[0]);
        }

        return datesInRange.some(date => bookedDates.includes(date));
    };


    const handleSubmitBooking = async () => {
        const nameError = validateCustomerName(customerName);
        const phoneError = validatePhone(phone);
        const depositError = validateDeposit(deposit);

        setErrors({
            customerName: nameError,
            phone: phoneError,
            deposit: depositError,
        });

        if (nameError || phoneError || depositError) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        const nights = calculateNights();
        if (nights <= 0) {
            Alert.alert('Lỗi', 'Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày');
            return;
        }

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        const checkIn = new Date(checkInDate);
        checkIn.setHours(0, 0, 0, 0);

        if (checkIn < todayDate) {
            Alert.alert('Lỗi', 'Ngày nhận phòng không thể là ngày trong quá khứ');
            return;
        }

        const checkInStr = formatDateForAPI(checkInDate);
        const checkOutStr = formatDateForAPI(checkOutDate);

        if (checkDateOverlap(checkInStr, checkOutStr)) {
            Alert.alert(
                'Không thể đặt phòng',
                'Khoảng thời gian bạn chọn trùng với booking đã có. Vui lòng chọn ngày khác.',
                [{ text: 'OK' }]
            );
            return;
        }

        const depositAmount = deposit ? parseFloat(deposit) : 0;
        const totalAmount = calculateTotal();

        if (depositAmount > totalAmount) {
            Alert.alert('Lỗi', 'Tiền cọc không thể lớn hơn tổng tiền phòng');
            return;
        }

        try {
            setLoading(true);

            const bookingData = {
                roomId: room.id!,
                customerName: customerName.trim(),
                phone: phone.trim(),
                checkIn: checkInStr,
                checkOut: checkOutStr,
                deposit: 0,
                notes: notes.trim(),
            };

            console.log('📤 Submitting booking:', bookingData);

            const newBooking = await bookingService.createBooking(bookingData);

            if (paymentMethod === 'online' && depositAmount > 0) {
                router.push({
                    pathname: '/(drawer)/PaymentScreen',
                    params: {
                        bookingId: newBooking.id!.toString(),
                        depositAmount: depositAmount.toString(),
                        customerName: customerName.trim(),
                        roomNumber: room.roomNumber,
                    }
                });
            }
            else if (paymentMethod === 'cash' && depositAmount > 0) {
                // Cập nhật deposit cho booking
                await bookingService.updateBooking(newBooking.id!, {
                    customerName: customerName.trim(),
                    phone: phone.trim(),
                    checkIn: checkInStr,
                    checkOut: checkOutStr,
                    deposit: depositAmount,
                    notes: notes.trim(),
                });

                const activeBookings = await bookingService.getActiveBookings();
                const hasActiveBooking = activeBookings.some(
                    b => b.roomId === room.id && b.status === 'CHECKED_IN'
                );

                const statusMessage = hasActiveBooking
                    ? 'Booking đã được tạo với trạng thái CHỜ XÁC NHẬN.\n\nLưu ý: Phòng này đang có khách đang ở. Bạn chỉ có thể xác nhận booking này sau khi khách hiện tại trả phòng.'
                    : 'Booking đã được tạo thành công!';

                Alert.alert(
                    'Thành công',
                    `${statusMessage}\n\nThông tin:\n• Số đêm: ${nights} đêm\n• Tổng tiền: ${totalAmount.toLocaleString('vi-VN')}đ\n• Đặt cọc: ${depositAmount.toLocaleString('vi-VN')}đ`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
            else {
                const activeBookings = await bookingService.getActiveBookings();
                const hasActiveBooking = activeBookings.some(
                    b => b.roomId === room.id && b.status === 'CHECKED_IN'
                );

                const statusMessage = hasActiveBooking
                    ? 'Booking đã được tạo với trạng thái CHỜ XÁC NHẬN.\n\nLưu ý: Phòng này đang có khách đang ở. Bạn chỉ có thể xác nhận booking này sau khi khách hiện tại trả phòng.'
                    : 'Booking đã được tạo thành công!';

                Alert.alert(
                    'Thành công',
                    `${statusMessage}\n\nThông tin:\n• Số đêm: ${nights} đêm\n• Tổng tiền: ${totalAmount.toLocaleString('vi-VN')}đ`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            }
        } catch (error: any) {
            console.error('❌ Booking error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tạo đặt phòng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const getMinCheckOutDate = () => {
        const minDate = new Date(checkInDate);
        minDate.setDate(minDate.getDate() + 1);
        minDate.setHours(0, 0, 0, 0);
        return minDate;
    };

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
                    <Text style={styles.headerTitle}>Đặt phòng</Text>
                </View>
                <View style={styles.roomBadge}>
                    <Ionicons name="bed" size={20} color="#fff" />
                    <Text style={styles.roomBadgeText}>
                        Phòng {room.roomNumber} - {room.roomTypeName}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Tên khách hàng <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputWrapper, errors.customerName ? styles.inputError : null]}>
                        <Ionicons name="person-outline" size={20} color="#64748b" />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên khách hàng"
                            value={customerName}
                            onChangeText={handleCustomerNameChange}
                            placeholderTextColor="#94a3b8"
                            editable={!loading}
                        />
                    </View>
                    {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Số điện thoại <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[styles.inputWrapper, errors.phone ? styles.inputError : null]}>
                        <Ionicons name="call-outline" size={20} color="#64748b" />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số điện thoại (10-11 số)"
                            value={phone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            maxLength={11}
                            placeholderTextColor="#94a3b8"
                            editable={!loading}
                        />
                    </View>
                    {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Ngày nhận phòng <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowCheckInPicker(true)}
                        disabled={loading}>
                        <Ionicons name="calendar-outline" size={20} color="#64748b" />
                        <Text style={styles.dateText}>{formatDateForDisplay(checkInDate)}</Text>
                        <Ionicons name="chevron-down-outline" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Ngày trả phòng <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowCheckOutPicker(true)}
                        disabled={loading}>
                        <Ionicons name="calendar-outline" size={20} color="#64748b" />
                        <Text style={styles.dateText}>{formatDateForDisplay(checkOutDate)}</Text>
                        <Ionicons name="chevron-down-outline" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {calculateNights() > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Số đêm:</Text>
                            <Text style={styles.summaryValue}>{calculateNights()} đêm</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Giá mỗi đêm:</Text>
                            <Text style={styles.summaryValue}>{room.price.toLocaleString('vi-VN')}đ</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                            <Text style={styles.summaryLabelTotal}>Tổng tiền:</Text>
                            <Text style={styles.summaryValueHighlight}>{calculateTotal().toLocaleString('vi-VN')}đ</Text>
                        </View>
                    </View>
                )}

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Phương thức thanh toán cọc <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.paymentMethodContainer}>
                        <TouchableOpacity
                            style={[
                                styles.paymentMethodOption,
                                paymentMethod === 'cash' && styles.paymentMethodActive
                            ]}
                            onPress={() => setPaymentMethod('cash')}
                            disabled={loading}>
                            <View style={styles.paymentMethodContent}>
                                <Ionicons
                                    name="cash-outline"
                                    size={24}
                                    color={paymentMethod === 'cash' ? '#4a90e2' : '#64748b'}
                                />
                                <View style={styles.paymentMethodText}>
                                    <Text style={[
                                        styles.paymentMethodTitle,
                                        paymentMethod === 'cash' && styles.paymentMethodTitleActive
                                    ]}>
                                        Tiền mặt
                                    </Text>
                                    <Text style={styles.paymentMethodDesc}>
                                        Thanh toán trực tiếp
                                    </Text>
                                </View>
                            </View>
                            {paymentMethod === 'cash' && (
                                <Ionicons name="checkmark-circle" size={24} color="#4a90e2" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.paymentMethodOption,
                                paymentMethod === 'online' && styles.paymentMethodActive
                            ]}
                            onPress={() => setPaymentMethod('online')}
                            disabled={loading}>
                            <View style={styles.paymentMethodContent}>
                                <Ionicons
                                    name="card-outline"
                                    size={24}
                                    color={paymentMethod === 'online' ? '#4a90e2' : '#64748b'}
                                />
                                <View style={styles.paymentMethodText}>
                                    <Text style={[
                                        styles.paymentMethodTitle,
                                        paymentMethod === 'online' && styles.paymentMethodTitleActive
                                    ]}>
                                        Chuyển khoản
                                    </Text>
                                    <Text style={styles.paymentMethodDesc}>
                                        Quét mã QR PayOS
                                    </Text>
                                </View>
                            </View>
                            {paymentMethod === 'online' && (
                                <Ionicons name="checkmark-circle" size={24} color="#4a90e2" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Tiền trả trước (đặt cọc)
                        {paymentMethod === 'online' && <Text style={styles.required}> *</Text>}
                    </Text>
                    <View style={[styles.inputWrapper, errors.deposit ? styles.inputError : null]}>
                        <Ionicons name="cash-outline" size={20} color="#64748b" />
                        <TextInput
                            style={styles.input}
                            placeholder={paymentMethod === 'online' ? 'Nhập số tiền cọc (tối thiểu 10,000đ)' : 'Nhập số tiền đặt cọc'}
                            value={deposit}
                            onChangeText={handleDepositChange}
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                            editable={!loading}
                        />
                        <Text style={styles.currency}>đ</Text>
                    </View>
                    {errors.deposit ? <Text style={styles.errorText}>{errors.deposit}</Text> : null}
                    {paymentMethod === 'online' && (
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={16} color="#4a90e2" />
                            <Text style={styles.infoText}>
                                Bạn sẽ được chuyển đến trang thanh toán PayOS để quét mã QR
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.roomInfoCard}>
                    <Text style={styles.roomInfoTitle}>Thông tin phòng</Text>
                    <View style={styles.divider} />
                    <View style={styles.roomInfoRow}>
                        <View style={styles.roomInfoItem}>
                            <Ionicons name="home-outline" size={20} color="#4a90e2" />
                            <Text style={styles.roomInfoLabel}>Loại phòng</Text>
                        </View>
                        <Text style={styles.roomInfoValue}>{room.roomTypeName}</Text>
                    </View>
                    <View style={styles.roomInfoRow}>
                        <View style={styles.roomInfoItem}>
                            <Ionicons name="cash-outline" size={20} color="#4a90e2" />
                            <Text style={styles.roomInfoLabel}>Giá phòng</Text>
                        </View>
                        <Text style={styles.roomInfoValue}>{room.price.toLocaleString('vi-VN')}đ/đêm</Text>
                    </View>
                    <View style={styles.roomInfoRow}>
                        <View style={styles.roomInfoItem}>
                            <Ionicons name="layers-outline" size={20} color="#4a90e2" />
                            <Text style={styles.roomInfoLabel}>Tầng</Text>
                        </View>
                        <Text style={styles.roomInfoValue}>Tầng {room.floor}</Text>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Ghi chú</Text>
                    <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Nhập ghi chú (nếu có)"
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            placeholderTextColor="#94a3b8"
                            editable={!loading}
                        />
                    </View>
                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => navigation.goBack()}
                    disabled={loading}>
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmitBooking}
                    disabled={loading}>
                    <LinearGradient
                        colors={loading ? ['#94a3b8', '#64748b'] : ['#4a90e2', '#357abd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitBtnGradient}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        )}
                        <Text style={styles.submitBtnText}>
                            {loading ? 'Đang xử lý...' : (paymentMethod === 'online' ? 'Tiếp tục thanh toán' : 'Xác nhận đặt phòng')}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <CalendarPicker
                visible={showCheckInPicker}
                onClose={() => setShowCheckInPicker(false)}
                onSelect={handleCheckInDateSelect}
                selectedDate={checkInDate}
                minDate={new Date()}
                bookedDates={bookedDates}
            />

            <CalendarPicker
                visible={showCheckOutPicker}
                onClose={() => setShowCheckOutPicker(false)}
                onSelect={handleCheckOutDateSelect}
                selectedDate={checkOutDate}
                minDate={getMinCheckOutDate()}
                bookedDates={bookedDates}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 20
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1
    },
    roomBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12
    },
    roomBadgeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff'
    },
    formContainer: {
        flex: 1
    },
    formContent: {
        padding: 20
    },
    inputGroup: {
        marginBottom: 20
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8
    },
    required: {
        color: '#ef4444'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 12
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 1.5
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        paddingVertical: 14,
        fontWeight: '500'
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        marginLeft: 4
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 12
    },
    dateText: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500'
    },
    currency: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600'
    },
    summaryCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#bfdbfe'
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    summaryRowTotal: {
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#bfdbfe',
        marginBottom: 0
    },
    summaryLabel: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500'
    },
    summaryLabelTotal: {
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '700'
    },
    summaryValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700'
    },
    summaryValueHighlight: {
        fontSize: 18,
        color: '#4a90e2',
        fontWeight: '700'
    },
    paymentMethodContainer: {
        gap: 12
    },
    paymentMethodOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0'
    },
    paymentMethodActive: {
        borderColor: '#4a90e2',
        backgroundColor: '#eff6ff'
    },
    paymentMethodContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1
    },
    paymentMethodText: {
        flex: 1
    },
    paymentMethodTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2
    },
    paymentMethodTitleActive: {
        color: '#4a90e2'
    },
    paymentMethodDesc: {
        fontSize: 13,
        color: '#64748b'
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
        borderColor: '#bfdbfe'
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 18
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingVertical: 12
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top'
    },
    roomInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    roomInfoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginBottom: 16
    },
    roomInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    roomInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    roomInfoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500'
    },
    roomInfoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700'
    },
    bottomSpace: {
        height: 20
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 4
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b'
    },
    submitBtnDisabled: {
        opacity: 0.7
    },
    submitBtn: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden'
    },
    submitBtnGradient: {
        flexDirection: 'row',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    calendarContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    calendarNavButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#f8fafc'
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b'
    },
    calendarWeekdays: {
        flexDirection: 'row',
        marginBottom: 10
    },
    calendarWeekday: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        paddingVertical: 8
    },
    calendarDays: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4
    },
    calendarDayToday: {
        backgroundColor: '#e0f2fe',
        borderRadius: 8
    },
    calendarDaySelected: {
        backgroundColor: '#4a90e2',
        borderRadius: 8
    },
    calendarDayDisabled: {
        opacity: 0.3
    },
    calendarDayBooked: {
        backgroundColor: '#fecaca',
        borderRadius: 8
    },
    calendarDayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b'
    },
    calendarDayTextToday: {
        color: '#0369a1',
        fontWeight: '700'
    },
    calendarDayTextSelected: {
        color: '#fff',
        fontWeight: '700'
    },
    calendarDayTextDisabled: {
        color: '#94a3b8'
    },
    calendarDayTextBooked: {
        color: '#991b1b',
        fontWeight: '600'
    },
    calendarLegend: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0'
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    legendBox: {
        width: 16,
        height: 16,
        borderRadius: 4,
        marginRight: 8
    },
    legendText: {
        fontSize: 13,
        color: '#64748b'
    },
    calendarCloseButton: {
        marginTop: 20,
        backgroundColor: '#f8fafc',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    calendarCloseButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b'
    },
});