import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

interface Transaction {
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

    // Mock data
    const [transactions] = useState<Transaction[]>([
        {
            id: 1,
            type: 'income',
            category: 'room_rental',
            amount: 1500000,
            description: 'Phòng 102 - 3 đêm',
            date: '15/12/2025',
            paymentMethod: 'cash',
        },
        {
            id: 2,
            type: 'income',
            category: 'room_rental',
            amount: 2000000,
            description: 'Phòng 203 - 4 đêm',
            date: '16/12/2025',
            paymentMethod: 'transfer',
        },
        {
            id: 3,
            type: 'expense',
            category: 'supplies',
            amount: 500000,
            description: 'Mua vật tư tiêu hao',
            date: '14/12/2025',
            paymentMethod: 'cash',
        },
        {
            id: 4,
            type: 'expense',
            category: 'salary',
            amount: 5000000,
            description: 'Lương nhân viên tháng 12',
            date: '01/12/2025',
            paymentMethod: 'transfer',
        },
        {
            id: 5,
            type: 'expense',
            category: 'utilities',
            amount: 1200000,
            description: 'Tiền điện nước tháng 12',
            date: '05/12/2025',
            paymentMethod: 'transfer',
        },
        {
            id: 6,
            type: 'income',
            category: 'service',
            amount: 300000,
            description: 'Dịch vụ giặt ủi',
            date: '17/12/2025',
            paymentMethod: 'cash',
        },
    ]);

    const periods = [
        { key: 'day', label: 'Hôm nay' },
        { key: 'week', label: 'Tuần này' },
        { key: 'month', label: 'Tháng này' },
        { key: 'year', label: 'Năm này' },
    ];

    const calculateTotals = () => {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, profit: income - expense };
    };

    const totals = calculateTotals();

    const getCategoryInfo = (category: string) => {
        const categories: Record<string, { label: string; icon: string; color: string }> = {
            room_rental: { label: 'Tiền phòng', icon: 'bed', color: '#4a90e2' },
            service: { label: 'Dịch vụ', icon: 'restaurant', color: '#8b5cf6' },
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

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Period Filter */}
                <View style={styles.periodFilter}>
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period.key}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period.key && styles.periodButtonActive,
                            ]}
                            onPress={() => setSelectedPeriod(period.key)}>
                            <Text
                                style={[
                                    styles.periodText,
                                    selectedPeriod === period.key && styles.periodTextActive,
                                ]}>
                                {period.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Summary Cards */}
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
                                    {totals.income.toLocaleString('vi-VN')}đ
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
                                    {totals.expense.toLocaleString('vi-VN')}đ
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
                                    color={totals.profit >= 0 ? '#22c55e' : '#ef4444'}
                                />
                                <Text style={styles.profitLabel}>Lợi nhuận</Text>
                            </View>
                            <Text
                                style={[
                                    styles.profitValue,
                                    { color: totals.profit >= 0 ? '#22c55e' : '#ef4444' },
                                ]}>
                                {totals.profit >= 0 ? '+' : ''}
                                {totals.profit.toLocaleString('vi-VN')}đ
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Transactions List */}
                <View style={styles.transactionsSection}>
                    <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>

                    {transactions.map((transaction) => {
                        const categoryInfo = getCategoryInfo(transaction.category);
                        return (
                            <View key={transaction.id} style={styles.transactionCard}>
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
    periodFilter: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    periodButton: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: '#4a90e2',
    },
    periodText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748b',
    },
    periodTextActive: {
        color: '#fff',
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
});