import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LogEntry {
    id: number;
    type: 'info' | 'warning' | 'error' | 'success';
    action: string;
    user: string;
    description: string;
    timestamp: string;
    details?: string;
}

export default function LogsScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');

    // Mock data
    const [logs] = useState<LogEntry[]>([
        {
            id: 1,
            type: 'success',
            action: 'Đặt phòng',
            user: 'Admin',
            description: 'Đã đặt phòng 102 cho khách Nguyễn Văn A',
            timestamp: '17/12/2025 14:35:20',
            details: 'Phòng 102, 3 đêm, tổng tiền 1,500,000đ',
        },
        {
            id: 2,
            type: 'success',
            action: 'Trả phòng',
            user: 'Admin',
            description: 'Khách đã trả phòng 201',
            timestamp: '17/12/2025 12:15:45',
            details: 'Thanh toán đầy đủ, phòng chuyển sang trạng thái dọn dẹp',
        },
        {
            id: 3,
            type: 'warning',
            action: 'Cảnh báo kho',
            user: 'System',
            description: 'Khăn tắm sắp hết (còn 45/50)',
            timestamp: '17/12/2025 10:00:00',
            details: 'Cần nhập thêm khăn tắm',
        },
        {
            id: 4,
            type: 'info',
            action: 'Cập nhật kho',
            user: 'Admin',
            description: 'Đã nhập 100 chai dầu gội',
            timestamp: '16/12/2025 16:20:30',
            details: 'Tổng số lượng hiện tại: 180 chai',
        },
        {
            id: 5,
            type: 'error',
            action: 'Thanh toán thất bại',
            user: 'System',
            description: 'Lỗi kết nối cổng thanh toán',
            timestamp: '16/12/2025 15:45:12',
            details: 'Mã lỗi: PAYMENT_GATEWAY_ERROR',
        },
        {
            id: 6,
            type: 'success',
            action: 'Đăng nhập',
            user: 'Admin',
            description: 'Đăng nhập thành công',
            timestamp: '16/12/2025 08:30:00',
        },
        {
            id: 7,
            type: 'info',
            action: 'Sao lưu dữ liệu',
            user: 'System',
            description: 'Đã tự động sao lưu dữ liệu',
            timestamp: '16/12/2025 00:00:00',
            details: 'Backup size: 125 MB',
        },
        {
            id: 8,
            type: 'warning',
            action: 'Phòng cần bảo trì',
            user: 'System',
            description: 'Phòng 305 báo cáo sự cố điều hòa',
            timestamp: '15/12/2025 18:20:00',
            details: 'Cần kiểm tra hệ thống điều hòa',
        },
        {
            id: 9,
            type: 'success',
            action: 'Hủy đặt phòng',
            user: 'Admin',
            description: 'Đã hủy đặt phòng 104',
            timestamp: '15/12/2025 14:10:25',
            details: 'Hoàn tiền cọc cho khách',
        },
        {
            id: 10,
            type: 'info',
            action: 'Cập nhật giá',
            user: 'Admin',
            description: 'Cập nhật giá phòng Suite',
            timestamp: '15/12/2025 09:00:00',
            details: 'Giá mới: 1,200,000đ/đêm',
        },
    ]);

    const logTypes = [
        { key: 'all', label: 'Tất cả', icon: 'list-outline', color: '#64748b' },
        { key: 'success', label: 'Thành công', icon: 'checkmark-circle', color: '#22c55e' },
        { key: 'info', label: 'Thông tin', icon: 'information-circle', color: '#3b82f6' },
        { key: 'warning', label: 'Cảnh báo', icon: 'warning', color: '#f59e0b' },
        { key: 'error', label: 'Lỗi', icon: 'close-circle', color: '#ef4444' },
    ];

    const getLogTypeInfo = (type: string) => {
        return logTypes.find(t => t.key === type) || logTypes[0];
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.user.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || log.type === selectedType;
        return matchesSearch && matchesType;
    });

    const stats = {
        total: logs.length,
        success: logs.filter(l => l.type === 'success').length,
        info: logs.filter(l => l.type === 'info').length,
        warning: logs.filter(l => l.type === 'warning').length,
        error: logs.filter(l => l.type === 'error').length,
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
                    <Text style={styles.headerTitle}>Nhật ký hệ thống</Text>
                </View>
            </LinearGradient>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsContent}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.total}</Text>
                        <Text style={styles.statLabel}>Tổng</Text>
                    </View>
                    <View style={[styles.statItem, { borderLeftColor: '#22c55e' }]}>
                        <Text style={[styles.statValue, { color: '#22c55e' }]}>
                            {stats.success}
                        </Text>
                        <Text style={styles.statLabel}>Thành công</Text>
                    </View>
                    <View style={[styles.statItem, { borderLeftColor: '#3b82f6' }]}>
                        <Text style={[styles.statValue, { color: '#3b82f6' }]}>
                            {stats.info}
                        </Text>
                        <Text style={styles.statLabel}>Thông tin</Text>
                    </View>
                    <View style={[styles.statItem, { borderLeftColor: '#f59e0b' }]}>
                        <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                            {stats.warning}
                        </Text>
                        <Text style={styles.statLabel}>Cảnh báo</Text>
                    </View>
                    <View style={[styles.statItem, { borderLeftColor: '#ef4444' }]}>
                        <Text style={[styles.statValue, { color: '#ef4444' }]}>
                            {stats.error}
                        </Text>
                        <Text style={styles.statLabel}>Lỗi</Text>
                    </View>
                </ScrollView>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#64748b" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm nhật ký..."
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
                    {logTypes.map((type) => (
                        <TouchableOpacity
                            key={type.key}
                            style={[
                                styles.filterChip,
                                selectedType === type.key && [
                                    styles.filterChipActive,
                                    { backgroundColor: type.color },
                                ],
                            ]}
                            onPress={() => setSelectedType(type.key)}>
                            <Ionicons
                                name={type.icon as any}
                                size={18}
                                color={selectedType === type.key ? '#fff' : type.color}
                            />
                            <Text
                                style={[
                                    styles.filterText,
                                    selectedType === type.key && styles.filterTextActive,
                                ]}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Logs List */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.logsList}>
                    <Text style={styles.resultsText}>
                        {filteredLogs.length} nhật ký
                    </Text>

                    {filteredLogs.map((log) => {
                        const typeInfo = getLogTypeInfo(log.type);
                        return (
                            <View key={log.id} style={styles.logCard}>
                                <View
                                    style={[
                                        styles.logIndicator,
                                        { backgroundColor: typeInfo.color },
                                    ]}
                                />
                                <View style={styles.logContent}>
                                    <View style={styles.logHeader}>
                                        <View
                                            style={[
                                                styles.logIcon,
                                                { backgroundColor: `${typeInfo.color}20` },
                                            ]}>
                                            <Ionicons
                                                name={typeInfo.icon as any}
                                                size={20}
                                                color={typeInfo.color}
                                            />
                                        </View>
                                        <View style={styles.logHeaderText}>
                                            <Text style={styles.logAction}>{log.action}</Text>
                                            <View style={styles.logMeta}>
                                                <Ionicons name="person-outline" size={14} color="#94a3b8" />
                                                <Text style={styles.logUser}>{log.user}</Text>
                                                <Text style={styles.logDot}>•</Text>
                                                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                                                <Text style={styles.logTime}>{log.timestamp}</Text>
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={styles.logDescription}>{log.description}</Text>

                                    {log.details && (
                                        <View style={styles.logDetails}>
                                            <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
                                            <Text style={styles.logDetailsText}>{log.details}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    {filteredLogs.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={64} color="#cbd5e1" />
                            <Text style={styles.emptyTitle}>Không tìm thấy nhật ký</Text>
                            <Text style={styles.emptySubtitle}>
                                Thử tìm kiếm với từ khóa khác
                            </Text>
                        </View>
                    )}
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
    statsBar: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    statsContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    statItem: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4a90e2',
        marginRight: 16,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
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
        borderColor: 'transparent',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
    },
    filterTextActive: {
        color: '#fff',
    },
    logsList: {
        padding: 16,
    },
    resultsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 12,
    },
    logCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    logIndicator: {
        width: 4,
    },
    logContent: {
        flex: 1,
        padding: 16,
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 12,
    },
    logIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logHeaderText: {
        flex: 1,
    },
    logAction: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    logMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    logUser: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    logDot: {
        fontSize: 12,
        color: '#cbd5e1',
        marginHorizontal: 4,
    },
    logTime: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
    logDescription: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 8,
    },
    logDetails: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 6,
        backgroundColor: '#f8fafc',
        padding: 10,
        borderRadius: 8,
    },
    logDetailsText: {
        flex: 1,
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
    },
});