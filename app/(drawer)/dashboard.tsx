import BookingService, { DashboardStats } from '@/services/bookingService';
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
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadDashboardStats = async () => {
        try {
            console.log('📊 Loading dashboard stats...');
            const data = await BookingService.getDashboardStats();
            setStats(data);
            console.log('✅ Dashboard stats loaded:', data);
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

    useEffect(() => {
        loadDashboardStats();

        const interval = setInterval(() => {
            loadDashboardStats();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardStats();
    };

    const statCards = [
        {
            icon: 'person-outline',
            label: 'Thuê trong ngày',
            value: stats.todayRentals,
            color: ['#93c5fd', '#3b82f6'],
            bgColor: '#dbeafe',
            filter: 'today'
        },
        {
            icon: 'bed-outline',
            label: 'Phòng chờ',
            value: stats.waitingRooms,
            color: ['#86efac', '#22c55e'],
            bgColor: '#dcfce7',
            filter: 'waiting'
        },
        {
            icon: 'location-outline',
            label: 'Phòng đang thuê',
            value: stats.occupiedRooms,
            color: ['#fde68a', '#f59e0b'],
            bgColor: '#fef3c7',
            filter: 'occupied'
        },
        {
            icon: 'brush-outline',
            label: 'Phòng cần dọn',
            value: stats.cleaningRooms,
            color: ['#ddd6fe', '#8b5cf6'],
            bgColor: '#ede9fe',
            filter: 'cleaning'
        },
    ];

    const chartData = [
        { date: 'Hôm qua', value: 0 },
        { date: 'Hôm nay', value: stats.todayRentals },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    const handleCardPress = (filter: string) => {
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

                    <View style={styles.chart}>
                        {chartData.map((item, index) => (
                            <View key={index} style={styles.chartBar}>
                                <View style={styles.barContainer}>
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: `${(item.value / maxValue) * 100}%`,
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
        // Animation sẽ được thêm vào nếu cần
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
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 200,
        paddingVertical: 10,
    },
    chartBar: {
        alignItems: 'center',
        flex: 1,
    },
    barContainer: {
        height: 150,
        width: 60,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    bar: {
        width: 50,
        borderRadius: 8,
        overflow: 'hidden',
        minHeight: 4,
    },
    barGradient: {
        flex: 1,
        width: '100%',
    },
    barValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 8,
    },
    chartLabel: {
        marginTop: 4,
        fontSize: 12,
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
});