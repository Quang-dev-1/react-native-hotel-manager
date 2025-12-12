import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
    const navigation = useNavigation<any>();
    const { getBookingStats } = useBooking();
    const stats = getBookingStats();
    const [selectedDate] = useState('17/12/2025');

    const statCards = [
        {
            icon: 'person-outline',
            label: 'Thuê trong ngày',
            value: stats.todayRentals,
            color: ['#93c5fd', '#3b82f6'],
            bgColor: '#dbeafe',
            filter: 'available'
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
        { date: '08/12', value: 0 },
        { date: '15/12', value: stats.todayRentals },
    ];

    const maxValue = Math.max(...chartData.map(d => d.value), 1);

    const handleCardPress = (filter: string) => {
        navigation.dispatch(DrawerActions.closeDrawer());

        navigation.navigate('rental', { filter });
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
                        style={styles.menuButton}
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                        <Ionicons name="menu" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Thông tin hệ thống</Text>
                </View>
            </LinearGradient>

            <ScrollView showsVerticalScrollIndicator={false}>
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
                                <Text style={styles.chartLabel}>{item.date}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.yAxis}>
                        <Text style={styles.yAxisLabel}>{maxValue}</Text>
                        <Text style={styles.yAxisLabel}>0</Text>
                    </View>
                </View>

                <View style={styles.bottomInfo}>
                    <View style={styles.infoCard}>
                        <View style={styles.infoIcon}>
                            <Ionicons name="calendar" size={24} color="#4a90e2" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoValue}>{selectedDate}</Text>
                            <Text style={styles.infoLabel}>Ngày được chọn</Text>
                        </View>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={[styles.infoIcon, { backgroundColor: '#dcfce7' }]}>
                            <Ionicons name="person" size={24} color="#22c55e" />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoValue}>{stats.todayRentals}</Text>
                            <Text style={styles.infoLabel}>lượt thuê</Text>
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
        height: 180,
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
    chartLabel: {
        marginTop: 8,
        fontSize: 12,
        color: '#64748b',
        fontWeight: '600',
    },
    yAxis: {
        position: 'absolute',
        left: 0,
        top: 60,
        height: 180,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    yAxisLabel: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '600',
    },
    bottomInfo: {
        flexDirection: 'row',
        padding: 16,
        paddingTop: 0,
        gap: 12,
    },
    infoCard: {
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
    infoIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
    },
    infoValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    infoLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
});