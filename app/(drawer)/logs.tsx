import bookingService from '@/services/bookingService';
import historyService, { HistoryRecord } from '@/services/historyService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const ITEMS_PER_PAGE = 5;

export default function LogsScreen() {
    const navigation = useNavigation<any>();
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [historyWithServices, setHistoryWithServices] = useState<{ [key: number]: any }>({});
    const [currentPage, setCurrentPage] = useState(1);

    const fetchHistoryWithServices = async (historyId: number, bookingId: number) => {
        try {
            const bookingDetail = await bookingService.getBookingWithServices(bookingId);
            setHistoryWithServices(prev => ({
                ...prev,
                [historyId]: bookingDetail
            }));
        } catch (error) {
            console.error('Error fetching history services:', error);
        }
    };

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

            setLoading(false);

            loadServicesInBackground(sortedData);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải lịch sử');
            setLoading(false);
        }
    };

    const loadServicesInBackground = async (historyData: HistoryRecord[]) => {
        for (const record of historyData) {
            if (record.id && record.bookingId) {
                try {
                    await fetchHistoryWithServices(record.id, record.bookingId);
                } catch (error) {
                    console.log(`Skipping booking ${record.bookingId} - already completed`);
                }
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchHistory();
            setCurrentPage(1);
        }, [])
    );

    const filteredHistory = history.filter(record =>
        record.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.phone.includes(searchQuery)
    );

    // Phân trang
    const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = filteredHistory.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            'Xóa lịch sử',
            'Bạn có chắc muốn xóa bản ghi này khỏi lịch sử?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await historyService.deleteHistory(id);
                            Alert.alert('Thành công', 'Đã xóa lịch sử');
                            fetchHistory();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN');
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
                        <Text style={styles.headerTitle}>Lịch sử</Text>
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
                    <TouchableOpacity onPress={() => router.push('/system')}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lịch sử</Text>
                </View>
            </LinearGradient>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm theo phòng, khách hàng, SĐT..."
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            setCurrentPage(1);
                        }}
                        placeholderTextColor="#94a3b8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => {
                            setSearchQuery('');
                            setCurrentPage(1);
                        }}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}>
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Ionicons name="receipt-outline" size={32} color="#4a90e2" />
                        <Text style={styles.statNumber}>
                            {history.reduce((sum, h) => sum + h.roomAmount + h.serviceAmount, 0).toLocaleString('vi-VN')}đ
                        </Text>
                        <Text style={styles.statLabel}>Tổng doanh thu</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="cash-outline" size={32} color="#22c55e" />
                        <Text style={styles.statNumber}>
                            {history.reduce((sum, h) => sum + h.totalAmount, 0).toLocaleString('vi-VN')}đ
                        </Text>
                        <Text style={styles.statLabel}>Tổng thu thực tế</Text>
                    </View>
                </View>

                <View style={styles.headerRow}>
                    <Text style={styles.headerText}>
                        {filteredHistory.length} bản ghi
                    </Text>
                    {totalPages > 1 && (
                        <Text style={styles.pageInfo}>
                            Trang {currentPage}/{totalPages}
                        </Text>
                    )}
                </View>

                {currentPageData.map(record => (
                    <View key={record.id} style={styles.historyCard}>
                        <View style={styles.cardHeader}>
                            <View style={styles.cardHeaderLeft}>
                                <View style={styles.roomBadge}>
                                    <Ionicons name="bed" size={16} color="#4a90e2" />
                                    <Text style={styles.roomBadgeText}>
                                        Phòng {record.roomNumber}
                                    </Text>
                                </View>
                                <View style={styles.dateBadge}>
                                    <Ionicons name="calendar-outline" size={12} color="#64748b" />
                                    <Text style={styles.dateText}>
                                        {formatDate(record.actualCheckOut)}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(record.id!)}>
                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.cardBody}>
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={16} color="#64748b" />
                                <Text style={styles.infoText}>{record.customerName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="call-outline" size={16} color="#64748b" />
                                <Text style={styles.infoText}>{record.phone}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="time-outline" size={16} color="#64748b" />
                                <Text style={styles.infoText}>
                                    {formatDate(record.checkIn)} → {formatDate(record.checkOut)}
                                    {' '}({record.nights} đêm)
                                </Text>
                            </View>
                            {record.notes && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="document-text-outline" size={16} color="#64748b" />
                                    <Text style={styles.infoText}>{record.notes}</Text>
                                </View>
                            )}
                        </View>
                        {historyWithServices[record.id!] &&
                            historyWithServices[record.id!].services &&
                            historyWithServices[record.id!].services.length > 0 && (
                                <View style={styles.servicesSection}>
                                    <View style={styles.servicesSectionHeader}>
                                        <Ionicons name="cube-outline" size={14} color="#4a90e2" />
                                        <Text style={styles.servicesSectionTitle}>Dịch vụ đã sử dụng:</Text>
                                    </View>
                                    {historyWithServices[record.id!].services.map((service: any, index: number) => (
                                        <View key={index} style={styles.serviceItem}>
                                            <Text style={styles.serviceItemName}>
                                                • {service.serviceName} x{service.quantity}
                                            </Text>
                                            <Text style={styles.serviceItemPrice}>
                                                {service.totalPrice.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        <View style={styles.cardFooter}>
                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Tiền phòng:</Text>
                                <Text style={styles.amountValue}>
                                    {record.roomAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            {record.serviceAmount > 0 && (
                                <View style={styles.amountRow}>
                                    <Text style={styles.amountLabel}>Dịch vụ:</Text>
                                    <Text style={styles.amountValue}>
                                        {record.serviceAmount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </View>
                            )}
                            {record.promotionCode && record.discountAmount && record.discountAmount > 0 && (
                                <View style={styles.promotionSection}>
                                    <View style={styles.promotionHeader}>
                                        <Ionicons name="pricetag" size={14} color="#8b5cf6" />
                                        <Text style={styles.promotionHeaderText}>Khuyến mãi</Text>
                                    </View>
                                    <View style={styles.amountRow}>
                                        <Text style={styles.promotionCodeLabel}>
                                            {record.promotionCode}
                                            {record.promotionName && ` - ${record.promotionName}`}
                                        </Text>
                                        <Text style={styles.promotionDiscountValue}>
                                            -{record.discountAmount.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                </View>
                            )}

                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Tổng cộng:</Text>
                                <Text style={styles.amountValue}>
                                    {(record.roomAmount + record.serviceAmount - (record.discountAmount || 0)).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>

                            <View style={styles.amountRow}>
                                <Text style={styles.amountLabel}>Đã đặt cọc:</Text>
                                <Text style={styles.amountValue}>
                                    {record.deposit.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>

                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>Đã thu khi trả phòng:</Text>
                                <Text style={styles.totalValue}>
                                    {record.totalAmount.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </View>

                        {record.createdAt && (
                            <View style={styles.timestampRow}>
                                <Ionicons name="time-outline" size={12} color="#94a3b8" />
                                <Text style={styles.timestampText}>
                                    Lưu lúc: {formatDateTime(record.createdAt)}
                                </Text>
                            </View>
                        )}
                    </View>
                ))}

                {filteredHistory.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>Chưa có lịch sử</Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? 'Không tìm thấy kết quả phù hợp'
                                : 'Lịch sử sẽ được lưu khi khách trả phòng'}
                        </Text>
                    </View>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                        <TouchableOpacity
                            style={[
                                styles.paginationButton,
                                currentPage === 1 && styles.paginationButtonDisabled
                            ]}
                            onPress={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}>
                            <Ionicons
                                name="chevron-back"
                                size={20}
                                color={currentPage === 1 ? '#cbd5e1' : '#4a90e2'}
                            />
                        </TouchableOpacity>

                        <View style={styles.paginationNumbers}>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <TouchableOpacity
                                    key={page}
                                    style={[
                                        styles.paginationNumber,
                                        currentPage === page && styles.paginationNumberActive
                                    ]}
                                    onPress={() => handlePageChange(page)}>
                                    <Text
                                        style={[
                                            styles.paginationNumberText,
                                            currentPage === page && styles.paginationNumberTextActive
                                        ]}>
                                        {page}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.paginationButton,
                                currentPage === totalPages && styles.paginationButtonDisabled
                            ]}
                            onPress={() => handlePageChange(currentPage + 1)}
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
    searchSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 48,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    content: {
        padding: 16,
    },
    statsCard: {
        flexDirection: 'row',
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
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 16,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    pageInfo: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
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
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    dateText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748b',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fee2e2',
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
        gap: 6,
    },
    amountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    amountLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    amountValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        marginTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    totalLabel: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '700',
    },
    totalValue: {
        fontSize: 16,
        color: '#4a90e2',
        fontWeight: '700',
    },
    timestampRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fafbfc',
    },
    timestampText: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
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
    servicesSection: {
        padding: 12,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    servicesSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    servicesSectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },
    serviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 4,
        paddingLeft: 16,
    },
    serviceItemName: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        flex: 1,
    },
    serviceItemPrice: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '600',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
        gap: 12,
    },
    paginationButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    paginationButtonDisabled: {
        backgroundColor: '#f8fafc',
    },
    paginationNumbers: {
        flexDirection: 'row',
        gap: 8,
    },
    paginationNumber: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    paginationNumberActive: {
        backgroundColor: '#4a90e2',
    },
    paginationNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    paginationNumberTextActive: {
        color: '#fff',
    },
    promotionSection: {
        backgroundColor: '#faf5ff',
        padding: 8,
        borderRadius: 8,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#e9d5ff',
    },
    promotionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    promotionHeaderText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8b5cf6',
    },
    promotionCodeLabel: {
        fontSize: 13,
        color: '#6b21a8',
        fontWeight: '500',
        flex: 1,
    },
    promotionDiscountValue: {
        fontSize: 14,
        color: '#22c55e',
        fontWeight: '700',
    },
});