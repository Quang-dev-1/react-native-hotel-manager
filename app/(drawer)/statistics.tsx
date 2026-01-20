import financeService, { FinanceSummary, Transaction } from '@/services/financeService';
import historyService, { HistoryRecord } from '@/services/historyService';
import serviceAPI, { HotelService } from '@/services/hotelService';
import inventoryService, { Inventory } from '@/services/inventoryService';
import roomService, { Room } from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface StatisticsData {
    finance: FinanceSummary | null;
    transactions: Transaction[];
    history: HistoryRecord[];
    rooms: Room[];
    inventory: Inventory[];
    services: HotelService[];
    revenueByDay: { date: string; revenue: number }[];
    topServices: { name: string; count: number; revenue: number }[];
    roomOccupancy: { total: number; occupied: number; available: number; rate: number };
    inventoryValue: number;
    lowStockCount: number;
}

export default function StatisticsScreen() {
    const navigation = useNavigation<any>();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
    const [stats, setStats] = useState<StatisticsData>({
        finance: null,
        transactions: [],
        history: [],
        rooms: [],
        inventory: [],
        services: [],
        revenueByDay: [],
        topServices: [],
        roomOccupancy: { total: 0, occupied: 0, available: 0, rate: 0 },
        inventoryValue: 0,
        lowStockCount: 0,
    });

    const calculateRevenueByDay = (transactions: Transaction[]) => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const dayRevenue = transactions
                .filter(t => t.type === 'INCOME' && t.transactionDate === date)
                .reduce((sum: number, t) => sum + t.amount, 0);

            const [, month, day] = date.split('-');
            return {
                date: `${day}/${month}`,
                revenue: dayRevenue,
            };
        });
    };

    const calculateTopServices = () => {
        // Tạm thời return empty array - cần API trả về chi tiết services trong history
        return [];
    };

    const calculateRoomOccupancy = (rooms: Room[]) => {
        const total = rooms.length;
        const occupied = rooms.filter((r: Room) => r.status === 'OCCUPIED').length;
        const available = rooms.filter((r: Room) => r.status === 'AVAILABLE').length;
        const rate = total > 0 ? (occupied / total) * 100 : 0;

        return { total, occupied, available, rate };
    };

    const loadStatistics = useCallback(async () => {
        try {
            console.log('📊 Loading statistics...');

            // Load dữ liệu song song
            const [
                financeSummary,
                transactions,
                history,
                rooms,
                inventory,
                services,
            ] = await Promise.all([
                financeService.getFinanceSummary(period),
                financeService.getTransactions(period),
                historyService.getAllHistory(),
                roomService.getRooms(),
                inventoryService.getAllInventory(),
                serviceAPI.getAllServices(),
            ]);

            // Tính toán doanh thu theo ngày (7 ngày gần nhất)
            const revenueByDay = calculateRevenueByDay(transactions);

            // Top dịch vụ được sử dụng nhiều nhất
            const topServices = calculateTopServices();

            // Tỷ lệ lấp đầy phòng
            const roomOccupancy = calculateRoomOccupancy(rooms);

            // Giá trị tồn kho
            const inventoryValue = inventory.reduce((sum: number, item: Inventory) =>
                sum + (item.quantity * item.price), 0);

            // Số lượng hàng sắp hết
            const lowStockCount = inventory.filter((item: Inventory) =>
                item.quantity <= item.minStock).length;

            setStats({
                finance: financeSummary,
                transactions,
                history,
                rooms,
                inventory,
                services,
                revenueByDay,
                topServices,
                roomOccupancy,
                inventoryValue,
                lowStockCount,
            });

            console.log('✅ Statistics loaded');
        } catch (error: any) {
            console.error('❌ Load statistics error:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tải thống kê');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [period]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const onRefresh = () => {
        setRefreshing(true);
        loadStatistics();
    };

    const maxRevenue = Math.max(...stats.revenueByDay.map(d => d.revenue), 1);

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Đang tải thống kê...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4a90e2', '#357abd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        style={styles.menuButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    >
                        <Ionicons name="menu" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thống kê & Báo cáo</Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={onRefresh}
                        disabled={refreshing}
                    >
                        <Ionicons name="refresh" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#4a90e2']}
                    />
                }
            >
                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {(['day', 'week', 'month', 'year'] as const).map((p) => (
                        <TouchableOpacity
                            key={p}
                            style={[
                                styles.periodButton,
                                period === p && styles.periodButtonActive,
                            ]}
                            onPress={() => setPeriod(p)}
                        >
                            <Text
                                style={[
                                    styles.periodButtonText,
                                    period === p && styles.periodButtonTextActive,
                                ]}
                            >
                                {p === 'day' && 'Ngày'}
                                {p === 'week' && 'Tuần'}
                                {p === 'month' && 'Tháng'}
                                {p === 'year' && 'Năm'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Finance Summary */}
                {stats.finance && (
                    <View style={styles.financeContainer}>
                        <Text style={styles.sectionTitle}>Tổng quan tài chính</Text>
                        <View style={styles.financeGrid}>
                            <View style={[styles.financeCard, { backgroundColor: '#dcfce7' }]}>
                                <Ionicons name="trending-up" size={32} color="#22c55e" />
                                <Text style={styles.financeLabel}>Thu nhập</Text>
                                <Text style={[styles.financeValue, { color: '#22c55e' }]}>
                                    {stats.finance.totalIncome.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            <View style={[styles.financeCard, { backgroundColor: '#fee2e2' }]}>
                                <Ionicons name="trending-down" size={32} color="#ef4444" />
                                <Text style={styles.financeLabel}>Chi phí</Text>
                                <Text style={[styles.financeValue, { color: '#ef4444' }]}>
                                    {stats.finance.totalExpense.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            <View style={[styles.financeCard, { backgroundColor: '#dbeafe', marginTop: 12 }]}>
                                <Ionicons name="wallet" size={32} color="#4a90e2" />
                                <Text style={styles.financeLabel}>Lợi nhuận</Text>
                                <Text style={[styles.financeValue, { color: '#4a90e2' }]}>
                                    {stats.finance.profit.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Revenue Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.sectionTitle}>Doanh thu 7 ngày gần nhất</Text>
                    <View style={styles.chart}>
                        {stats.revenueByDay.map((item, index) => (
                            <View key={index} style={styles.chartBar}>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%`,
                                            },
                                        ]}
                                    >
                                        <LinearGradient
                                            colors={['#60a5fa', '#3b82f6']}
                                            style={styles.barGradient}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.barValue}>
                                    {(item.revenue / 1000).toFixed(0)}k
                                </Text>
                                <Text style={styles.chartLabel}>{item.date}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Room Statistics */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Thống kê phòng</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Ionicons name="business" size={24} color="#4a90e2" />
                            <Text style={styles.statBoxValue}>{stats.roomOccupancy.total}</Text>
                            <Text style={styles.statBoxLabel}>Tổng phòng</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Ionicons name="bed" size={24} color="#22c55e" />
                            <Text style={styles.statBoxValue}>{stats.roomOccupancy.occupied}</Text>
                            <Text style={styles.statBoxLabel}>Đang thuê</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Ionicons name="checkmark-circle" size={24} color="#06b6d4" />
                            <Text style={styles.statBoxValue}>{stats.roomOccupancy.available}</Text>
                            <Text style={styles.statBoxLabel}>Còn trống</Text>
                        </View>
                    </View>
                    <View style={styles.occupancyBarContainer}>
                        <Text style={styles.occupancyLabel}>Tỷ lệ lấp đầy</Text>
                        <View style={styles.occupancyBar}>
                            <View
                                style={[
                                    styles.occupancyFill,
                                    { width: `${stats.roomOccupancy.rate}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.occupancyText}>
                            {stats.roomOccupancy.rate.toFixed(1)}%
                        </Text>
                    </View>
                </View>

                {/* Inventory Statistics */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Thống kê kho</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { flex: 1 }]}>
                            <Ionicons name="cube" size={24} color="#8b5cf6" />
                            <Text style={styles.statBoxValue}>{stats.inventory.length}</Text>
                            <Text style={styles.statBoxLabel}>Tổng mặt hàng</Text>
                        </View>
                        <View style={[styles.statBox, { flex: 1 }]}>
                            <Ionicons name="cash" size={24} color="#f59e0b" />
                            <Text style={styles.statBoxValue}>
                                {(stats.inventoryValue / 1000000).toFixed(1)}M
                            </Text>
                            <Text style={styles.statBoxLabel}>Giá trị kho</Text>
                        </View>
                        <View style={[styles.statBox, { flex: 1 }]}>
                            <Ionicons name="warning" size={24} color="#ef4444" />
                            <Text style={styles.statBoxValue}>{stats.lowStockCount}</Text>
                            <Text style={styles.statBoxLabel}>Sắp hết</Text>
                        </View>
                    </View>
                </View>

                {/* Transaction Summary */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Giao dịch</Text>
                    <View style={styles.statsRow}>
                        <View style={[styles.statBox, { flex: 1 }]}>
                            <Ionicons name="swap-horizontal" size={24} color="#64748b" />
                            <Text style={styles.statBoxValue}>{stats.transactions.length}</Text>
                            <Text style={styles.statBoxLabel}>Tổng giao dịch</Text>
                        </View>
                        <View style={[styles.statBox, { flex: 1 }]}>
                            <Ionicons name="time" size={24} color="#ec4899" />
                            <Text style={styles.statBoxValue}>{stats.history.length}</Text>
                            <Text style={styles.statBoxLabel}>Lịch sử checkout</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
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
    refreshButton: {
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
    periodSelector: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    periodButtonActive: {
        backgroundColor: '#4a90e2',
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    periodButtonTextActive: {
        color: '#fff',
    },
    financeContainer: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    financeGrid: {
        gap: 12,
    },
    financeCard: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    financeLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 8,
    },
    financeValue: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 4,
    },
    chartContainer: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    chart: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        paddingVertical: 10,
        paddingHorizontal: 8,
    },
    chartBar: {
        alignItems: 'center',
        width: 40,
    },
    barContainer: {
        height: 150,
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: '80%',
        borderRadius: 6,
        overflow: 'hidden',
        minHeight: 4,
    },
    barGradient: {
        flex: 1,
        width: '100%',
    },
    barValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 6,
    },
    chartLabel: {
        marginTop: 2,
        fontSize: 10,
        color: '#64748b',
        fontWeight: '600',
    },
    statsContainer: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 0,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
    },
    statBoxValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
    },
    statBoxLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    occupancyBarContainer: {
        marginTop: 16,
    },
    occupancyLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 8,
    },
    occupancyBar: {
        height: 12,
        backgroundColor: '#e2e8f0',
        borderRadius: 6,
        overflow: 'hidden',
    },
    occupancyFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 6,
    },
    occupancyText: {
        marginTop: 6,
        fontSize: 13,
        color: '#4a90e2',
        textAlign: 'center',
        fontWeight: '600',
    },
});