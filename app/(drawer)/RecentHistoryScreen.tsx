import bookingService from '@/services/bookingService';
import historyService, { HistoryRecord } from '@/services/historyService';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useState } from 'react';
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

const InvoiceModal = ({
    visible,
    record,
    onClose,
}: {
    visible: boolean;
    record: HistoryRecord | null;
    onClose: () => void;
}) => {
    const [recordWithServices, setRecordWithServices] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [printing, setPrinting] = useState(false);

    const fetchServices = useCallback(async () => {
        if (!record?.bookingId) return;
        try {
            setLoading(true);
            const data = await bookingService.getBookingWithServices(record.bookingId);
            setRecordWithServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    }, [record?.bookingId]);

    useEffect(() => {
        if (visible && record?.bookingId) {
            fetchServices();
        }
    }, [visible, record?.bookingId, fetchServices]);

    const generateInvoiceHTML = () => {
        if (!record) return '';

        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN');
        };

        const formatDateTime = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toLocaleString('vi-VN');
        };

        let servicesHTML = '';
        if (recordWithServices?.services && recordWithServices.services.length > 0) {
            servicesHTML = `
            <tr>
                <td colspan="2" style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Dịch vụ sử dụng:</td>
            </tr>
            ${recordWithServices.services.map((service: any) => `
                <tr>
                    <td style="padding: 8px 8px 8px 24px; border-bottom: 1px solid #e2e8f0;">• ${service.serviceName} x${service.quantity}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${service.totalPrice.toLocaleString('vi-VN')}đ</td>
                </tr>
            `).join('')}
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">Tổng dịch vụ:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">${record.serviceAmount.toLocaleString('vi-VN')}đ</td>
            </tr>
        `;
        } else if (record.serviceAmount > 0) {
            servicesHTML = `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Dịch vụ:</td>
                <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${record.serviceAmount.toLocaleString('vi-VN')}đ</td>
            </tr>
        `;
        }

        // ✅ THÊM PROMOTION HTML
        const promotionHTML = (record.promotionCode && record.discountAmount && record.discountAmount > 0) ? `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Khuyến mãi (${record.promotionCode}):</td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #22c55e; font-weight: 600;">-${record.discountAmount.toLocaleString('vi-VN')}đ</td>
        </tr>
    ` : '';

        const notesHTML = record.notes ? `
        <div style="margin-top: 24px; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
            <div style="font-weight: 700; font-size: 13px; color: #64748b; margin-bottom: 8px;">GHI CHÚ</div>
            <div style="font-size: 14px; color: #64748b;">${record.notes}</div>
        </div>
    ` : '';

        // ✅ TÍNH TOÁN ĐÚNG
        const totalBeforeDiscount = record.roomAmount + record.serviceAmount;
        const totalAfterDiscount = totalBeforeDiscount - (record.discountAmount || 0);

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Hóa đơn thanh toán</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 3px solid #4a90e2;
                    padding-bottom: 20px;
                }
                .hotel-name {
                    font-size: 28px;
                    font-weight: bold;
                    color: #1e293b;
                    margin-bottom: 8px;
                }
                .hotel-info {
                    font-size: 14px;
                    color: #64748b;
                    margin: 4px 0;
                }
                .invoice-title {
                    font-size: 24px;
                    font-weight: bold;
                    color: #4a90e2;
                    margin-top: 20px;
                }
                .section {
                    margin-bottom: 24px;
                }
                .section-title {
                    font-size: 13px;
                    font-weight: 700;
                    color: #64748b;
                    margin-bottom: 12px;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #e2e8f0;
                    padding-bottom: 8px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                td {
                    padding: 8px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .total-row {
                    border-top: 3px solid #4a90e2;
                    font-weight: bold;
                    font-size: 18px;
                    color: #4a90e2;
                }
                .timestamp {
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e2e8f0;
                }
                @media print {
                    body {
                        padding: 10px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="hotel-name">HOTEL START</div>
                <div class="hotel-info">Địa chỉ: Quy Nhơn</div>
                <div class="hotel-info">Số điện thoại: 0367287044</div>
                <div class="invoice-title">HÓA ĐƠN THANH TOÁN</div>
            </div>

            <div class="section">
                <div class="section-title">THÔNG TIN KHÁCH HÀNG</div>
                <table>
                    <tr>
                        <td style="width: 30%;">Họ tên:</td>
                        <td style="font-weight: 600;">${record.customerName}</td>
                    </tr>
                    <tr>
                        <td>Số điện thoại:</td>
                        <td style="font-weight: 600;">${record.phone}</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">THÔNG TIN PHÒNG</div>
                <table>
                    <tr>
                        <td style="width: 30%;">Số phòng:</td>
                        <td style="font-weight: 600;">Phòng ${record.roomNumber}</td>
                    </tr>
                    <tr>
                        <td>Check-in:</td>
                        <td style="font-weight: 600;">${formatDate(record.checkIn)}</td>
                    </tr>
                    <tr>
                        <td>Check-out:</td>
                        <td style="font-weight: 600;">${formatDate(record.checkOut)}</td>
                    </tr>
                    <tr>
                        <td>Số đêm:</td>
                        <td style="font-weight: 600;">${record.nights} đêm</td>
                    </tr>
                </table>
            </div>

            <div class="section">
                <div class="section-title">CHI TIẾT THANH TOÁN</div>
                <table>
                    <tr>
                        <td style="width: 60%;">Tiền phòng (${record.nights} đêm):</td>
                        <td style="text-align: right; font-weight: 600;">${record.roomAmount.toLocaleString('vi-VN')}đ</td>
                    </tr>
                    ${servicesHTML}
                    ${promotionHTML}
                    <tr>
                        <td>Tổng cộng:</td>
                        <td style="text-align: right; font-weight: 600;">${totalAfterDiscount.toLocaleString('vi-VN')}đ</td>
                    </tr>
                    <tr>
                        <td>Đã đặt cọc:</td>
                        <td style="text-align: right; font-weight: 600; color: #22c55e;">-${record.deposit.toLocaleString('vi-VN')}đ</td>
                    </tr>
                    <tr class="total-row">
                        <td style="padding-top: 16px;">ĐÃ THU KHI TRẢ PHÒNG:</td>
                        <td style="text-align: right; padding-top: 16px;">${record.totalAmount.toLocaleString('vi-VN')}đ</td>
                    </tr>
                </table>
            </div>

            ${notesHTML}

            <div class="timestamp">
                Ngày tạo: ${formatDateTime(record.createdAt || record.actualCheckOut)}
            </div>
        </body>
        </html>
    `;
    };

    const handlePrint = async () => {
        try {
            setPrinting(true);
            const html = generateInvoiceHTML();

            const { uri } = await Print.printToFileAsync({ html });

            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Thông báo', 'Đã lưu hóa đơn thành công!');
            }
        } catch (error) {
            console.error('Print error:', error);
            Alert.alert('Lỗi', 'Không thể in hóa đơn');
        } finally {
            setPrinting(false);
        }
    };

    if (!record) return null;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN');
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.invoiceContainer}>
                    <View style={styles.invoiceHeader}>
                        <Text style={styles.invoiceTitle}>HÓA ĐƠN THANH TOÁN</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.invoiceBody}>
                        {/* Thông tin khách sạn */}
                        <View style={styles.hotelSection}>
                            <Text style={styles.hotelName}>HOTEL START</Text>
                            <Text style={styles.hotelInfo}>Địa chỉ: Quy Nhơn</Text>
                            <Text style={styles.hotelInfo}>Số điện thoại: 0367287044</Text>
                        </View>

                        {/* Thông tin khách hàng */}
                        <View style={styles.invoiceSection}>
                            <Text style={styles.sectionTitle}>THÔNG TIN KHÁCH HÀNG</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Họ tên:</Text>
                                <Text style={styles.infoValue}>{record.customerName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                                <Text style={styles.infoValue}>{record.phone}</Text>
                            </View>
                        </View>

                        {/* Thông tin phòng */}
                        <View style={styles.invoiceSection}>
                            <Text style={styles.sectionTitle}>THÔNG TIN PHÒNG</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Số phòng:</Text>
                                <Text style={styles.infoValue}>Phòng {record.roomNumber}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Check-in:</Text>
                                <Text style={styles.infoValue}>{formatDate(record.checkIn)}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Check-out:</Text>
                                <Text style={styles.infoValue}>{formatDate(record.checkOut)}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Số đêm:</Text>
                                <Text style={styles.infoValue}>{record.nights} đêm</Text>
                            </View>
                        </View>

                        <View style={styles.invoiceSection}>
                            <Text style={styles.sectionTitle}>CHI TIẾT THANH TOÁN</Text>

                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Tiền phòng ({record.nights} đêm):</Text>
                                <Text style={styles.billValue}>
                                    {record.roomAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>

                            {loading ? (
                                <ActivityIndicator size="small" color="#4a90e2" />
                            ) : recordWithServices?.services && recordWithServices.services.length > 0 ? (
                                <>
                                    <View style={styles.servicesHeader}>
                                        <Text style={styles.billLabel}>Dịch vụ sử dụng:</Text>
                                    </View>
                                    {recordWithServices.services.map((service: any, index: number) => (
                                        <View key={index} style={styles.serviceRow}>
                                            <Text style={styles.serviceDetail}>
                                                • {service.serviceName} x{service.quantity}
                                            </Text>
                                            <Text style={styles.servicePrice}>
                                                {service.totalPrice.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </View>
                                    ))}
                                    <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>Tổng dịch vụ:</Text>
                                        <Text style={styles.billValue}>
                                            {record.serviceAmount.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                </>
                            ) : record.serviceAmount > 0 ? (
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Dịch vụ:</Text>
                                    <Text style={styles.billValue}>
                                        {record.serviceAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            ) : null}

                            {/* ✅ THÊM HIỂN THỊ KHUYẾN MÃI */}
                            {record.promotionCode && record.discountAmount && record.discountAmount > 0 && (
                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>
                                        Khuyến mãi ({record.promotionCode}):
                                    </Text>
                                    <Text style={[styles.billValue, { color: '#22c55e' }]}>
                                        -{record.discountAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            )}

                            <View style={styles.divider} />

                            {/* ✅ TỔNG CỘNG = room + service - discount */}
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Tổng cộng:</Text>
                                <Text style={styles.billValue}>
                                    {(record.roomAmount + record.serviceAmount - (record.discountAmount || 0)).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>

                            {/* ✅ TIỀN CỌC */}
                            <View style={styles.billRow}>
                                <Text style={styles.billLabel}>Đã đặt cọc:</Text>
                                <Text style={[styles.billValue, { color: '#22c55e' }]}>
                                    -{record.deposit.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>

                            {/* ✅ ĐÃ THU KHI TRẢ PHÒNG */}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>ĐÃ THU KHI TRẢ PHÒNG:</Text>
                                <Text style={styles.totalValue}>
                                    {record.totalAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </View>

                        {/* Ghi chú */}
                        {record.notes && (
                            <View style={styles.invoiceSection}>
                                <Text style={styles.sectionTitle}>GHI CHÚ</Text>
                                <Text style={styles.notesText}>{record.notes}</Text>
                            </View>
                        )}

                        {/* Thời gian tạo */}
                        {record.createdAt && (
                            <View style={styles.timestampContainer}>
                                <Text style={styles.timestampText}>
                                    Ngày tạo: {formatDateTime(record.createdAt)}
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={styles.invoiceActions}>
                        <TouchableOpacity
                            style={styles.printButton}
                            onPress={handlePrint}
                            disabled={printing}>
                            <LinearGradient
                                colors={['#4a90e2', '#357abd']}
                                style={styles.printButtonGradient}>
                                {printing ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="print" size={20} color="#fff" />
                                        <Text style={styles.printButtonText}>In hóa đơn</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default function RecentHistoryScreen() {
    const navigation = useNavigation<any>();
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);

    // Phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [])
    );

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const data = await historyService.getAllHistory();
            const sortedData = data.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.actualCheckOut);
                const dateB = new Date(b.createdAt || b.actualCheckOut);
                return dateB.getTime() - dateA.getTime();
            });
            setHistory(sortedData);
            setCurrentPage(1);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải lịch sử');
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(history.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = history.slice(startIndex, endIndex);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const handleViewInvoice = (record: HistoryRecord) => {
        setSelectedRecord(record);
        setShowInvoiceModal(true);
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
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Lịch sử gần đây</Text>
                        <View style={{ width: 24 }} />
                    </View>
                </LinearGradient>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            </View>
        );
    }

    // Tạo mảng các số trang để hiển thị
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4a90e2', '#357abd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.push('/rental')}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lịch sử gần đây</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerText}>
                        {history.length} giao dịch (Trang {currentPage}/{totalPages})
                    </Text>
                </View>

                {currentData.map((record, index) => (
                    <TouchableOpacity
                        key={record.id}
                        style={styles.historyCard}
                        onPress={() => handleViewInvoice(record)}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <View style={styles.roomBadge}>
                                    <Ionicons name="bed" size={16} color="#4a90e2" />
                                    <Text style={styles.roomBadgeText}>
                                        Phòng {record.roomNumber}
                                    </Text>
                                </View>
                                <View style={styles.timeBadge}>
                                    <Ionicons name="time-outline" size={12} color="#64748b" />
                                    <Text style={styles.timeText}>
                                        {formatDateTime(record.createdAt || record.actualCheckOut)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.invoiceButton}
                                onPress={() => handleViewInvoice(record)}>
                                <Ionicons name="receipt-outline" size={20} color="#4a90e2" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={16} color="#64748b" />
                                <Text style={styles.infoText}>{record.customerName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                                <Text style={styles.infoText}>
                                    {formatDate(record.checkIn)} → {formatDate(record.actualCheckOut)}
                                    {' '}({record.nights} đêm)
                                </Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Tổng thanh toán:</Text>
                                <Text style={styles.amountValue}>
                                    {record.totalAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {history.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
                        <Text style={styles.emptySubtitle}>
                            Lịch sử sẽ được lưu khi khách trả phòng
                        </Text>
                    </View>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                        <TouchableOpacity
                            style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
                            onPress={goToPreviousPage}
                            disabled={currentPage === 1}>
                            <Ionicons
                                name="chevron-back"
                                size={20}
                                color={currentPage === 1 ? '#cbd5e1' : '#4a90e2'}
                            />
                        </TouchableOpacity>

                        <View style={styles.pageNumbersContainer}>
                            {getPageNumbers().map((page, index) => (
                                page === '...' ? (
                                    <Text key={`dots-${index}`} style={styles.pageDots}>...</Text>
                                ) : (
                                    <TouchableOpacity
                                        key={page}
                                        style={[
                                            styles.pageNumberButton,
                                            currentPage === page && styles.pageNumberButtonActive
                                        ]}
                                        onPress={() => goToPage(page as number)}>
                                        <Text style={[
                                            styles.pageNumberText,
                                            currentPage === page && styles.pageNumberTextActive
                                        ]}>
                                            {page}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
                            onPress={goToNextPage}
                            disabled={currentPage === totalPages}>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={currentPage === totalPages ? '#cbd5e1' : '#4a90e2'}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <InvoiceModal
                visible={showInvoiceModal}
                record={selectedRecord}
                onClose={() => {
                    setShowInvoiceModal(false);
                    setSelectedRecord(null);
                }}
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
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#64748b',
    },
    content: {
        padding: 16,
    },
    headerRow: {
        marginBottom: 16,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    historyCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    roomBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#eff6ff',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    roomBadgeText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#4a90e2',
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
    },
    invoiceButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
    },
    cardBody: {
        padding: 12,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        flex: 1,
    },
    cardFooter: {
        padding: 12,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
    },
    amountValue: {
        fontSize: 16,
        color: '#4a90e2',
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
    },
    // Pagination styles
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
        gap: 8,
    },
    paginationButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    paginationButtonDisabled: {
        backgroundColor: '#f1f5f9',
    },
    pageNumbersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    pageNumberButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    pageNumberButtonActive: {
        backgroundColor: '#4a90e2',
    },
    pageNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    pageNumberTextActive: {
        color: '#fff',
    },
    pageDots: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
        paddingHorizontal: 4,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    invoiceContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    invoiceTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    invoiceBody: {
        padding: 20,
    },
    hotelSection: {
        alignItems: 'center',
        marginBottom: 24,
        paddingBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#4a90e2',
    },
    hotelName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    hotelInfo: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    invoiceSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#64748b',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    // Styles for invoice modal info section
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
        width: 120,
    },
    infoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
        flex: 1,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    billLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    billValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
    servicesHeader: {
        marginTop: 8,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 12,
        marginBottom: 4,
    },
    serviceDetail: {
        fontSize: 13,
        color: '#64748b',
        flex: 1,
    },
    servicePrice: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '600',
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
        paddingTop: 12,
        marginTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#4a90e2',
    },
    totalLabel: {
        fontSize: 16,
        color: '#1e293b',
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 20,
        color: '#4a90e2',
        fontWeight: '700',
    },
    notesText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
    timestampContainer: {
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    timestampText: {
        fontSize: 12,
        color: '#94a3b8',
        textAlign: 'center',
    },
    invoiceActions: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    printButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    printButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
    },
    printButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});