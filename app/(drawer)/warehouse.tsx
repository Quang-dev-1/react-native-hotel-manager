import inventoryService, { Inventory } from '@/services/inventoryService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
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

export default function WarehouseScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
const [showSuppliesOnly, setShowSuppliesOnly] = useState(false);
    const categories = [
        { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
        { key: 'textile', label: 'Vải dệt', icon: 'shirt-outline' },
        { key: 'amenities', label: 'Tiện nghi', icon: 'water-outline' },
        { key: 'beverage', label: 'Đồ uống', icon: 'cafe-outline' },
        { key: 'cleaning', label: 'Vệ sinh', icon: 'sparkles-outline' },
    ];

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const data = await inventoryService.getAllInventory();
            setInventory(data);
        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, []);

    const getCategoryLabel = (key: string) => {
        return categories.find(c => c.key === key)?.label || key;
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getLowStockItems = () => {
        return inventory.filter(item => item.quantity <= item.minStock);
    };

    const handleAddStock = async (id: number, addQuantity: number) => {
        try {
            const item = inventory.find(i => i.id === id);
            if (!item) return;

            const totalCost = addQuantity * item.price;
            Alert.alert(
                'Xác nhận nhập hàng',
                `Sản phẩm: ${item.name}\nSố lượng: ${addQuantity} ${item.unit}\nTổng chi phí: ${totalCost.toLocaleString('vi-VN')}đ\n\nChọn phương thức thanh toán:`,
                [
                    {
                        text: '💵 Tiền mặt',
                        onPress: async () => {
                            try {
                                await inventoryService.addStockWithTransaction(id, addQuantity, 'CASH');
                                Alert.alert('Thành công', 'Đã nhập hàng và ghi nhận chi phí');
                                fetchInventory();
                            } catch (error: any) {
                                Alert.alert('Lỗi', error.message);
                            }
                        }
                    },
                    {
                        text: '🏦 Chuyển khoản',
                        onPress: async () => {
                            try {
                                await inventoryService.addStockWithTransaction(id, addQuantity, 'TRANSFER');
                                Alert.alert('Thành công', 'Đã nhập hàng và ghi nhận chi phí');
                                fetchInventory();
                            } catch (error: any) {
                                Alert.alert('Lỗi', error.message);
                            }
                        }
                    },
                    {
                        text: '💳 Thẻ',
                        onPress: async () => {
                            try {
                                await inventoryService.addStockWithTransaction(id, addQuantity, 'CARD');
                                Alert.alert('Thành công', 'Đã nhập hàng và ghi nhận chi phí');
                                fetchInventory();
                            } catch (error: any) {
                                Alert.alert('Lỗi', error.message);
                            }
                        }
                    },
                    {
                        text: 'Hủy',
                        style: 'cancel'
                    }
                ],
                { cancelable: true }
            );
        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
        }
    };

    const handleUpdateStock = async (id: number, newQuantity: number) => {
        try {
            await inventoryService.updateStock(id, newQuantity);
            Alert.alert('Thành công', 'Đã cập nhật số lượng');
            fetchInventory();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
        }
    };

    const handleDeleteItem = async (id: number) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xóa sản phẩm này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await inventoryService.deleteInventory(id);
                            Alert.alert('Thành công', 'Đã xóa sản phẩm');
                            fetchInventory();
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message);
                        }
                    },
                },
            ]
        );
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchInventory();
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
                    <Text style={styles.headerTitle}>Quản lý kho</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Low Stock Alert */}
            {getLowStockItems().length > 0 && (
                <View style={styles.alertBanner}>
                    <Ionicons name="warning" size={20} color="#f59e0b" />
                    <Text style={styles.alertText}>
                        {getLowStockItems().length} mặt hàng sắp hết
                    </Text>
                </View>
            )}

            {/* Search and Filter */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm hàng hóa..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#4a90e2" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersScroll}
                    contentContainerStyle={styles.filtersContent}>
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.key}
                            style={[
                                styles.filterChip,
                                selectedCategory === category.key && styles.filterChipActive,
                            ]}
                            onPress={() => setSelectedCategory(category.key)}>
                            <Ionicons
                                name={category.icon as any}
                                size={18}
                                color={selectedCategory === category.key ? '#fff' : '#64748b'}
                            />
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedCategory === category.key && styles.filterTextActive,
                                ]}>
                                {category.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Đang tải...</Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.inventoryList}>
                        {filteredInventory.map((item) => {
                            const isLowStock = item.quantity <= item.minStock;
                            return (
                                <View key={item.id} style={styles.inventoryCard}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.itemInfo}>
                                            <Text style={styles.itemName}>{item.name}</Text>
                                            <Text style={styles.itemCategory}>
                                                {getCategoryLabel(item.category)}
                                            </Text>
                                        </View>
                                        <View style={styles.headerActions}>
                                            {isLowStock && (
                                                <View style={styles.lowStockBadge}>
                                                    <Ionicons name="warning" size={16} color="#f59e0b" />
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                onPress={() => handleDeleteItem(item.id!)}
                                                style={styles.deleteButton}>
                                                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.cardBody}>
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="cube-outline" size={18} color="#64748b" />
                                                <Text style={styles.infoLabel}>Số lượng:</Text>
                                                <Text
                                                    style={[
                                                        styles.infoValue,
                                                        isLowStock && styles.lowStockText,
                                                    ]}>
                                                    {item.quantity} {item.unit}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="alert-circle-outline" size={18} color="#64748b" />
                                                <Text style={styles.infoLabel}>Tồn kho tối thiểu:</Text>
                                                <Text style={styles.infoValue}>
                                                    {item.minStock} {item.unit}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.infoRow}>
                                            <View style={styles.infoItem}>
                                                <Ionicons name="cash-outline" size={18} color="#64748b" />
                                                <Text style={styles.infoLabel}>Giá:</Text>
                                                <Text style={styles.priceValue}>
                                                    {item.price.toLocaleString('vi-VN')}đ
                                                </Text>
                                            </View>
                                        </View>

                                        {item.lastUpdated && (
                                            <View style={styles.infoRow}>
                                                <View style={styles.infoItem}>
                                                    <Ionicons name="time-outline" size={18} color="#64748b" />
                                                    <Text style={styles.infoLabel}>Cập nhật:</Text>
                                                    <Text style={styles.infoValue}>
                                                        {new Date(item.lastUpdated).toLocaleDateString('vi-VN')}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => {
                                                Alert.prompt(
                                                    'Cập nhật số lượng',
                                                    `Nhập số lượng mới cho ${item.name}:`,
                                                    (text) => {
                                                        const newQty = parseInt(text);
                                                        if (!isNaN(newQty) && newQty >= 0) {
                                                            handleUpdateStock(item.id!, newQty);
                                                        }
                                                    },
                                                    'plain-text',
                                                    item.quantity.toString()
                                                );
                                            }}>
                                            <Ionicons name="create-outline" size={20} color="#4a90e2" />
                                            <Text style={styles.actionButtonText}>Cập nhật</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.restockButton]}
                                            onPress={() => {
                                                Alert.prompt(
                                                    'Nhập hàng',
                                                    `Nhập số lượng thêm cho ${item.name}:`,
                                                    (text) => {
                                                        const addQty = parseInt(text);
                                                        if (!isNaN(addQty) && addQty > 0) {
                                                            handleAddStock(item.id!, addQty);
                                                        }
                                                    },
                                                    'plain-text'
                                                );
                                            }}>
                                            <Ionicons name="add-circle-outline" size={20} color="#22c55e" />
                                            <Text style={[styles.actionButtonText, { color: '#22c55e' }]}>
                                                Nhập hàng
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            )}

            {/* Add Product Modal */}
            <AddProductModal
                visible={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false);
                    fetchInventory();
                }}
            />
        </View>
    );
}

