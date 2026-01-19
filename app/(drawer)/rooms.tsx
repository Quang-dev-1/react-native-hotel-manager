import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddRoomModal from '../../components/AddRoomModal';
import roomService, { Room } from '../../services/roomService';

export default function RoomsScreen() {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

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

    const handleDelete = (id: number) => {
        Alert.alert('Xác nhận', 'Xóa phòng này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await roomService.deleteRoom(id);
                        Alert.alert('Thành công', 'Đã xóa phòng');
                        fetchRooms();
                    } catch (e: any) {
                        Alert.alert('Lỗi', e.message || 'Không thể xóa phòng');
                    }
                }
            }
        ]);
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'available':
            case 'trống':
                return '#10b981';
            case 'occupied':
            case 'đang sử dụng':
                return '#ef4444';
            case 'maintenance':
            case 'bảo trì':
                return '#f59e0b';
            default:
                return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'Trống';
            case 'occupied':
                return 'Đang sử dụng';
            case 'maintenance':
                return 'Bảo trì';
            default:
                return status;
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
                        <Text style={styles.detailText}>{Number(item.price).toLocaleString()} VND</Text>
                    </View>
                </View>
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                )}
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
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
                <ActivityIndicator style={{ marginTop: 50 }} color="#3b82f6" />
            ) : (
                <FlatList
                    data={rooms}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>Chưa có phòng nào</Text>}
                />
            )}

            <AddRoomModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
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
    deleteButton: {
        padding: 8,
        justifyContent: 'center'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#94a3b8',
        fontSize: 15
    }
});