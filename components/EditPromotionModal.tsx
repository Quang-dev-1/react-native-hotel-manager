import promotionService, { Promotion } from '@/services/promotionService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface EditPromotionModalProps {
    visible: boolean;
    promotion: Promotion | null;
    onClose: () => void;
    onSuccess: () => void;
}

const promotionTypes = [
    { value: 'PERCENTAGE', label: 'Giảm theo %', icon: 'percent-outline' },
    { value: 'FIXED_AMOUNT', label: 'Giảm cố định', icon: 'cash-outline' },
    { value: 'ROOM_UPGRADE', label: 'Nâng hạng phòng', icon: 'arrow-up-circle-outline' },
    { value: 'FREE_NIGHTS', label: 'Tặng đêm miễn phí', icon: 'bed-outline' },
];

export default function EditPromotionModal({ visible, promotion, onClose, onSuccess }: EditPromotionModalProps) {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        type: 'PERCENTAGE',
        value: '',
        maxDiscount: '',
        minBookingAmount: '',
        startDate: '',
        endDate: '',
        maxUsage: '',
    });

    const [errors, setErrors] = useState({
        code: '',
        name: '',
        value: '',
        startDate: '',
        endDate: '',
    });

    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Load dữ liệu promotion khi mở modal - GIỮ THÔNG TIN CŨ
    useEffect(() => {
        if (visible && promotion) {
            setFormData({
                code: promotion.code,
                name: promotion.name,
                description: promotion.description || '',
                type: promotion.type,
                value: promotion.value.toString(),
                maxDiscount: promotion.maxDiscount ? promotion.maxDiscount.toString() : '',
                minBookingAmount: promotion.minBookingAmount ? promotion.minBookingAmount.toString() : '',
                startDate: promotion.startDate,
                endDate: promotion.endDate,
                maxUsage: promotion.maxUsage ? promotion.maxUsage.toString() : '',
            });
            // Reset errors khi mở modal
            setErrors({
                code: '',
                name: '',
                value: '',
                startDate: '',
                endDate: '',
            });
        }
    }, [visible, promotion]);

    const validateCode = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập mã khuyến mãi';
        }
        if (!/^[A-Z0-9]+$/.test(text.trim())) {
            return 'Mã chỉ chứa chữ IN HOA và số';
        }
        if (text.length < 3 || text.length > 20) {
            return 'Mã phải từ 3-20 ký tự';
        }
        return '';
    };

    const validateName = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập tên khuyến mãi';
        }
        return '';
    };

    const validateValue = (text: string) => {
        if (!text.trim()) {
            return 'Vui lòng nhập giá trị';
        }
        const value = parseFloat(text);
        if (isNaN(value) || value <= 0) {
            return 'Giá trị phải là số dương';
        }
        if (formData.type === 'PERCENTAGE' && value > 100) {
            return 'Phần trăm không được vượt quá 100';
        }
        return '';
    };

    const validateDate = (text: string, field: 'startDate' | 'endDate') => {
        if (!text.trim()) {
            return field === 'startDate' ? 'Vui lòng chọn ngày bắt đầu' : 'Vui lòng chọn ngày kết thúc';
        }
        const date = new Date(text);
        if (isNaN(date.getTime())) {
            return 'Ngày không hợp lệ';
        }
        if (field === 'endDate' && formData.startDate) {
            const startDate = new Date(formData.startDate);
            if (date <= startDate) {
                return 'Ngày kết thúc phải sau ngày bắt đầu';
            }
        }
        return '';
    };

    const handleFieldChange = (field: string, value: string) => {
        setFormData({ ...formData, [field]: value });

        let error = '';
        if (field === 'code') error = validateCode(value);
        else if (field === 'name') error = validateName(value);
        else if (field === 'value') error = validateValue(value);
        else if (field === 'startDate' || field === 'endDate') {
            error = validateDate(value, field as 'startDate' | 'endDate');
        }

        setErrors({ ...errors, [field]: error });
    };

    const handleStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            handleFieldChange('startDate', formattedDate);
        }
    };

    const handleEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            handleFieldChange('endDate', formattedDate);
        }
    };

    const handleSubmit = async () => {
        if (!promotion?.id) return;

        // Validate all fields
        const codeError = validateCode(formData.code);
        const nameError = validateName(formData.name);
        const valueError = validateValue(formData.value);
        const startDateError = validateDate(formData.startDate, 'startDate');
        const endDateError = validateDate(formData.endDate, 'endDate');

        setErrors({
            code: codeError,
            name: nameError,
            value: valueError,
            startDate: startDateError,
            endDate: endDateError,
        });

        if (codeError || nameError || valueError || startDateError || endDateError) {
            Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
            return;
        }

        try {
            setLoading(true);

            const promotionData = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                description: formData.description.trim(),
                type: formData.type,
                value: parseFloat(formData.value),
                maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
                minBookingAmount: formData.minBookingAmount ? parseFloat(formData.minBookingAmount) : undefined,
                startDate: formData.startDate,
                endDate: formData.endDate,
                maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : undefined,
                active: promotion.active,
            };

            await promotionService.updatePromotion(promotion.id, promotionData);

            Alert.alert('Thành công', 'Đã cập nhật khuyến mãi thành công');
            onSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    if (!promotion) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Chỉnh sửa khuyến mãi</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Promotion Code */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Mã khuyến mãi <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.code ? styles.inputError : null]}>
                                <Ionicons name="pricetag-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.code}
                                    onChangeText={(text) => handleFieldChange('code', text.toUpperCase())}
                                    autoCapitalize="characters"
                                    editable={!loading}
                                />
                            </View>
                            {errors.code ? <Text style={styles.errorText}>{errors.code}</Text> : null}
                        </View>

                        {/* Promotion Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Tên khuyến mãi <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.name ? styles.inputError : null]}>
                                <Ionicons name="text-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.name}
                                    onChangeText={(text) => handleFieldChange('name', text)}
                                    editable={!loading}
                                />
                            </View>
                            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
                        </View>

                        {/* Promotion Type */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Loại khuyến mãi <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={styles.radioGroup}>
                                {promotionTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={[
                                            styles.radioButton,
                                            formData.type === type.value && styles.radioButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, type: type.value })}
                                        disabled={loading}>
                                        <Ionicons
                                            name={type.icon as any}
                                            size={20}
                                            color={formData.type === type.value ? '#4a90e2' : '#64748b'}
                                        />
                                        <Text
                                            style={[
                                                styles.radioText,
                                                formData.type === type.value && styles.radioTextActive,
                                            ]}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Value */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Giá trị <Text style={styles.required}>*</Text>
                            </Text>
                            <View style={[styles.inputWrapper, errors.value ? styles.inputError : null]}>
                                <Ionicons
                                    name={formData.type === 'PERCENTAGE' ? 'calculator-outline' : 'cash-outline'}
                                    size={20}
                                    color="#64748b"
                                />
                                <TextInput
                                    style={styles.input}
                                    value={formData.value}
                                    onChangeText={(text) => handleFieldChange('value', text)}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />
                            </View>
                            {errors.value ? <Text style={styles.errorText}>{errors.value}</Text> : null}
                        </View>

                        {/* Max Discount */}
                        {formData.type === 'PERCENTAGE' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Giảm tối đa (VNĐ)</Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="trending-down-outline" size={20} color="#64748b" />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.maxDiscount}
                                        onChangeText={(text) => setFormData({ ...formData, maxDiscount: text })}
                                        keyboardType="numeric"
                                        editable={!loading}
                                    />
                                </View>
                            </View>
                        )}

                        {/* Min Booking Amount */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Giá trị đơn tối thiểu (VNĐ)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="trending-up-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.minBookingAmount}
                                    onChangeText={(text) => setFormData({ ...formData, minBookingAmount: text })}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Start Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>
                                Ngày bắt đầu <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[styles.inputWrapper, errors.startDate ? styles.inputError : null]}
                                onPress={() => setShowStartDatePicker(true)}
                                disabled={loading}>
                                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                                <Text style={[styles.dateText, !formData.startDate && styles.placeholderText]}>
                                    {formData.startDate || 'Chọn ngày bắt đầu'}
                                </Text>
                            </TouchableOpacity>
                            {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
                        </View>

                        {showStartDatePicker && (
                            <DateTimePicker
                                value={formData.startDate ? new Date(formData.startDate) : new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleStartDateChange}
                            />
                        )}

                        {/* End Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Ngày bắt đầu <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[styles.inputWrapper, errors.startDate ? styles.inputError : null]}
                                onPress={() => setShowStartDatePicker(true)}
                                disabled={loading}>
                                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                                <Text style={[styles.dateText, !formData.startDate && styles.placeholderText]}>
                                    {formData.startDate || 'Chọn ngày bắt đầu'}
                                </Text>
                            </TouchableOpacity>
                            {errors.startDate ? <Text style={styles.errorText}>{errors.startDate}</Text> : null}
                        </View>

                        {/* Modal cho Start Date Picker */}
                        {showStartDatePicker && (
                            <Modal transparent animationType="fade" visible={showStartDatePicker}>
                                <View style={styles.datePickerModal}>
                                    <View style={styles.datePickerContainer}>
                                        <View style={styles.datePickerHeader}>
                                            <Text style={styles.datePickerTitle}>Chọn ngày bắt đầu</Text>
                                            <TouchableOpacity onPress={() => setShowStartDatePicker(false)}>
                                                <Ionicons name="close" size={24} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={formData.startDate ? new Date(formData.startDate) : new Date()}
                                            mode="date"
                                            display="spinner"
                                            onChange={handleStartDateChange}
                                            style={styles.datePicker}
                                        />
                                        <TouchableOpacity
                                            style={styles.datePickerConfirm}
                                            onPress={() => setShowStartDatePicker(false)}>
                                            <Text style={styles.datePickerConfirmText}>Xác nhận</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        )}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>
                                Ngày kết thúc <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={[styles.inputWrapper, errors.endDate ? styles.inputError : null]}
                                onPress={() => setShowEndDatePicker(true)}
                                disabled={loading}>
                                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                                <Text style={[styles.dateText, !formData.endDate && styles.placeholderText]}>
                                    {formData.endDate || 'Chọn ngày kết thúc'}
                                </Text>
                            </TouchableOpacity>
                            {errors.endDate ? <Text style={styles.errorText}>{errors.endDate}</Text> : null}
                        </View>

                        {/* Modal cho End Date Picker */}
                        {showEndDatePicker && (
                            <Modal transparent animationType="fade" visible={showEndDatePicker}>
                                <View style={styles.datePickerModal}>
                                    <View style={styles.datePickerContainer}>
                                        <View style={styles.datePickerHeader}>
                                            <Text style={styles.datePickerTitle}>Chọn ngày kết thúc</Text>
                                            <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                                                <Ionicons name="close" size={24} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={formData.endDate ? new Date(formData.endDate) : new Date()}
                                            mode="date"
                                            display="spinner"
                                            onChange={handleEndDateChange}
                                            minimumDate={formData.startDate ? new Date(formData.startDate) : new Date()}
                                            style={styles.datePicker}
                                        />
                                        <TouchableOpacity
                                            style={styles.datePickerConfirm}
                                            onPress={() => setShowEndDatePicker(false)}>
                                            <Text style={styles.datePickerConfirmText}>Xác nhận</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>
                        )}
                        {/* Max Usage */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Số lần sử dụng tối đa</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="people-outline" size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    value={formData.maxUsage}
                                    onChangeText={(text) => setFormData({ ...formData, maxUsage: text })}
                                    keyboardType="numeric"
                                    editable={!loading}
                                />
                            </View>
                        </View>

                        {/* Description */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Mô tả</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                editable={!loading}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Cập nhật</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    datePickerModal: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    datePickerContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '85%',
        maxWidth: 400,
        overflow: 'hidden',
    },
    datePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    datePickerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    datePicker: {
        height: 200,
        backgroundColor: '#fff',
    },
    datePickerConfirm: {
        backgroundColor: '#4a90e2',
        padding: 16,
        alignItems: 'center',
        margin: 16,
        borderRadius: 12,
    },
    datePickerConfirmText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    inputLabel: {

    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
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
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        gap: 12,
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 1.5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        paddingVertical: 14,
        fontWeight: '500',
    },
    dateText: {
        flex: 1,
        fontSize: 16,
        color: '#1e293b',
        paddingVertical: 14,
        fontWeight: '500',
    },
    placeholderText: {
        color: '#94a3b8',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#1e293b',
        height: 100,
    },
    errorText: {
        fontSize: 12,
        color: '#ef4444',
        marginTop: 4,
        marginLeft: 4,
    },
    radioGroup: {
        gap: 12,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        backgroundColor: '#fff',
        gap: 12,
    },
    radioButtonActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#4a90e2',
    },
    radioText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    radioTextActive: {
        color: '#4a90e2',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    button: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#3b82f6',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});