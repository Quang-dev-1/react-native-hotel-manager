import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddRoomModal from '../../components/AddRoomModal';
import EditRoomModal from '../../components/EditRoomModal';
import roomService, { Room } from '../../services/roomService';

export default function RoomsScreen() {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const fetchRooms = useCallback(async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);
            const data = await roomService.getRooms();
            setRooms(data || []);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu phòng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRooms(true);
    };

    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setShowEditModal(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa phòng này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await roomService.deleteRoom(id);
                        Alert.alert('Thành công', 'Đã xóa phòng thành công');
                        fetchRooms();
                    } catch (e: any) {
                        Alert.alert('Lỗi', e.message || 'Không thể xóa phòng');
                    }
                }
            }
        ]);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'AVAILABLE':
                return '#10b981';
            case 'OCCUPIED':
                return '#ef4444';
            case 'MAINTENANCE':
                return '#f59e0b';
            case 'CLEANING':
                return '#3b82f6';
            default:
                return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'AVAILABLE':
                return 'Trống';
            case 'OCCUPIED':
                return 'Đang sử dụng';
            case 'MAINTENANCE':
                return 'Bảo trì';
            case 'CLEANING':
                return 'Đang dọn';
            default:
                return 'Không xác định';
        }
    };

    const renderItem = ({ item }: { item: Room }) => (
        <View style={styles.roomItem}>
            <View style={styles.roomIcon}>
                <Ionicons name="bed" size={24} color="#3b82f6" />
            </View>
            <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                    <Text style={styles.roomNumber}>Phòng {item.roomNumber}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                    </View>
                </View>
                <Text style={styles.roomType}>{item.roomTypeName}</Text>
                <View style={styles.roomDetails}>
                    <View style={styles.detailItem}>
                        <Ionicons name="business" size={14} color="#64748b" />
                        <Text style={styles.detailText}>Tầng {item.floor}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="cash" size={14} color="#64748b" />
                        <Text style={styles.detailText}>
                            {Number(item.price).toLocaleString('vi-VN')}₫
                        </Text>
                    </View>
                </View>
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/system')}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý phòng</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
                </View>
            ) : (
                <FlatList
                    data={rooms}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3b82f6']}
                            tintColor="#3b82f6"
                        />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="bed-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Chưa có phòng nào</Text>
                            <Text style={styles.emptySubtext}>
                                Nhấn nút + ở góc trên để thêm phòng mới
                            </Text>
                        </View>
                    }
                />
            )}

            <AddRoomModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => fetchRooms()}
            />

            <EditRoomModal
                visible={showEditModal}
                room={selectedRoom}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedRoom(null);
                }}
                onSuccess={() => fetchRooms()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 15,
        color: '#1e293b'
    },
    addButton: {
        backgroundColor: '#3b82f6',
        padding: 8,
        borderRadius: 8
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500'
    },
    roomItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    roomIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#dbeafe',
        justifyContent: 'center',
        alignItems: 'center'
    },
    roomInfo: {
        flex: 1,
        marginLeft: 12
    },
    roomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    roomNumber: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b'
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700'
    },
    roomType: {
        fontSize: 14,
        color: '#3b82f6',
        fontWeight: '600',
        marginBottom: 6
    },
    roomDetails: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    detailText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500'
    },
    description: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
        lineHeight: 16
    },
    actionButtons: {
        justifyContent: 'center',
        gap: 8
    },
    editButton: {
        padding: 8
    },
    deleteButton: {
        padding: 8
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        gap: 12
    },
    emptyText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 18,
        fontWeight: '600'
    },
    emptySubtext: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 4
    }
});