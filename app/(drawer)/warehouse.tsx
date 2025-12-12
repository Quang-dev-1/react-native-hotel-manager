import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface InventoryItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minStock: number;
    price: number;
    lastUpdated: string;
}

export default function WarehouseScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    // Mock data
    const [inventory, setInventory] = useState<InventoryItem[]>([
        {
            id: 1,
            name: 'Khăn tắm',
            category: 'textile',
            quantity: 150,
            unit: 'cái',
            minStock: 50,
            price: 50000,
            lastUpdated: '15/12/2025',
        },
        {
            id: 2,
            name: 'Dầu gội',
            category: 'amenities',
            quantity: 80,
            unit: 'chai',
            minStock: 30,
            price: 25000,
            lastUpdated: '14/12/2025',
        },
        {
            id: 3,
            name: 'Giấy vệ sinh',
            category: 'amenities',
            quantity: 200,
            unit: 'cuộn',
            minStock: 100,
            price: 5000,
            lastUpdated: '16/12/2025',
        },
        {
            id: 4,
            name: 'Ga trải giường',
            category: 'textile',
            quantity: 45,
            unit: 'bộ',
            minStock: 20,
            price: 150000,
            lastUpdated: '13/12/2025',
        },
        {
            id: 5,
            name: 'Nước uống',
            category: 'beverage',
            quantity: 120,
            unit: 'chai',
            minStock: 50,
            price: 10000,
            lastUpdated: '17/12/2025',
        },
    ]);

    const categories = [
        { key: 'all', label: 'Tất cả', icon: 'grid-outline' },
        { key: 'textile', label: 'Vải dệt', icon: 'shirt-outline' },
        { key: 'amenities', label: 'Tiện nghi', icon: 'water-outline' },
        { key: 'beverage', label: 'Đồ uống', icon: 'cafe-outline' },
        { key: 'cleaning', label: 'Vệ sinh', icon: 'sparkles-outline' },
    ];

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

    const handleUpdateStock = (id: number, newQuantity: number) => {
        setInventory(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, quantity: newQuantity, lastUpdated: '17/12/2025' }
                    : item
            )
        );
        Alert.alert('Thành công', 'Đã cập nhật số lượng');
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
                                    {isLowStock && (
                                        <View style={styles.lowStockBadge}>
                                            <Ionicons name="warning" size={16} color="#f59e0b" />
                                        </View>
                                    )}
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

                                    <View style={styles.infoRow}>
                                        <View style={styles.infoItem}>
                                            <Ionicons name="time-outline" size={18} color="#64748b" />
                                            <Text style={styles.infoLabel}>Cập nhật:</Text>
                                            <Text style={styles.infoValue}>{item.lastUpdated}</Text>
                                        </View>
                                    </View>
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
                                                        handleUpdateStock(item.id, newQty);
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
                                                        handleUpdateStock(item.id, item.quantity + addQty);
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
    lowStockBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fef3c7',
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
});