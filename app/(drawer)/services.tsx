import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddServiceModal from '../../components/AddServiceModal';
import hotelServiceAPI, { HotelService } from '../../services/hotelService';

export default function ServicesScreen() {
    const router = useRouter();
    const [services, setServices] = useState<HotelService[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

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

    const handleDelete = (id: number) => {
        Alert.alert('Xác nhận', 'Xóa dịch vụ này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await hotelServiceAPI.deleteService(id);
                        fetchServices();
                    } catch (e) { Alert.alert('Lỗi', 'Không thể xóa'); }
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: HotelService }) => (
        <View style={styles.serviceItem}>
            <View style={styles.serviceIcon}>
                <Ionicons name="fast-food" size={24} color="#ec4899" />
            </View>
            <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.servicePrice}>{Number(item.price).toLocaleString()} VND</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id!)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
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
                onSuccess={() => fetchServices()} // QUAN TRỌNG: Load lại sau khi thêm
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50, backgroundColor: '#fff' },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', marginLeft: 15 },
    addButton: { backgroundColor: '#ec4899', padding: 8, borderRadius: 8 },
    serviceItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderRadius: 12, marginBottom: 10 },
    serviceIcon: { width: 45, height: 45, borderRadius: 10, backgroundColor: '#fce7f3', justifyContent: 'center', alignItems: 'center' },
    serviceInfo: { flex: 1, marginLeft: 12 },
    serviceName: { fontSize: 16, fontWeight: '600' },
    servicePrice: { color: '#ec4899', fontWeight: '700', marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#94a3b8' }
});