import bookingService from '@/services/bookingService';
import roomService, { Room } from '@/services/roomService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Modal cập nhật trạng thái phòng (chỉ cho CLEANING)
const RoomStatusModal = ({
    visible,
    room,
    onClose,
    onUpdateSuccess
}: {
    visible: boolean;
    room: Room | null;
    onClose: () => void;
    onUpdateSuccess: () => void;
}) => {
    if (!room) return null;

    const statusOptions = [
        { key: 'AVAILABLE', label: 'Trống', icon: 'checkmark-circle', color: '#22c55e' },
        { key: 'CLEANING', label: 'Dọn dẹp', icon: 'brush', color: '#8b5cf6' },
    ];

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            await roomService.updateRoomStatus(room.id!, newStatus);
            Alert.alert(
                'Thành công',
                `Đã cập nhật trạng thái phòng ${room.roomNumber} thành "${statusOptions.find(s => s.key === newStatus)?.label}"`
            );
            onUpdateSuccess();
            onClose();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể cập nhật trạng thái phòng');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Cập nhật trạng thái phòng</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.modalBody}>
                        <View style={styles.roomInfoBox}>
                            <Ionicons name="bed" size={24} color="#4a90e2" />
                            <View style={styles.roomInfoText}>
                                <Text style={styles.roomInfoNumber}>Phòng {room.roomNumber}</Text>
                                <Text style={styles.roomInfoType}>{room.roomTypeName}</Text>
                            </View>
                        </View>

                        <Text style={styles.modalLabel}>Chọn trạng thái mới:</Text>

                        {statusOptions.map((status) => (
                            <TouchableOpacity
                                key={status.key}
                                style={[
                                    styles.statusOption,
                                    room.status === status.key && styles.statusOptionDisabled
                                ]}
                                onPress={() => handleUpdateStatus(status.key)}
                                disabled={room.status === status.key}>
                                <View style={styles.statusOptionLeft}>
                                    <View style={[styles.statusIconBox, { backgroundColor: `${status.color}20` }]}>
                                        <Ionicons name={status.icon as any} size={24} color={status.color} />
                                    </View>
                                    <Text style={[
                                        styles.statusOptionText,
                                        room.status === status.key && styles.statusOptionTextDisabled
                                    ]}>
                                        {status.label}
                                    </Text>
                                </View>
                                {room.status === status.key && (
                                    <Text style={styles.currentBadge}>Hiện tại</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={onClose}>
                        <Text style={styles.modalCloseButtonText}>Đóng</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function RentalScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [todayRentals, setTodayRentals] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'AVAILABLE' | 'OCCUPIED' | 'WAITING' | 'CLEANING'>('all');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const { filter } = (route.params as { filter?: string }) || {};

    useEffect(() => {
        if (filter) {
            const statusMap: Record<string, any> = {
                'all': 'all',
                'available': 'AVAILABLE',
                'occupied': 'OCCUPIED',
                'waiting': 'WAITING',
                'cleaning': 'CLEANING',
            };
            setSelectedStatus(statusMap[filter] || 'all');
        }
    }, [filter]);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const data = await roomService.getRooms();
            setRooms(data);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể tải danh sách phòng');
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayRentals = async () => {
        try {
            const stats = await bookingService.getDashboardStats();
            setTodayRentals(stats.todayRentals);
        } catch (error) {
            console.log('Error fetching today rentals:', error);
        }
    };

    // Sử dụng useFocusEffect để tự động refresh khi quay lại màn hình
    useFocusEffect(
        useCallback(() => {
            fetchRooms();
            fetchTodayRentals();
        }, [])
    );

    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            room.roomTypeName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const statusColors: Record<string, { bg: string; text: string; icon: string }> = {
        AVAILABLE: { bg: '#dcfce7', text: '#166534', icon: 'checkmark-circle' },
        OCCUPIED: { bg: '#fef3c7', text: '#92400e', icon: 'person' },
        WAITING: { bg: '#dbeafe', text: '#1e40af', icon: 'time' },
        CLEANING: { bg: '#ede9fe', text: '#6b21a8', icon: 'brush' },
    };

    const statusLabels: Record<string, string> = {
        AVAILABLE: 'Trống',
        OCCUPIED: 'Đang thuê',
        WAITING: 'Chờ xác nhận',
        CLEANING: 'Dọn dẹp',
    };

    const statusFilters = [
        { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
        { key: 'AVAILABLE', label: 'Trống', icon: 'checkmark-circle-outline' },
        { key: 'OCCUPIED', label: 'Đang thuê', icon: 'person-outline' },
        { key: 'WAITING', label: 'Chờ xác nhận', icon: 'time-outline' },
        { key: 'CLEANING', label: 'Dọn dẹp', icon: 'brush-outline' },
    ];

    const handleRoomPress = (room: Room) => {
        if (room.status === 'AVAILABLE') {
            navigation.navigate('BookingFormScreen', { room });
        } else if (room.status === 'CLEANING') {
            setSelectedRoom(room);
            setShowStatusModal(true);
        } else if (room.status === 'WAITING') {
            Alert.alert(
                'Phòng chờ xác nhận',
                'Phòng này đang có khách đặt chờ xác nhận. Vui lòng vào màn hình "Quản lý đặt phòng" để xử lý.',
                [
                    { text: 'Đóng', style: 'cancel' },
                    {
                        text: 'Đến Quản lý đặt phòng',
                        // Sửa tên route đúng với expo-router
                        onPress: () => navigation.navigate('bookings')
                    }
                ]
            );
        }
        // Phòng đang thuê (OCCUPIED) -> Không làm gì
    };

    const getStatusStats = () => {
        return {
            total: rooms.length,
            available: rooms.filter(r => r.status === 'AVAILABLE').length,
            occupied: rooms.filter(r => r.status === 'OCCUPIED').length,
            waiting: rooms.filter(r => r.status === 'WAITING').length,
            cleaning: rooms.filter(r => r.status === 'CLEANING').length,
        };
    };

    const stats = getStatusStats();

    const getHeaderTitle = () => {
        if (filter === 'all') return 'Thuê trong ngày';
        if (filter === 'available') return 'Phòng trống';
        if (filter === 'waiting') return 'Phòng chờ xác nhận';
        if (filter === 'occupied') return 'Phòng đang thuê';
        if (filter === 'cleaning') return 'Phòng cần dọn';
        return 'Danh sách phòng';
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
                        <Text style={styles.headerTitle}>{getHeaderTitle()}</Text>
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
                                <Text style={styles.todayStatNumber}>{todayRentals}</Text>
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
                        <Text style={styles.statLabel}>Chờ xác nhận</Text>
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
                        const statusColor = statusColors[room.status] || statusColors.AVAILABLE;
                        const isInteractable = room.status === 'AVAILABLE' || room.status === 'CLEANING' || room.status === 'WAITING';

                        return (
                            <TouchableOpacity
                                key={room.id}
                                style={styles.roomCard}
                                onPress={() => handleRoomPress(room)}
                                activeOpacity={isInteractable ? 0.7 : 1}>
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
                                            {statusLabels[room.status] || room.status}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.roomBody}>
                                    <View style={styles.roomInfo}>
                                        <Ionicons name="home-outline" size={16} color="#64748b" />
                                        <Text style={styles.roomType}>{room.roomTypeName}</Text>
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

                                {room.status === 'AVAILABLE' && (
                                    <View style={styles.roomFooter}>
                                        <Text style={styles.actionText}>Nhấn để thuê phòng</Text>
                                        <Ionicons name="arrow-forward" size={16} color="#4a90e2" />
                                    </View>
                                )}

                                {room.status === 'CLEANING' && (
                                    <View style={[styles.roomFooter, { backgroundColor: '#faf5ff' }]}>
                                        <Text style={[styles.actionText, { color: '#8b5cf6' }]}>
                                            Cập nhật trạng thái
                                        </Text>
                                        <Ionicons name="create-outline" size={16} color="#8b5cf6" />
                                    </View>
                                )}

                                {room.status === 'WAITING' && (
                                    <View style={[styles.roomFooter, { backgroundColor: '#eff6ff' }]}>
                                        <Text style={[styles.actionText, { color: '#3b82f6' }]}>
                                            Xem đặt phòng
                                        </Text>
                                        <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
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

            <RoomStatusModal
                visible={showStatusModal}
                room={selectedRoom}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedRoom(null);
                }}
                onUpdateSuccess={fetchRooms}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
    menuButton: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255, 255, 255, 0.15)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
    loadingText: { marginTop: 16, fontSize: 16, color: '#64748b', fontWeight: '500' },
    searchSection: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, height: 48, gap: 12, marginBottom: 12 },
    searchInput: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
    filtersScroll: { marginHorizontal: -16 },
    filtersContent: { paddingHorizontal: 16, gap: 8 },
    filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8 },
    filterChipActive: { backgroundColor: '#4a90e2', borderColor: '#4a90e2' },
    filterText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    filterTextActive: { color: '#fff' },
    roomsContent: { padding: 16 },
    todayStatsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    todayStatsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    todayStatsTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    todayStatsContent: { flexDirection: 'row', justifyContent: 'space-around' },
    todayStatItem: { alignItems: 'center', paddingHorizontal: 16 },
    todayStatNumber: { fontSize: 28, fontWeight: '700', color: '#4a90e2', marginBottom: 4 },
    todayStatLabel: { fontSize: 12, color: '#64748b', textAlign: 'center' },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
    statLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },
    rentalHeader: { marginBottom: 16 },
    rentalHeaderText: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    roomsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    roomCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    roomNumberBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    roomNumber: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '600' },
    roomBody: { padding: 12, gap: 8 },
    roomInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    roomType: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    roomFloor: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    roomPrice: { fontSize: 16, fontWeight: '700', color: '#4a90e2' },
    roomFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, backgroundColor: '#eff6ff', borderTopWidth: 1, borderTopColor: '#e0f2fe' },
    actionText: { fontSize: 13, fontWeight: '600', color: '#4a90e2' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 16, marginBottom: 4 },
    emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContainer: { backgroundColor: '#fff', borderRadius: 20, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
    modalBody: { padding: 20 },
    roomInfoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 20 },
    roomInfoText: { flex: 1 },
    roomInfoNumber: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    roomInfoType: { fontSize: 14, color: '#64748b', fontWeight: '500' },
    modalLabel: { fontSize: 14, fontWeight: '600', color: '#64748b', marginBottom: 12 },
    statusOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
    statusOptionDisabled: { backgroundColor: '#f1f5f9', opacity: 0.6 },
    statusOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    statusIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    statusOptionText: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    statusOptionTextDisabled: { color: '#94a3b8' },
    currentBadge: { fontSize: 12, fontWeight: '600', color: '#64748b', backgroundColor: '#e2e8f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    modalCloseButton: { marginHorizontal: 20, marginBottom: 20, backgroundColor: '#f8fafc', paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    modalCloseButtonText: { fontSize: 15, fontWeight: '700', color: '#64748b' },
});