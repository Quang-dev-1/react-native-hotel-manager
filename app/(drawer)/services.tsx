import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddServiceModal from '../../components/AddServiceModal';
import EditServiceModal from '../../components/EditServiceModal';
import hotelServiceAPI, { HotelService } from '../../services/hotelService';

export default function ServicesScreen() {
    const router = useRouter();
    const [services, setServices] = useState<HotelService[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState<HotelService | null>(null);

    const fetchServices = useCallback(async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);
            const data = await hotelServiceAPI.getAllServices();
            setServices(data || []);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu dịch vụ');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchServices(true);
    };

    const handleEdit = (service: HotelService) => {
        setSelectedService(service);
        setShowEditModal(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert('Xác nhận', 'Xóa dịch vụ này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await hotelServiceAPI.deleteService(id);
                        Alert.alert('Thành công', 'Đã xóa dịch vụ');
                        fetchServices();
                    } catch (e) {
                        Alert.alert('Lỗi', 'Không thể xóa');
                    }
                }
            }
        ]);
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FOOD':
                return 'restaurant';
            case 'ENTERTAINMENT':
                return 'game-controller';
            case 'SPA':
                return 'flower';
            case 'LAUNDRY':
                return 'shirt';
            case 'TRANSPORT':
                return 'car';
            default:
                return 'fast-food';
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'FOOD':
                return '#ec4899';
            case 'ENTERTAINMENT':
                return '#8b5cf6';
            case 'SPA':
                return '#10b981';
            case 'LAUNDRY':
                return '#3b82f6';
            case 'TRANSPORT':
                return '#f59e0b';
            default:
                return '#64748b';
        }
    };

    const renderItem = ({ item }: { item: HotelService }) => (
        <View style={styles.serviceItem}>
            <View style={[styles.serviceIcon, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
                <Ionicons name={getCategoryIcon(item.category) as any} size={24} color={getCategoryColor(item.category)} />
            </View>
            <View style={styles.serviceInfo}>
                <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{item.name}</Text>
                    {!item.available && (
                        <View style={styles.unavailableBadge}>
                            <Text style={styles.unavailableText}>Tạm ngưng</Text>
                        </View>
                    )}
                </View>
                {item.description && (
                    <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                )}
                <Text style={[styles.servicePrice, { color: getCategoryColor(item.category) }]}>
                    {Number(item.price).toLocaleString()} VND
                </Text>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                    <Ionicons name="create-outline" size={20} color="#ec4899" />
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
                <Text style={styles.headerTitle}>Dịch vụ khách sạn</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 50 }} color="#ec4899" />
            ) : (
                <FlatList
                    data={services}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={<Text style={styles.emptyText}>Chưa có dịch vụ nào</Text>}
                />
            )}

            <AddServiceModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => fetchServices()}
            />

            <EditServiceModal
                visible={showEditModal}
                service={selectedService}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedService(null);
                }}
                onSuccess={() => fetchServices()}
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
        backgroundColor: '#ec4899',
        padding: 8,
        borderRadius: 8
    },
    serviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    serviceIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    serviceInfo: {
        flex: 1,
        marginLeft: 12
    },
    serviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        flex: 1
    },
    unavailableBadge: {
        backgroundColor: '#fee2e2',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8
    },
    unavailableText: {
        fontSize: 11,
        color: '#ef4444',
        fontWeight: '600'
    },
    description: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 4
    },
    servicePrice: {
        fontWeight: '700',
        fontSize: 15,
        marginTop: 2
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
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#94a3b8',
        fontSize: 15
    }
});