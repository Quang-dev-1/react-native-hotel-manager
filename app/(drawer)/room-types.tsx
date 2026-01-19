import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddRoomTypeModal from '../../components/AddRoomTypeModal';
import roomService, { RoomType } from '../../services/roomService';

export default function RoomTypesScreen() {
    const router = useRouter();
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const fetchRoomTypes = useCallback(async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);
            const data = await roomService.getRoomTypes();
            setRoomTypes(data || []);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu loại phòng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchRoomTypes();
    }, [fetchRoomTypes]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRoomTypes(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert('Xác nhận', 'Xóa loại phòng này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await roomService.deleteRoomType(id);
                        Alert.alert('Thành công', 'Đã xóa loại phòng');
                        fetchRoomTypes();
                    } catch (e: any) {
                        Alert.alert('Lỗi', e.message || 'Không thể xóa loại phòng');
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: RoomType }) => (
        <View style={styles.roomTypeItem}>
            <View style={styles.roomTypeIcon}>
                <Ionicons name="pricetag" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.roomTypeInfo}>
                <Text style={styles.roomTypeName}>{item.name}</Text>
                {item.description && (
                    <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                )}
                <View style={styles.detailsContainer}>
                    <View style={styles.detailItem}>
                        <Ionicons name="cash-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>{Number(item.basePrice).toLocaleString()} VND</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Ionicons name="people-outline" size={14} color="#64748b" />
                        <Text style={styles.detailText}>Tối đa {item.maxOccupancy} người</Text>
                    </View>
                </View>
                {item.amenities && (
                    <View style={styles.amenitiesContainer}>
                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                        <Text style={styles.amenitiesText} numberOfLines={1}>{item.amenities}</Text>
                    </View>
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
                <Text style={styles.headerTitle}>Quản lý loại phòng</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 50 }} color="#8b5cf6" />
            ) : (
                <FlatList
                    data={roomTypes}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>Chưa có loại phòng nào</Text>}
                />
            )}

            <AddRoomTypeModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => fetchRoomTypes()}
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
        backgroundColor: '#8b5cf6',
        padding: 8,
        borderRadius: 8
    },
    roomTypeItem: {
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
    roomTypeIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#ede9fe',
        justifyContent: 'center',
        alignItems: 'center'
    },
    roomTypeInfo: {
        flex: 1,
        marginLeft: 12
    },
    roomTypeName: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4
    },
    description: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 8,
        lineHeight: 18
    },
    detailsContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 6
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
    amenitiesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4
    },
    amenitiesText: {
        fontSize: 12,
        color: '#10b981',
        fontWeight: '500',
        flex: 1
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