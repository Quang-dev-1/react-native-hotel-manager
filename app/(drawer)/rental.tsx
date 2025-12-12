import { useBooking } from '@/contexts/BookingContext';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RentalScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { rooms, bookings } = useBooking();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'occupied' | 'waiting' | 'cleaning'>('all');

    const { filter } = route.params as { filter?: string };

    useEffect(() => {
        if (filter) {
            if (['all', 'available', 'occupied', 'waiting', 'cleaning'].includes(filter)) {
                setSelectedStatus(filter as any);
            }
        }
    }, [filter]);

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const statusColors = {
        available: { bg: '#dcfce7', text: '#166534', icon: 'checkmark-circle' },
        occupied: { bg: '#fef3c7', text: '#92400e', icon: 'person' },
        waiting: { bg: '#dbeafe', text: '#1e40af', icon: 'time' },
        cleaning: { bg: '#ede9fe', text: '#6b21a8', icon: 'brush' },
    };

    const statusLabels = {
        available: 'Trống',
        occupied: 'Đang thuê',
        waiting: 'Chờ',
        cleaning: 'Dọn dẹp',
    };

    const statusFilters = [
        { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
        { key: 'available', label: 'Trống', icon: 'checkmark-circle-outline' },
        { key: 'occupied', label: 'Đang thuê', icon: 'person-outline' },
        { key: 'waiting', label: 'Chờ', icon: 'time-outline' },
        { key: 'cleaning', label: 'Dọn dẹp', icon: 'brush-outline' },
    ];

    const handleRoomPress = (room: any) => {
        if (room.status === 'available') {
            navigation.navigate('BookingFormScreen', { room });
        }
    };

    const getStatusStats = () => {
        return {
            total: rooms.length,
            available: rooms.filter(r => r.status === 'available').length,
            occupied: rooms.filter(r => r.status === 'occupied').length,
            waiting: rooms.filter(r => r.status === 'waiting').length,
            cleaning: rooms.filter(r => r.status === 'cleaning').length,
        };
    };

    const stats = getStatusStats();

    const getHeaderTitle = () => {
        if (filter === 'all') return 'Thuê trong ngày';
        if (filter === 'available') return 'Phòng trống';
        if (filter === 'waiting') return 'Phòng chờ';
        if (filter === 'occupied') return 'Phòng đang thuê';
        if (filter === 'cleaning') return 'Phòng cần dọn';
        return 'Danh sách phòng';
    };

    const getTodayActiveBookings = () => {
        const today = new Date().toISOString().split('T')[0];
        return bookings.filter(b => b.status === 'active').length;
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
                    <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
                </View>
            </LinearGradient>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm phòng..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersScroll}
                    contentContainerStyle={styles.filtersContent}>
                    {statusFilters.map((filterItem) => (
                        <TouchableOpacity
                            key={filterItem.key}
                            style={[
                                styles.filterChip,
                                selectedStatus === filterItem.key && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedStatus(filterItem.key as any)}>
                            <Ionicons
                                name={filterItem.icon as any}
                                size={18}
                                color={selectedStatus === filterItem.key ? '#fff' : '#64748b'}
                            />
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedStatus === filterItem.key && styles.filterTextActive,
                                ]}>
                                {filterItem.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.roomsContent}>
                {filter === 'all' && (
                    <View style={styles.todayStatsCard}>
                        <View style={styles.todayStatsHeader}>
                            <Ionicons name="calendar" size={24} color="#4a90e2" />
                            <Text style={styles.todayStatsTitle}>Hôm nay</Text>
                        </View>
                        <View style={styles.todayStatsContent}>
                            <View style={styles.todayStatItem}>
                                <Text style={styles.todayStatNumber}>{getTodayActiveBookings()}</Text>
                                <Text style={styles.todayStatLabel}>lượt thuê</Text>
                            </View>
                            <View style={styles.todayStatItem}>
                                <Text style={styles.todayStatNumber}>{stats.occupied}</Text>
                                <Text style={styles.todayStatLabel}>phòng đang thuê</Text>
                            </View>
                        </View>
                    </View>
                )}

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Tổng phòng</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#22c55e' }]}>{stats.available}</Text>
                        <Text style={styles.statLabel}>Trống</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.occupied}</Text>
                        <Text style={styles.statLabel}>Đang thuê</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#3b82f6' }]}>{stats.waiting}</Text>
                        <Text style={styles.statLabel}>Chờ</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>{stats.cleaning}</Text>
                        <Text style={styles.statLabel}>Cần dọn</Text>
                    </View>
                </View>

                <View style={styles.rentalHeader}>
                    <Text style={styles.rentalHeaderText}>
                        {filteredRooms.length} phòng
                    </Text>
                </View>

                <View style={styles.roomsGrid}>
                    {filteredRooms.map((room) => {
                        const statusColor = statusColors[room.status];
                        return (
                            <TouchableOpacity
                                key={room.id}
                                style={styles.roomCard}
                                onPress={() => handleRoomPress(room)}
                                activeOpacity={room.status === 'available' ? 0.7 : 1}>
                                <View style={styles.roomHeader}>
                                    <View style={styles.roomNumberBadge}>
                                        <Ionicons name="bed" size={20} color="#4a90e2" />
                                        <Text style={styles.roomNumber}>{room.roomNumber}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                                        <Ionicons
                                            name={statusColor.icon as any}
                                            size={14}
                                            color={statusColor.text}
                                        />
                                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                                            {statusLabels[room.status]}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.roomBody}>
                                    <View style={styles.roomInfo}>
                                        <Ionicons name="home-outline" size={16} color="#64748b" />
                                        <Text style={styles.roomType}>{room.type}</Text>
                                    </View>
                                    <View style={styles.roomInfo}>
                                        <Ionicons name="layers-outline" size={16} color="#64748b" />
                                        <Text style={styles.roomFloor}>Tầng {room.floor}</Text>
                                    </View>
                                    <View style={styles.priceRow}>
                                        <Ionicons name="cash-outline" size={16} color="#4a90e2" />
                                        <Text style={styles.roomPrice}>
                                            {room.price.toLocaleString('vi-VN')}đ
                                        </Text>
                                    </View>
                                </View>

                                {room.status === 'available' && (
                                    <View style={styles.roomFooter}>
                                        <Text style={styles.availableText}>Nhấn để thuê phòng</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#4a90e2" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {filteredRooms.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="search-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>Không tìm thấy phòng</Text>
                        <Text style={styles.emptySubtitle}>
                            Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
                        </Text>
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
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 16,
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
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#1e293b',
        fontWeight: '500',
    },
    filtersScroll: {
        marginHorizontal: -16,
    },
    filtersContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#4a90e2',
        borderColor: '#4a90e2',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
    },
    roomsContent: {
        padding: 16,
    },
    todayStatsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    todayStatsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    todayStatsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    todayStatsContent: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    todayStatItem: {
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    todayStatNumber: {
        fontSize: 28,
        fontWeight: '700',
        color: '#4a90e2',
        marginBottom: 4,
    },
    todayStatLabel: {
        fontSize: 12,
        color: '#64748b',
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    rentalHeader: {
        marginBottom: 16,
    },
    rentalHeaderText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    roomsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    roomCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    roomNumberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    roomNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    roomBody: {
        padding: 12,
        gap: 8,
    },
    roomInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    roomType: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    roomFloor: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    roomPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4a90e2',
    },
    roomFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: 12,
        backgroundColor: '#eff6ff',
        borderTopWidth: 1,
        borderTopColor: '#e0f2fe',
    },
    availableText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4a90e2',
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
});