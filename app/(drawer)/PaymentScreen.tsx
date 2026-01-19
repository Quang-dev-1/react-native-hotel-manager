import PaymentService from '@/services/PaymentService';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentRouteParams {
    bookingId: number;
    depositAmount: number;
    customerName: string;
    roomNumber: string;
}

export default function PaymentScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const params = route.params as PaymentRouteParams;

    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [orderCode, setOrderCode] = useState<number | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

    useEffect(() => {
        createPayment();
    }, []);

    const createPayment = async () => {
        try {
            setLoading(true);
            console.log('🔄 Creating payment for booking:', params.bookingId);

            const response = await PaymentService.createDepositPayment({
                bookingId: params.bookingId,
                depositAmount: params.depositAmount,
                expiredAt: Math.floor(Date.now() / 1000) + 15 * 60, // 15 phút
            });

            setPaymentUrl(response.paymentUrl);
            setOrderCode(response.orderCode);

            console.log('✅ Payment URL created:', response.paymentUrl);
        } catch (error: any) {
            console.error('❌ Payment creation error:', error);
            Alert.alert(
                'Lỗi tạo thanh toán',
                error.message || 'Không thể tạo link thanh toán. Vui lòng thử lại.',
                [
                    {
                        text: 'Thử lại',
                        onPress: createPayment
                    },
                    {
                        text: 'Quay lại',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPayment = async () => {
        if (!paymentUrl) return;

        try {
            const supported = await Linking.canOpenURL(paymentUrl);
            if (supported) {
                await Linking.openURL(paymentUrl);
                // Bắt đầu polling để kiểm tra trạng thái thanh toán
                startPaymentVerification();
            } else {
                Alert.alert('Lỗi', 'Không thể mở link thanh toán');
            }
        } catch (error) {
            console.error('Error opening payment URL:', error);
            Alert.alert('Lỗi', 'Không thể mở link thanh toán');
        }
    };

    const startPaymentVerification = () => {
        setVerifying(true);
        Alert.alert(
            'Đang chờ thanh toán',
            'Vui lòng hoàn tất thanh toán trên trang PayOS. Hệ thống sẽ tự động kiểm tra khi bạn quay lại.',
            [
                {
                    text: 'Tôi đã thanh toán',
                    onPress: verifyPayment
                },
                {
                    text: 'Hủy',
                    style: 'cancel',
                    onPress: () => setVerifying(false)
                }
            ]
        );
    };

    const verifyPayment = async () => {
        if (!orderCode) return;

        try {
            setVerifying(true);
            console.log('🔍 Verifying payment:', orderCode);

            const response = await PaymentService.verifyPayment(orderCode);

            if (response.isPaid) {
                setPaymentStatus('success');
                Alert.alert(
                    'Thanh toán thành công!',
                    `Đã nhận được ${PaymentService.formatCurrency(response.paidAmount)}\n\nBooking của bạn đã được xác nhận.`,
                    [
                        {
                            text: 'Đóng',
                            onPress: () => {
                                // Quay về màn hình bookings
                                navigation.navigate('bookings' as never);
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(
                    'Chưa nhận được thanh toán',
                    'Hệ thống chưa phát hiện giao dịch. Vui lòng kiểm tra lại hoặc liên hệ hỗ trợ.',
                    [
                        {
                            text: 'Kiểm tra lại',
                            onPress: verifyPayment
                        },
                        {
                            text: 'Đóng',
                            style: 'cancel'
                        }
                    ]
                );
            }
        } catch (error: any) {
            console.error('❌ Payment verification error:', error);
            Alert.alert(
                'Lỗi kiểm tra thanh toán',
                error.message || 'Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại.'
            );
        } finally {
            setVerifying(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Hủy thanh toán?',
            'Bạn có chắc muốn hủy thanh toán? Booking sẽ vẫn được tạo nhưng chưa có tiền cọc.',
            [
                {
                    text: 'Tiếp tục thanh toán',
                    style: 'cancel'
                },
                {
                    text: 'Hủy',
                    style: 'destructive',
                    onPress: () => navigation.navigate('bookings' as never)
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={['#4a90e2', '#357abd']}
                    style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Đang tạo thanh toán...</Text>
                </LinearGradient>
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
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleCancel}>
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thanh toán đặt cọc</Text>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}>

                {/* Payment Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="card-outline" size={40} color="#4a90e2" />
                    </View>

                    <Text style={styles.infoTitle}>Thông tin thanh toán</Text>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Khách hàng:</Text>
                        <Text style={styles.infoValue}>{params.customerName}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phòng:</Text>
                        <Text style={styles.infoValue}>Phòng {params.roomNumber}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mã đơn hàng:</Text>
                        <Text style={styles.infoValue}>#{orderCode}</Text>
                    </View>

                    <View style={[styles.infoRow, styles.amountRow]}>
                        <Text style={styles.amountLabel}>Số tiền cọc:</Text>
                        <Text style={styles.amountValue}>
                            {PaymentService.formatCurrency(params.depositAmount)}
                        </Text>
                    </View>
                </View>

                {/* Instructions */}
                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>
                        <Ionicons name="information-circle" size={20} color="#4a90e2" />
                        {' '}Hướng dẫn thanh toán
                    </Text>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>1</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Nhấn nút Thanh toán ngay bên dưới
                        </Text>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>2</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Quét mã QR bằng app ngân hàng của bạn
                        </Text>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>3</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Xác nhận thanh toán trên app ngân hàng
                        </Text>
                    </View>

                    <View style={styles.instructionItem}>
                        <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>4</Text>
                        </View>
                        <Text style={styles.instructionText}>
                            Quay lại app và nhấn Tôi đã thanh toán
                        </Text>
                    </View>
                </View>

                {/* Warning */}
                <View style={styles.warningCard}>
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                    <Text style={styles.warningText}>
                        Link thanh toán có hiệu lực trong 15 phút
                    </Text>
                </View>

            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={verifying}>
                    <Text style={styles.cancelButtonText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.payButton, verifying && styles.payButtonDisabled]}
                    onPress={handleOpenPayment}
                    disabled={!paymentUrl || verifying}>
                    <LinearGradient
                        colors={verifying ? ['#94a3b8', '#64748b'] : ['#4a90e2', '#357abd']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.payButtonGradient}>
                        {verifying ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="card" size={20} color="#fff" />
                        )}
                        <Text style={styles.payButtonText}>
                            {verifying ? 'Đang kiểm tra...' : 'Thanh toán ngay'}
                        </Text>
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
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
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
        gap: 16,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#eff6ff',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 16,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    },
    amountRow: {
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        marginBottom: 0,
    },
    amountLabel: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '700',
    },
    amountValue: {
        fontSize: 20,
        color: '#4a90e2',
        fontWeight: '700',
    },
    instructionsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    instructionsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#4a90e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepNumberText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fffbeb',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#fef3c7',
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#92400e',
        fontWeight: '500',
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
    payButton: {
        flex: 2,
        borderRadius: 12,
        overflow: 'hidden',
    },
    payButtonDisabled: {
        opacity: 0.7,
    },
    payButtonGradient: {
        flexDirection: 'row',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    payButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
});