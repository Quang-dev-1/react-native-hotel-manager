import financeService, { FinanceSummary } from '@/services/financeService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface DisplayTransaction {
    id: number;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    date: string;
    paymentMethod: string;
}

export default function FinanceScreen() {
    const navigation = useNavigation();
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showSuppliesOnly, setShowSuppliesOnly] = useState(false);
    const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
    const [summary, setSummary] = useState<FinanceSummary>({
        totalIncome: 0,
        totalExpense: 0,
        profit: 0,
        startDate: '',
        endDate: ''
    });

    const [formData, setFormData] = useState({
        type: 'INCOME' as 'INCOME' | 'EXPENSE',
        category: '',
        amount: '',
        description: '',
        paymentMethod: 'CASH' as 'CASH' | 'TRANSFER' | 'CARD',
    });

    const periods = [
        { key: 'yesterday', label: 'Hôm qua' },
        { key: 'day', label: 'Hôm nay' },
        { key: 'last_week', label: 'Tuần trước' },
        { key: 'week', label: 'Tuần này' },
        { key: 'last_month', label: 'Tháng trước' },
        { key: 'month', label: 'Tháng này' },
        { key: 'last_year', label: 'Năm trước' },
        { key: 'year', label: 'Năm này' },
    ];

    const displayedTransactions = showSuppliesOnly
        ? transactions.filter(t => t.category === 'supplies' && t.type === 'expense')
        : transactions;

    const getSelectedPeriodLabel = () => {
        const period = periods.find(p => p.key === selectedPeriod);
        return period ? period.label : 'Chọn khoảng thời gian';
    };

    useEffect(() => {
        loadData();
    }, [selectedPeriod]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [transactionsData, summaryData] = await Promise.all([
                financeService.getTransactions(selectedPeriod as any),
                financeService.getFinanceSummary(selectedPeriod as any)
            ]);

            const displayTransactions = transactionsData.map(t => ({
                id: t.id,
                type: t.type.toLowerCase() as 'income' | 'expense',
                category: t.category.toLowerCase(),
                amount: Number(t.amount),
                description: t.description,
                date: financeService.formatDateForDisplay(t.transactionDate),
                paymentMethod: t.paymentMethod.toLowerCase()
            })).reverse();

            setTransactions(displayTransactions);
            setSummary(summaryData);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
            console.error('Load data error:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [selectedPeriod]);

    const handleCreateTransaction = async () => {
        try {
            if (!formData.category || !formData.amount || !formData.description) {
                Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
                return;
            }

            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) {
                Alert.alert('Lỗi', 'Số tiền không hợp lệ');
                return;
            }

            await financeService.createTransaction({
                type: formData.type,
                category: formData.category,
                amount: amount,
                description: formData.description,
                transactionDate: new Date().toISOString().split('T')[0],
                paymentMethod: formData.paymentMethod
            });

            Alert.alert('Thành công', 'Đã thêm giao dịch mới');
            setShowAddModal(false);

            setFormData({
                type: 'INCOME',
                category: '',
                amount: '',
                description: '',
                paymentMethod: 'CASH',
            });

            await loadData();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tạo giao dịch. Vui lòng thử lại.');
            console.error('Create transaction error:', error);
        }
    };

    const handleDeleteTransaction = async (id: number) => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa giao dịch này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await financeService.deleteTransaction(id);
                            Alert.alert('Thành công', 'Đã xóa giao dịch');
                            await loadData();
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể xóa giao dịch');
                            console.error('Delete transaction error:', error);
                        }
                    }
                }
            ]
        );
    };

    const getCategoryInfo = (category: string) => {
        const categories: Record<string, { label: string; icon: string; color: string }> = {
            room_rental: { label: 'Tiền phòng', icon: 'bed', color: '#4a90e2' },
            service: { label: 'Dịch vụ', icon: 'restaurant', color: '#8b5cf6' },
            discount: { label: 'Giảm giá/KM', icon: 'pricetag', color: '#22c55e' },
            supplies: { label: 'Vật tư', icon: 'cube', color: '#f59e0b' },
            salary: { label: 'Lương', icon: 'people', color: '#ef4444' },
            utilities: { label: 'Tiện ích', icon: 'flash', color: '#06b6d4' },
            maintenance: { label: 'Bảo trì', icon: 'construct', color: '#64748b' },
        };
        return categories[category] || { label: category, icon: 'ellipse', color: '#94a3b8' };
    };

    const getPaymentMethodLabel = (method: string) => {
        const methods: Record<string, string> = {
            cash: 'Tiền mặt',
            transfer: 'Chuyển khoản',
            card: 'Thẻ',
        };
        return methods[method] || method;
    };

    const getCategoryOptions = () => [
        { value: 'room_rental', label: 'Tiền phòng' },
        { value: 'service', label: 'Dịch vụ' },
        { value: 'supplies', label: 'Vật tư' },
        { value: 'salary', label: 'Lương' },
        { value: 'utilities', label: 'Tiện ích' },
        { value: 'maintenance', label: 'Bảo trì' },
    ];

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#4a90e2" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
                    <Text style={styles.headerTitle}>Quản lý thu chi</Text>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowAddModal(true)}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                {/* Filter Button */}
                <View style={styles.periodFilter}>
                    <TouchableOpacity
                        style={styles.periodFilterButton}
                        onPress={() => setShowFilterModal(true)}>
                        <Ionicons name="calendar-outline" size={20} color="#4a90e2" />
                        <Text style={styles.periodFilterText}>{getSelectedPeriodLabel()}</Text>
                        <Ionicons name="chevron-down" size={20} color="#4a90e2" />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterSection}>
                    <TouchableOpacity
                        style={[
                            styles.suppliesFilterButton,
                            showSuppliesOnly && styles.suppliesFilterButtonActive
                        ]}
                        onPress={() => setShowSuppliesOnly(!showSuppliesOnly)}>
                        <Ionicons
                            name="cube-outline"
                            size={20}
                            color={showSuppliesOnly ? '#fff' : '#64748b'}
                        />
                        <Text style={[
                            styles.suppliesFilterText,
                            showSuppliesOnly && styles.suppliesFilterTextActive
                        ]}>
                            {showSuppliesOnly ? 'Đang xem chi phí kho' : 'Xem tất cả giao dịch'}
                        </Text>
                        {showSuppliesOnly && (
                            <View style={styles.activeIndicator}>
                                <Text style={styles.activeIndicatorText}>
                                    {displayedTransactions.length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.summarySection}>
                    <View style={styles.summaryCard}>
                        <LinearGradient
                            colors={['#86efac', '#22c55e']}
                            style={styles.summaryGradient}>
                            <View style={styles.summaryIcon}>
                                <Ionicons name="trending-up" size={24} color="#fff" />
                            </View>
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryLabel}>Thu nhập</Text>
                                <Text style={styles.summaryValue}>
                                    {Number(summary.totalIncome).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.summaryCard}>
                        <LinearGradient
                            colors={['#fca5a5', '#ef4444']}
                            style={styles.summaryGradient}>
                            <View style={styles.summaryIcon}>
                                <Ionicons name="trending-down" size={24} color="#fff" />
                            </View>
                            <View style={styles.summaryContent}>
                                <Text style={styles.summaryLabel}>Chi phí</Text>
                                <Text style={styles.summaryValue}>
                                    {Number(summary.totalExpense).toLocaleString('vi-VN')}đ
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={[styles.summaryCard, styles.profitCard]}>
                        <View style={styles.profitContent}>
                            <View style={styles.profitHeader}>
                                <Ionicons
                                    name="wallet"
                                    size={24}
                                    color={Number(summary.profit) >= 0 ? '#22c55e' : '#ef4444'}
                                />
                                <Text style={styles.profitLabel}>Lợi nhuận</Text>
                            </View>
                            <Text
                                style={[
                                    styles.profitValue,
                                    { color: Number(summary.profit) >= 0 ? '#22c55e' : '#ef4444' },
                                ]}>
                                {Number(summary.profit) >= 0 ? '+' : ''}
                                {Number(summary.profit).toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.transactionsSection}>
                    <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>

                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
                        </View>
                    ) : (
                        displayedTransactions.map((transaction) => {
                            const categoryInfo = getCategoryInfo(transaction.category);
                            return (
                                <TouchableOpacity
                                    key={transaction.id}
                                    style={styles.transactionCard}
                                    onLongPress={() => handleDeleteTransaction(transaction.id)}>
                                    <View
                                        style={[
                                            styles.transactionIcon,
                                            { backgroundColor: `${categoryInfo.color}20` },
                                        ]}>
                                        <Ionicons
                                            name={categoryInfo.icon as any}
                                            size={24}
                                            color={categoryInfo.color}
                                        />
                                    </View>

                                    <View style={styles.transactionDetails}>
                                        <View style={styles.transactionHeader}>
                                            <Text style={styles.transactionCategory}>
                                                {categoryInfo.label}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.transactionAmount,
                                                    transaction.type === 'income'
                                                        ? styles.incomeAmount
                                                        : styles.expenseAmount,
                                                ]}>
                                                {transaction.type === 'income' ? '+' : '-'}
                                                {transaction.amount.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </View>

                                        <Text style={styles.transactionDescription}>
                                            {transaction.description}
                                        </Text>

                                        <View style={styles.transactionFooter}>
                                            <View style={styles.transactionMeta}>
                                                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                                <Text style={styles.transactionMetaText}>
                                                    {transaction.date}
                                                </Text>
                                            </View>
                                            <View style={styles.transactionMeta}>
                                                <Ionicons name="card-outline" size={14} color="#94a3b8" />
                                                <Text style={styles.transactionMetaText}>
                                                    {getPaymentMethodLabel(transaction.paymentMethod)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Filter Modal */}
            <Modal
                visible={showFilterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.filterModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn khoảng thời gian</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <Ionicons name="close" size={28} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {periods.map((period) => (
                                <TouchableOpacity
                                    key={period.key}
                                    style={[
                                        styles.filterOption,
                                        selectedPeriod === period.key && styles.filterOptionActive
                                    ]}
                                    onPress={() => {
                                        setSelectedPeriod(period.key);
                                        setShowFilterModal(false);
                                    }}>
                                    <Text style={[
                                        styles.filterOptionText,
                                        selectedPeriod === period.key && styles.filterOptionTextActive
                                    ]}>
                                        {period.label}
                                    </Text>
                                    {selectedPeriod === period.key && (
                                        <Ionicons name="checkmark-circle" size={24} color="#4a90e2" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Add Transaction Modal */}
            <Modal
                visible={showAddModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thêm giao dịch mới</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={28} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.inputLabel}>Loại giao dịch</Text>
                            <View style={styles.typeSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        formData.type === 'INCOME' && styles.typeButtonActiveIncome
                                    ]}
                                    onPress={() => setFormData({ ...formData, type: 'INCOME' })}>
                                    <Text style={[
                                        styles.typeButtonText,
                                        formData.type === 'INCOME' && styles.typeButtonTextActive
                                    ]}>Thu nhập</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeButton,
                                        formData.type === 'EXPENSE' && styles.typeButtonActiveExpense
                                    ]}
                                    onPress={() => setFormData({ ...formData, type: 'EXPENSE' })}>
                                    <Text style={[
                                        styles.typeButtonText,
                                        formData.type === 'EXPENSE' && styles.typeButtonTextActive
                                    ]}>Chi phí</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>Danh mục</Text>
                            <View style={styles.categoryGrid}>
                                {getCategoryOptions().map((cat) => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        style={[
                                            styles.categoryItem,
                                            formData.category === cat.value && styles.categoryItemActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, category: cat.value })}>
                                        <Text style={[
                                            styles.categoryItemText,
                                            formData.category === cat.value && styles.categoryItemTextActive
                                        ]}>{cat.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>Số tiền</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập số tiền"
                                keyboardType="numeric"
                                value={formData.amount}
                                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                            />

                            <Text style={styles.inputLabel}>Mô tả</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Nhập mô tả"
                                multiline
                                numberOfLines={3}
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                            />

                            <Text style={styles.inputLabel}>Phương thức thanh toán</Text>
                            <View style={styles.paymentMethodSelector}>
                                {[
                                    { value: 'CASH', label: 'Tiền mặt', icon: 'cash' },
                                    { value: 'TRANSFER', label: 'Chuyển khoản', icon: 'card' },
                                    { value: 'CARD', label: 'Thẻ', icon: 'card-outline' },
                                ].map((method) => (
                                    <TouchableOpacity
                                        key={method.value}
                                        style={[
                                            styles.paymentMethodButton,
                                            formData.paymentMethod === method.value && styles.paymentMethodButtonActive
                                        ]}
                                        onPress={() => setFormData({ ...formData, paymentMethod: method.value as any })}>
                                        <Ionicons
                                            name={method.icon as any}
                                            size={20}
                                            color={formData.paymentMethod === method.value ? '#4a90e2' : '#64748b'}
                                        />
                                        <Text style={[
                                            styles.paymentMethodText,
                                            formData.paymentMethod === method.value && styles.paymentMethodTextActive
                                        ]}>{method.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleCreateTransaction}>
                                <Text style={styles.submitButtonText}>Thêm giao dịch</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
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
    periodFilter: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    periodFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#4a90e2',
    },
    periodFilterText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#4a90e2',
        flex: 1,
        textAlign: 'center',
    },
    summarySection: {
        padding: 16,
        gap: 12,
    },
    summaryCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    summaryGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    summaryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryContent: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    profitCard: {
        backgroundColor: '#fff',
    },
    profitContent: {
        padding: 20,
    },
    profitHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    profitLabel: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '600',
    },
    profitValue: {
        fontSize: 28,
        fontWeight: '700',
    },
    transactionsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#94a3b8',
    },
    transactionCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    transactionIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionDetails: {
        flex: 1,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    transactionCategory: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '700',
    },
    incomeAmount: {
        color: '#22c55e',
    },
    expenseAmount: {
        color: '#ef4444',
    },
    transactionDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    transactionFooter: {
        flexDirection: 'row',
        gap: 16,
    },
    transactionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    transactionMetaText: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    filterModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
        paddingHorizontal: 20,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    filterOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    filterOptionActive: {
        backgroundColor: '#dbeafe',
        borderColor: '#4a90e2',
    },
    filterOptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748b',
    },
    filterOptionTextActive: {
        color: '#4a90e2',
        fontWeight: '700',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
        marginTop: 16,
    },
    typeSelector: {
        flexDirection: 'row',
        gap: 12,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    typeButtonActiveIncome: {
        backgroundColor: '#dcfce7',
        borderColor: '#22c55e',
    },
    typeButtonActiveExpense: {
        backgroundColor: '#fee2e2',
        borderColor: '#ef4444',
    },
    typeButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    typeButtonTextActive: {
        color: '#1e293b',
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    categoryItemActive: {
        backgroundColor: '#dbeafe',
        borderColor: '#4a90e2',
    },
    categoryItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
    },
    categoryItemTextActive: {
        color: '#4a90e2',
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1e293b',
        backgroundColor: '#fff',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    paymentMethodSelector: {
        flexDirection: 'row',
        gap: 8,
    },
    paymentMethodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    paymentMethodButtonActive: {
        backgroundColor: '#dbeafe',
        borderColor: '#4a90e2',
    },
    paymentMethodText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#64748b',
    },
    paymentMethodTextActive: {
        color: '#4a90e2',
        fontWeight: '600',
    },
    submitButton: {
        marginTop: 24,
        backgroundColor: '#4a90e2',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    filterSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    suppliesFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    suppliesFilterButtonActive: {
        backgroundColor: '#4a90e2',
        borderColor: '#4a90e2',
    },
    suppliesFilterText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    suppliesFilterTextActive: {
        color: '#fff',
    },
    activeIndicator: {
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 24,
        alignItems: 'center',
    },
    activeIndicatorText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fff',
    },
});