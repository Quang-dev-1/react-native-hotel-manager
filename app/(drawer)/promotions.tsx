import AddPromotionModal from '@/components/AddPromotionModal';
import EditPromotionModal from '@/components/EditPromotionModal';
import promotionService, { Promotion } from '@/services/promotionService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PromotionsScreen() {
    const router = useRouter();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

    const fetchPromotions = useCallback(async (isRefreshing = false) => {
        try {
            if (!isRefreshing) setLoading(true);
            const data = await promotionService.getAllPromotions();
            setPromotions(data || []);
        } catch (error: any) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu khuyến mãi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPromotions(true);
    };

    const handleEdit = (promotion: Promotion) => {
        setSelectedPromotion(promotion);
        setShowEditModal(true);
    };

    const handleToggleStatus = async (promotion: Promotion) => {
        if (!promotion.id) return;

        const action = promotion.active ? 'vô hiệu hóa' : 'kích hoạt';
        Alert.alert('Xác nhận', `Bạn có chắc muốn ${action} khuyến mãi này?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đồng ý',
                onPress: async () => {
                    try {
                        await promotionService.togglePromotionStatus(promotion.id!);
                        Alert.alert('Thành công', `Đã ${action} khuyến mãi thành công`);
                        fetchPromotions();
                    } catch (e: any) {
                        Alert.alert('Lỗi', e.message || `Không thể ${action} khuyến mãi`);
                    }
                },
            },
        ]);
    };

    const handleDelete = (id: number) => {
        Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa khuyến mãi này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await promotionService.deletePromotion(id);
                        Alert.alert('Thành công', 'Đã xóa khuyến mãi thành công');
                        fetchPromotions();
                    } catch (e: any) {
                        Alert.alert('Lỗi', e.message || 'Không thể xóa khuyến mãi');
                    }
                },
            },
        ]);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PERCENTAGE':
                return 'calculator'; // Đổi từ 'percent' sang 'calculator'
            case 'FIXED_AMOUNT':
                return 'cash';
            case 'ROOM_UPGRADE':
                return 'arrow-up-circle';
            case 'FREE_NIGHTS':
                return 'bed';
            default:
                return 'pricetag';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PERCENTAGE':
                return '#3b82f6';
            case 'FIXED_AMOUNT':
                return '#10b981';
            case 'ROOM_UPGRADE':
                return '#f59e0b';
            case 'FREE_NIGHTS':
                return '#8b5cf6';
            default:
                return '#64748b';
        }
    };

    const getStatusColor = (promotion: Promotion) => {
        const isActive = promotionService.isPromotionActive(promotion);
        const isExpired = promotionService.isPromotionExpired(promotion);

        if (isExpired) return '#ef4444'; // Red
        if (!promotion.active) return '#94a3b8'; // Gray
        if (isActive) return '#10b981'; // Green
        return '#f59e0b'; // Orange (future)
    };

    const getStatusText = (promotion: Promotion) => {
        const isActive = promotionService.isPromotionActive(promotion);
        const isExpired = promotionService.isPromotionExpired(promotion);

        if (isExpired) return 'Hết hạn';
        if (!promotion.active) return 'Vô hiệu';
        if (isActive) return 'Đang chạy';
        return 'Sắp diễn ra';
    };

    const renderItem = ({ item }: { item: Promotion }) => {
        const typeColor = getTypeColor(item.type);
        const statusColor = getStatusColor(item);
        const statusText = getStatusText(item);
        const remainingUsage = promotionService.getRemainingUsage(item);

        return (
            <View style={styles.promotionItem}>
                <View style={[styles.promotionIcon, { backgroundColor: typeColor + '20' }]}>
                    <Ionicons name={getTypeIcon(item.type) as any} size={24} color={typeColor} />
                </View>

                <View style={styles.promotionInfo}>
                    <View style={styles.promotionHeader}>
                        <Text style={styles.promotionCode}>{item.code}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                            <Text style={styles.statusText}>{statusText}</Text>
                        </View>
                    </View>

                    <Text style={styles.promotionName} numberOfLines={1}>
                        {item.name}
                    </Text>

                    <View style={styles.promotionDetails}>
                        <View style={styles.detailItem}>
                            <Ionicons name="pricetag" size={14} color="#64748b" />
                            <Text style={styles.detailText}>
                                {promotionService.formatDiscountValue(item)}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Ionicons name="calendar" size={14} color="#64748b" />
                            <Text style={styles.detailText}>
                                {item.startDate} → {item.endDate}
                            </Text>
                        </View>
                    </View>

                    {item.maxUsage && (
                        <View style={styles.usageInfo}>
                            <Ionicons name="people" size={14} color="#64748b" />
                            <Text style={styles.usageText}>
                                Đã dùng: {item.usedCount || 0}/{item.maxUsage}
                            </Text>
                            {remainingUsage !== null && remainingUsage <= 10 && remainingUsage > 0 && (
                                <View style={styles.lowStockBadge}>
                                    <Text style={styles.lowStockText}>Còn {remainingUsage}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {item.description && (
                        <Text style={styles.description} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                </View>

                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleToggleStatus(item)} style={styles.toggleButton}>
                        <Ionicons
                            name={item.active ? 'pause-circle-outline' : 'play-circle-outline'}
                            size={20}
                            color={item.active ? '#f59e0b' : '#10b981'}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                        <Ionicons name="create-outline" size={20} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.deleteButton}>
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* HEADER MỚI - GIỐNG SERVICE SCREEN */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/system')}>
                    <Ionicons name="arrow-back" size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý khuyến mãi</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text style={styles.loadingText}>Đang tải danh sách khuyến mãi...</Text>
                </View>
            ) : (
                <FlatList
                    data={promotions}
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
                            <Ionicons name="pricetags-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Chưa có khuyến mãi nào</Text>
                            <Text style={styles.emptySubtext}>
                                Nhấn nút + ở góc trên để thêm khuyến mãi mới
                            </Text>
                        </View>
                    }
                />
            )}

            <AddPromotionModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => fetchPromotions()}
            />

            <EditPromotionModal
                visible={showEditModal}
                promotion={selectedPromotion}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedPromotion(null);
                }}
                onSuccess={() => fetchPromotions()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    // HEADER MỚI - GIỐNG SERVICE
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 15,
        color: '#1e293b',
    },
    addButton: {
        backgroundColor: '#3b82f6',
        padding: 8,
        borderRadius: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '500',
    },
    promotionItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    promotionIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    promotionInfo: {
        flex: 1,
        marginLeft: 12,
    },
    promotionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    promotionCode: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1e293b',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    promotionName: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
        marginBottom: 6,
    },
    promotionDetails: {
        gap: 4,
        marginBottom: 4,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    detailText: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    usageInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    usageText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    lowStockBadge: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    lowStockText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#92400e',
    },
    description: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
        lineHeight: 16,
    },
    actionButtons: {
        justifyContent: 'center',
        gap: 8,
    },
    toggleButton: {
        padding: 8,
    },
    editButton: {
        padding: 8,
    },
    deleteButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        gap: 12,
    },
    emptyText: {
        textAlign: 'center',
        color: '#64748b',
        fontSize: 18,
        fontWeight: '600',
    },
    emptySubtext: {
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 4,
    },
});