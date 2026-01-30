import BookingService, { DashboardStats } from '@/services/bookingService';
import financeService, { FinanceSummary } from '@/services/financeService';
import roomService from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface ChartData {
    date: string;
    value: number;
}

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const [stats, setStats] = useState<DashboardStats>({
        todayRentals: 0,
        occupiedRooms: 0,
        waitingRooms: 0,
        cleaningRooms: 0,
        totalRooms: 0,
        availableRooms: 0,
    });
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    const loadDashboardStats = async () => {
        try {
            console.log('📊 Loading dashboard stats...');

            // Lấy tất cả bookings và rooms
            const allBookings = await BookingService.getAllBookings();
            const allRooms = await roomService.getRooms();

            // Đếm đúng từ bookings thay vì tin backend
            const today = new Date().toISOString().split('T')[0];

            // 1. Thuê trong ngày (bookings tạo hôm nay)
            const todayRentals = allBookings.filter(b => {
                if (!b.createdAt) return false;
                const createdDate = new Date(b.createdAt).toISOString().split('T')[0];
                return createdDate === today;
            }).length;

            // 2. Phòng chờ xác nhận (PENDING + CONFIRMED)
            const waitingRooms = allBookings.filter(b =>
                b.status === 'PENDING' || b.status === 'CONFIRMED'
            ).length;

            // 3. Phòng đang thuê (CHECKED_IN)
            const occupiedRooms = allBookings.filter(b =>
                b.status === 'CHECKED_IN'
            ).length;

            // 4. Phòng cần dọn (CHECKED_OUT)
            const cleaningRooms = allBookings.filter(b =>
                b.status === 'CHECKED_OUT'
            ).length;

            // 5. Tổng số phòng
            const totalRooms = allRooms.length;

            // 6. Phòng trống (status = AVAILABLE)
            const availableRooms = allRooms.filter(r =>
                r.status === 'AVAILABLE'
            ).length;

            const correctedStats = {
                todayRentals,
                occupiedRooms,
                waitingRooms,
                cleaningRooms,
                totalRooms,
                availableRooms,
            };

            console.log('✅ Corrected stats:', correctedStats);
            setStats(correctedStats);

            const summary = await financeService.getFinanceSummary('month');
            setFinanceSummary(summary);

            await loadRentalChart(currentWeekOffset);
        } catch (error: any) {
            console.error('❌ Load dashboard stats error:', error);
            Alert.alert(
                'Lỗi',
                error.message || 'Không thể tải thống kê',
                [{ text: 'OK' }]
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadRentalChart = async (weekOffset: number = 0) => {
        try {
            console.log('📈 Loading rental chart data...');

            const allBookings = await BookingService.getAllBookings();

            const today = new Date();
            const currentDay = today.getDay();
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

            const monday = new Date(today);
            monday.setDate(today.getDate() + mondayOffset + (weekOffset * 7));
            monday.setHours(0, 0, 0, 0);

            const weekData: ChartData[] = [];
            const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(monday);
                currentDate.setDate(monday.getDate() + i);
                const dateStr = currentDate.toISOString().split('T')[0];

                const dayRentals = allBookings.filter(b => {
                    if (!b.createdAt) return false;
                    const createdDate = new Date(b.createdAt);
                    createdDate.setHours(0, 0, 0, 0);
                    return createdDate.toISOString().split('T')[0] === dateStr;
                }).length;

                weekData.push({
                    date: `${dayNames[i]} ${currentDate.getDate()}/${currentDate.getMonth() + 1}`,
                    value: dayRentals
                });
            }

            setChartData(weekData);
            console.log('✅ Chart data loaded:', weekData);
        } catch (error) {
            console.error('❌ Load chart data error:', error);
            setChartData([]);
        }
    };

    useEffect(() => {
        loadDashboardStats();

        const interval = setInterval(() => {
            loadDashboardStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!loading) {
            loadRentalChart(currentWeekOffset);
        }
    }, [currentWeekOffset]);

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardStats();
    };

    const goToPreviousWeek = () => {
        setCurrentWeekOffset(prev => prev - 1);
    };

    const goToNextWeek = () => {
        setCurrentWeekOffset(prev => prev + 1);
    };

    const goToCurrentWeek = () => {
        setCurrentWeekOffset(0);
    };

    const statCards = [
        {
            icon: 'person-outline',
            label: 'Thuê trong ngày',
            value: stats.todayRentals,
            color: ['#93c5fd', '#3b82f6'],
            bgColor: '#dbeafe',
            filter: 'all'
        },
        {
            icon: 'time-outline',
            label: 'Phòng chờ xác nhận',
            value: stats.waitingRooms,
            color: ['#fde68a', '#f59e0b'],
            bgColor: '#fef3c7',
            filter: 'PENDING'
        },
        {
            icon: 'bed-outline',
            label: 'Phòng đang thuê',
            value: stats.occupiedRooms,
            color: ['#86efac', '#22c55e'],
            bgColor: '#dcfce7',
            filter: 'CHECKED_IN'
        },
        {
            icon: 'brush-outline',
            label: 'Phòng cần dọn',
            value: stats.cleaningRooms,
            color: ['#fce7f3', '#ec4899'],
            bgColor: '#fce7f3',
            filter: 'CHECKED_OUT'
        },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    const handleCardPress = (filter: string) => {
        console.log('🔵 Navigating to rental with filter:', filter);
        navigation.dispatch(DrawerActions.closeDrawer());
        navigation.navigate('rental', { filter });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
                    <Text style={styles.headerTitle}>Thông tin hệ thống</Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={onRefresh}
                        disabled={refreshing}>
                        <Ionicons
                            name="refresh"
                            size={24}
                            color="#fff"
                            style={refreshing ? styles.rotating : undefined}
                        />
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
                <View style={styles.statsGrid}>
                    {statCards.map((card, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.statCard}
                            activeOpacity={0.7}
                            onPress={() => handleCardPress(card.filter)}
                        >
                            <View style={[styles.statCardInner, { backgroundColor: card.bgColor }]}>
                                <View style={styles.statIcon}>
                                    <Ionicons name={card.icon as any} size={32} color={card.color[1]} />
                                </View>
                                <Text style={styles.statValue}>{card.value}</Text>
                                <Text style={styles.statLabel}>{card.label}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Ionicons name="business-outline" size={24} color="#4a90e2" />
                        <View style={styles.summaryText}>
                            <Text style={styles.summaryValue}>{stats.totalRooms}</Text>
                            <Text style={styles.summaryLabel}>Tổng số phòng</Text>
                        </View>
                    </View>
                    <View style={styles.summaryCard}>
                        <Ionicons name="checkmark-circle-outline" size={24} color="#22c55e" />
                        <View style={styles.summaryText}>
                            <Text style={styles.summaryValue}>{stats.availableRooms}</Text>
                            <Text style={styles.summaryLabel}>Phòng trống</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.chartContainer}>
                    <View style={styles.chartHeader}>
                        <Ionicons name="bar-chart-outline" size={24} color="#4a90e2" />
                        <Text style={styles.chartTitle}>Lượt thuê phòng</Text>
                    </View>

                    <View style={styles.weekNavigation}>
                        <TouchableOpacity
                            style={styles.weekButton}
                            onPress={goToPreviousWeek}
                        >
                            <Ionicons name="chevron-back" size={20} color="#4a90e2" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.currentWeekButton}
                            onPress={goToCurrentWeek}
                            disabled={currentWeekOffset === 0}
                        >
                            <Text style={[
                                styles.weekButtonText,
                                currentWeekOffset === 0 && styles.weekButtonTextActive
                            ]}>
                                {currentWeekOffset === 0 ? 'Tuần này' :
                                    currentWeekOffset < 0 ? `${Math.abs(currentWeekOffset)} tuần trước` :
                                        `${currentWeekOffset} tuần sau`}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.weekButton}
                            onPress={goToNextWeek}
                            disabled={currentWeekOffset >= 0}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={currentWeekOffset >= 0 ? '#cbd5e1' : '#4a90e2'}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.chart}>
                        {chartData.map((item, index) => (
                            <View key={index} style={styles.chartBar}>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                            },
                                        ]}>
                                        <LinearGradient
                                            colors={['#60a5fa', '#3b82f6']}
                                            style={styles.barGradient}
                                        />
                                    </View>
                                </View>
                                <Text style={styles.barValue}>{item.value}</Text>
                                <Text style={styles.chartLabel}>{item.date}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.yAxis}>
                        <Text style={styles.yAxisLabel}>{maxValue}</Text>
                        <Text style={styles.yAxisLabel}>0</Text>
                    </View>
                </View>

                <View style={styles.occupancyContainer}>
                    <Text style={styles.sectionTitle}>Tỷ lệ sử dụng phòng</Text>
                    <View style={styles.occupancyBar}>
                        <View
                            style={[
                                styles.occupancyFill,
                                {
                                    width: `${stats.totalRooms > 0
                                        ? (stats.occupiedRooms / stats.totalRooms * 100)
                                        : 0}%`
                                }
                            ]}
                        />
                    </View>
                    <Text style={styles.occupancyText}>
                        {stats.totalRooms > 0
                            ? Math.round(stats.occupiedRooms / stats.totalRooms * 100)
                            : 0}% phòng đang được sử dụng
                    </Text>
                </View>
                {financeSummary && (
                    <View style={styles.financeContainer}>
                        <Text style={styles.sectionTitle}>Tài chính tháng này</Text>
                        <View style={styles.financeRow}>
                            <View style={styles.financeCard}>
                                <Ionicons name="trending-up" size={24} color="#22c55e" />
                                <Text style={styles.financeLabel}>Thu nhập</Text>
                                <Text style={[styles.financeValue, { color: '#22c55e' }]}>
                                    {financeSummary.totalIncome.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                            <View style={styles.financeCard}>
                                <Ionicons name="trending-down" size={24} color="#ef4444" />
                                <Text style={styles.financeLabel}>Chi phí</Text>
                                <Text style={[styles.financeValue, { color: '#ef4444' }]}>
                                    {financeSummary.totalExpense.toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.financeCard, { marginTop: 12 }]}>
                            <Ionicons name="wallet" size={24} color="#4a90e2" />
                            <Text style={styles.financeLabel}>Lợi nhuận</Text>
                            <Text style={[styles.financeValue, { color: '#4a90e2' }]}>
                                {financeSummary.profit.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
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
    rotating: {

    },
    weekNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    weekButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentWeekButton: {
        flex: 1,
        marginHorizontal: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
    },
    weekButtonText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
    },
    weekButtonTextActive: {
        color: '#4a90e2',
        fontWeight: '700',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        gap: 12,
    },
    statCard: {
        width: (screenWidth - 36) / 2,
    },
    statCardInner: {
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 160,
    },
    statIcon: {
        marginBottom: 12,
    },
    statValue: {
        fontSize: 36,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        textAlign: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 0,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryText: {
        flex: 1,
    },
    summaryValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    summaryLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    chartContainer: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 8,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
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
    yAxis: {
        position: 'absolute',
        left: 0,
        top: 60,
        height: 150,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    yAxisLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    occupancyContainer: {
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
        marginTop: 8,
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
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
    financeRow: {
        flexDirection: 'row',
        gap: 12,
    },
    financeCard: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    financeLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '600',
        marginTop: 8,
    },
    financeValue: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    }
});