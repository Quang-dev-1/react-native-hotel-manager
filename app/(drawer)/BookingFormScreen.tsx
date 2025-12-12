import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
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

// Simple Calendar Component
const CalendarPicker = ({
    visible,
    onClose,
    onSelect,
    selectedDate,
    minDate
}: {
    visible: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    selectedDate: Date;
    minDate?: Date;
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
        return date < minDate;
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

        // Add empty cells for days before the first day of month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const disabled = isDateDisabled(day);
            const today = isToday(day);
            const selected = isSelected(day);

            days.push(
                <TouchableOpacity
                    key={day}
                    style={[
                        styles.calendarDay,
                        today && styles.calendarDayToday,
                        selected && styles.calendarDaySelected,
                        disabled && styles.calendarDayDisabled,
                    ]}
                    onPress={() => {
                        if (!disabled) {
                            const newDate = new Date(currentYear, currentMonth, day);
                            onSelect(newDate);
                            onClose();
                        }
                    }}
                    disabled={disabled}>
                    <Text style={[
                        styles.calendarDayText,
                        today && styles.calendarDayTextToday,
                        selected && styles.calendarDayTextSelected,
                        disabled && styles.calendarDayTextDisabled,
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
    const { addBooking } = useBooking();
    const { room } = route.params as any;

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [checkInDate, setCheckInDate] = useState(new Date());
    const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const [showCheckInPicker, setShowCheckInPicker] = useState(false);
    const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
    const [deposit, setDeposit] = useState('');
    const [notes, setNotes] = useState('');

    // Validation states
    const [errors, setErrors] = useState({
        customerName: '',
        phone: '',
        deposit: '',
    });

    const validatePhone = (text: string) => {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!text.trim()) {
            return 'Vui lòng nhập số điện thoại';
        }
        if (!phoneRegex.test(text.trim())) {
            return 'Số điện thoại không hợp lệ (10-11 chữ số)';
        }
        return '';
    };

    const validateCustomerName = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập tên khách hàng';
        }
        if (text.trim().length < 2) {
            return 'Tên khách hàng phải có ít nhất 2 ký tự';
        }
        return '';
    };

    const validateDeposit = (text: string) => {
        if (text && isNaN(Number(text))) {
            return 'Tiền cọc phải là số';
        }
        if (text && Number(text) < 0) {
            return 'Tiền cọc không thể âm';
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

    const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const handleCheckInDateSelect = (date: Date) => {
        setCheckInDate(date);
        // Auto adjust checkout date if it's before new check-in date
        if (date >= checkOutDate) {
            setCheckOutDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
        }
    };

    const handleCheckOutDateSelect = (date: Date) => {
        setCheckOutDate(date);
    };

    const calculateNights = () => {
        const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 0;
    };

    const calculateTotal = () => {
        return room.price * calculateNights();
    };

    const handleSubmitBooking = () => {
        // Validate all fields
        const nameError = validateCustomerName(customerName);
        const phoneError = validatePhone(phone);
        const depositError = validateDeposit(deposit);

        setErrors({
            customerName: nameError,
            phone: phoneError,
            deposit: depositError,
        });

        // Check if any errors exist
        if (nameError || phoneError || depositError) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin đã nhập');
            return;
        }

        const nights = calculateNights();
        if (nights <= 0) {
            Alert.alert('Lỗi', 'Ngày trả phòng phải sau ngày nhận phòng');
            return;
        }

        const totalAmount = calculateTotal();
        const depositAmount = deposit ? parseFloat(deposit) : 0;

        // Create booking
        const booking = {
            roomNumber: room.roomNumber,
            customerName: customerName.trim(),
            phone: phone.trim(),
            checkIn: formatDate(checkInDate),
            checkOut: formatDate(checkOutDate),
            nights,
            totalAmount,
            deposit: depositAmount,
            notes: notes.trim(),
            status: 'active' as const,
        };

        addBooking(booking);
        Alert.alert('Thành công', `Đã đặt phòng ${room.roomNumber} thành công!`, [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
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
                        Phòng {room.roomNumber} - {room.type}
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.formContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.formContent}>

                {/* Customer Name */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Tên khách hàng <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[
                        styles.inputWrapper,
                        errors.customerName ? styles.inputError : null
                    ]}>
                        <Ionicons name="person-outline" size={20} color="#64748b" />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập tên khách hàng"
                            value={customerName}
                            onChangeText={handleCustomerNameChange}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    {errors.customerName ? (
                        <Text style={styles.errorText}>{errors.customerName}</Text>
                    ) : null}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Số điện thoại <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={[
                        styles.inputWrapper,
                        errors.phone ? styles.inputError : null
                    ]}>
                        <Ionicons name="call-outline" size={20} color="#64748b" />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số điện thoại (10-11 số)"
                            value={phone}
                            onChangeText={handlePhoneChange}
                            keyboardType="phone-pad"
                            maxLength={11}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                    {errors.phone ? (
                        <Text style={styles.errorText}>{errors.phone}</Text>
                    ) : null}
                </View>

                {/* Check-in Date */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Ngày nhận phòng <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowCheckInPicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color="#64748b" />
                        <Text style={styles.dateText}>{formatDate(checkInDate)}</Text>
                        <Ionicons name="chevron-down-outline" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Check-out Date */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>
                        Ngày trả phòng <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowCheckOutPicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color="#64748b" />
                        <Text style={styles.dateText}>{formatDate(checkOutDate)}</Text>
                        <Ionicons name="chevron-down-outline" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Nights & Total Summary */}
                {calculateNights() > 0 && (
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Số đêm:</Text>
                            <Text style={styles.summaryValue}>{calculateNights()} đêm</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng tiền:</Text>
                            <Text style={styles.summaryValueHighlight}>
                                {calculateTotal().toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>
                )}

                {/* Deposit */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Tiền trả trước (đặt cọc)</Text>
                    <View style={[
                        styles.inputWrapper,
                        errors.deposit ? styles.inputError : null
                    ]}>
                        <Ionicons name="cash-outline" size={20} color="#64748b" />
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số tiền đặt cọc"
                            value={deposit}
                            onChangeText={handleDepositChange}
                            keyboardType="numeric"
                            placeholderTextColor="#94a3b8"
                        />
                        <Text style={styles.currency}>đ</Text>
                    </View>
                    {errors.deposit ? (
                        <Text style={styles.errorText}>{errors.deposit}</Text>
                    ) : null}
                </View>

                {/* Room Info Card */}
                <View style={styles.roomInfoCard}>
                    <Text style={styles.roomInfoTitle}>Thông tin phòng</Text>
                    <View style={styles.divider} />
                    <View style={styles.roomInfoRow}>
                        <View style={styles.roomInfoItem}>
                            <Ionicons name="home-outline" size={20} color="#4a90e2" />
                            <Text style={styles.roomInfoLabel}>Loại phòng</Text>
                        </View>
                        <Text style={styles.roomInfoValue}>{room.type}</Text>
                    </View>
                    <View style={styles.roomInfoRow}>
                        <View style={styles.roomInfoItem}>
                            <Ionicons name="cash-outline" size={20} color="#4a90e2" />
                            <Text style={styles.roomInfoLabel}>Giá phòng</Text>
                        </View>
                        <Text style={styles.roomInfoValue}>
                            {room.price.toLocaleString('vi-VN')}đ/đêm
                        </Text>
                    </View>
                    <View style={styles.roomInfoRow}>
                        <View style={styles.roomInfoItem}>
                            <Ionicons name="layers-outline" size={20} color="#4a90e2" />
                            <Text style={styles.roomInfoLabel}>Tầng</Text>
                        </View>
                        <Text style={styles.roomInfoValue}>Tầng {room.floor}</Text>
                    </View>
                </View>

                {/* Notes */}
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
                        />
                    </View>
                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelBtnText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmitBooking}>
                    <LinearGradient
                        colors={['#4a90e2', '#357abd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitBtnGradient}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                        <Text style={styles.submitBtnText}>Xác nhận đặt phòng</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Calendar Pickers */}
            <CalendarPicker
                visible={showCheckInPicker}
                onClose={() => setShowCheckInPicker(false)}
                onSelect={handleCheckInDateSelect}
                selectedDate={checkInDate}
                minDate={new Date()}
            />

            <CalendarPicker
                visible={showCheckOutPicker}
                onClose={() => setShowCheckOutPicker(false)}
                onSelect={handleCheckOutDateSelect}
                selectedDate={checkOutDate}
                minDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
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
        marginBottom: 16,
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
    roomBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
    },
    roomBadgeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    formContainer: {
        flex: 1,
    },
    formContent: {
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
    required: {
        color: '#ef4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 12,
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 1.5,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        paddingVertical: 14,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        marginLeft: 4,
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
        gap: 12,
    },
    dateText: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    currency: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    summaryCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#475569',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
    },
    summaryValueHighlight: {
        fontSize: 16,
        color: '#4a90e2',
        fontWeight: '700',
    },
    textAreaWrapper: {
        alignItems: 'flex-start',
        paddingVertical: 12,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
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
        elevation: 2,
    },
    roomInfoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginBottom: 16,
    },
    roomInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    roomInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    roomInfoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    roomInfoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
    },
    bottomSpace: {
        height: 20,
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
        elevation: 4,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
    submitBtn: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    submitBtnGradient: {
        flexDirection: 'row',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    submitBtnText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    // Calendar Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
        elevation: 8,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    calendarNavButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: '#f8fafc',
    },
    calendarTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    calendarWeekdays: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    calendarWeekday: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#64748b',
        paddingVertical: 8,
    },
    calendarDays: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    calendarDay: {
        width: '14.28%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
    },
    calendarDayToday: {
        backgroundColor: '#e0f2fe',
        borderRadius: 8,
    },
    calendarDaySelected: {
        backgroundColor: '#4a90e2',
        borderRadius: 8,
    },
    calendarDayDisabled: {
        opacity: 0.3,
    },
    calendarDayText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    calendarDayTextToday: {
        color: '#0369a1',
        fontWeight: '700',
    },
    calendarDayTextSelected: {
        color: '#fff',
        fontWeight: '700',
    },
    calendarDayTextDisabled: {
        color: '#94a3b8',
    },
    calendarCloseButton: {
        marginTop: 20,
        backgroundColor: '#f8fafc',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    calendarCloseButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748b',
    },
});