// Component Modal thêm sản phẩm
function AddProductModal({ visible, onClose, onSuccess }: {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState<Inventory>({
        name: '',
        category: 'textile',
        quantity: 0,
        unit: 'cái',
        minStock: 0,
        price: 0,
    });
    const [loading, setLoading] = useState(false);

    const categories = [
        { key: 'textile', label: 'Vải dệt' },
        { key: 'amenities', label: 'Tiện nghi' },
        { key: 'beverage', label: 'Đồ uống' },
        { key: 'cleaning', label: 'Vệ sinh' },
    ];

    const handleSubmit = async () => {
        if (!formData.name || !formData.unit) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            await inventoryService.addInventory(formData);
            Alert.alert('Thành công', 'Đã thêm sản phẩm vào kho');
            setFormData({
                name: '',
                category: 'textile',
                quantity: 0,
                unit: 'cái',
                minStock: 0,
                price: 0,
            });
            onSuccess();
        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Thêm sản phẩm mới</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody}>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Tên sản phẩm *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Nhập tên sản phẩm"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Danh mục *</Text>
                            <View style={styles.categoryButtons}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.key}
                                        style={[
                                            styles.categoryButton,
                                            formData.category === cat.key && styles.categoryButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, category: cat.key })}>
                                        <Text
                                            style={[
                                                styles.categoryButtonText,
                                                formData.category === cat.key && styles.categoryButtonTextActive,
                                            ]}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Số lượng *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.quantity.toString()}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, quantity: parseInt(text) || 0 })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>

                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Đơn vị *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.unit}
                                    onChangeText={(text) => setFormData({ ...formData, unit: text })}
                                    placeholder="cái, chai, bộ..."
                                />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Tồn kho tối thiểu</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.minStock.toString()}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, minStock: parseInt(text) || 0 })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>

                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Giá (VNĐ)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.price.toString()}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, price: parseInt(text) || 0 })
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Hủy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={loading}>
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Thêm sản phẩm</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
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
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#fde68a',
    },
    alertText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400e',
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
    },
    inventoryList: {
        padding: 16,
        gap: 12,
    },
    inventoryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    itemCategory: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    lowStockBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fef3c7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBody: {
        padding: 16,
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    infoLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: 14,
        color: '#1e293b',
        fontWeight: '600',
    },
    lowStockText: {
        color: '#f59e0b',
    },
    priceValue: {
        fontSize: 14,
        color: '#4a90e2',
        fontWeight: '700',
    },
    cardFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#4a90e2',
    },
    restockButton: {
        borderColor: '#22c55e',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4a90e2',
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalBody: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        color: '#1e293b',
        backgroundColor: '#f8fafc',
    },
    categoryButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryButtonActive: {
        backgroundColor: '#4a90e2',
        borderColor: '#4a90e2',
    },
    categoryButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    categoryButtonTextActive: {
        color: '#fff',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f1f5f9',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#475569',
    },
    submitButton: {
        backgroundColor: '#4a90e2',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});