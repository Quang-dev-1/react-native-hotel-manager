import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SettingItem {
    id: string;
    title: string;
    description?: string;
    icon: string;
    type: 'toggle' | 'action' | 'input';
    value?: boolean | string;
    color: string;
}

export default function SettingsScreen() {
    const router = useRouter();

    // Settings state
    const [notifications, setNotifications] = useState(true);
    const [autoBackup, setAutoBackup] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [soundEffects, setSoundEffects] = useState(true);
    const [autoCheckout, setAutoCheckout] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(false);

    // Modal states
    const [showHotelInfoModal, setShowHotelInfoModal] = useState(false);
    const [showBackupModal, setShowBackupModal] = useState(false);

    // Hotel info
    const [hotelName, setHotelName] = useState('Hotel Manager');
    const [hotelAddress, setHotelAddress] = useState('123 Đường ABC, Quận 1, TP.HCM');
    const [hotelPhone, setHotelPhone] = useState('0123456789');
    const [hotelEmail, setHotelEmail] = useState('contact@hotel.com');

    const settingsSections = [
        {
            title: 'Thông tin khách sạn',
            icon: 'business',
            color: '#3b82f6',
            items: [
                {
                    id: 'hotel-info',
                    title: 'Thông tin cơ bản',
                    description: 'Tên, địa chỉ, số điện thoại',
                    icon: 'information-circle',
                    type: 'action' as const,
                    color: '#3b82f6',
                    onPress: () => setShowHotelInfoModal(true),
                },
                {
                    id: 'business-hours',
                    title: 'Giờ làm việc',
                    description: 'Cấu hình giờ check-in/check-out',
                    icon: 'time',
                    type: 'action' as const,
                    color: '#3b82f6',
                    onPress: () => Alert.alert('Giờ làm việc', 'Chức năng đang phát triển'),
                },
            ],
        },
        {
            title: 'Thông báo',
            icon: 'notifications',
            color: '#ec4899',
            items: [
                {
                    id: 'push-notifications',
                    title: 'Thông báo đẩy',
                    description: 'Nhận thông báo về đặt phòng mới',
                    icon: 'notifications-outline',
                    type: 'toggle' as const,
                    value: notifications,
                    color: '#ec4899',
                    onToggle: setNotifications,
                },
                {
                    id: 'email-notifications',
                    title: 'Thông báo email',
                    description: 'Gửi báo cáo qua email',
                    icon: 'mail',
                    type: 'toggle' as const,
                    value: emailNotifications,
                    color: '#ec4899',
                    onToggle: setEmailNotifications,
                },
                {
                    id: 'sound-effects',
                    title: 'Âm thanh',
                    description: 'Phát âm thanh khi có thông báo',
                    icon: 'volume-high',
                    type: 'toggle' as const,
                    value: soundEffects,
                    color: '#ec4899',
                    onToggle: setSoundEffects,
                },
            ],
        },
        {
            title: 'Tự động hóa',
            icon: 'flash',
            color: '#f59e0b',
            items: [
                {
                    id: 'auto-checkout',
                    title: 'Tự động checkout',
                    description: 'Tự động checkout khi hết thời gian thuê',
                    icon: 'exit',
                    type: 'toggle' as const,
                    value: autoCheckout,
                    color: '#f59e0b',
                    onToggle: setAutoCheckout,
                },
                {
                    id: 'auto-backup',
                    title: 'Sao lưu tự động',
                    description: 'Tự động sao lưu dữ liệu hàng ngày',
                    icon: 'cloud-upload',
                    type: 'toggle' as const,
                    value: autoBackup,
                    color: '#f59e0b',
                    onToggle: setAutoBackup,
                },
            ],
        },
        {
            title: 'Giao diện',
            icon: 'color-palette',
            color: '#8b5cf6',
            items: [
                {
                    id: 'dark-mode',
                    title: 'Chế độ tối',
                    description: 'Sử dụng giao diện tối',
                    icon: 'moon',
                    type: 'toggle' as const,
                    value: darkMode,
                    color: '#8b5cf6',
                    onToggle: setDarkMode,
                },
                {
                    id: 'language',
                    title: 'Ngôn ngữ',
                    description: 'Tiếng Việt',
                    icon: 'language',
                    type: 'action' as const,
                    color: '#8b5cf6',
                    onPress: () => Alert.alert('Ngôn ngữ', 'Chức năng đang phát triển'),
                },
            ],
        },
        {
            title: 'Dữ liệu & Bảo mật',
            icon: 'shield-checkmark',
            color: '#10b981',
            items: [
                {
                    id: 'backup',
                    title: 'Sao lưu dữ liệu',
                    description: 'Tạo bản sao lưu thủ công',
                    icon: 'save',
                    type: 'action' as const,
                    color: '#10b981',
                    onPress: () => setShowBackupModal(true),
                },
                {
                    id: 'restore',
                    title: 'Khôi phục dữ liệu',
                    description: 'Khôi phục từ bản sao lưu',
                    icon: 'refresh',
                    type: 'action' as const,
                    color: '#10b981',
                    onPress: () => Alert.alert('Khôi phục', 'Chức năng đang phát triển'),
                },
                {
                    id: 'clear-cache',
                    title: 'Xóa bộ nhớ cache',
                    description: 'Giải phóng bộ nhớ ứng dụng',
                    icon: 'trash',
                    type: 'action' as const,
                    color: '#ef4444',
                    onPress: () => {
                        Alert.alert(
                            'Xóa cache',
                            'Bạn có chắc muốn xóa bộ nhớ cache?',
                            [
                                { text: 'Hủy', style: 'cancel' },
                                {
                                    text: 'Xóa',
                                    style: 'destructive',
                                    onPress: () => Alert.alert('Thành công', 'Đã xóa cache'),
                                },
                            ]
                        );
                    },
                },
            ],
        },
    ];

    const handleSaveHotelInfo = () => {
        Alert.alert('Thành công', 'Đã lưu thông tin khách sạn');
        setShowHotelInfoModal(false);
    };

    const handleBackup = () => {
        Alert.alert('Đang sao lưu', 'Vui lòng đợi...', [
            {
                text: 'OK',
                onPress: () => {
                    setShowBackupModal(false);
                    Alert.alert('Thành công', 'Đã sao lưu dữ liệu thành công');
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4a90e2', '#357abd']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.push('/system')}>
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Cài đặt</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                {settingsSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View
                                style={[
                                    styles.sectionIcon,
                                    { backgroundColor: `${section.color}20` },
                                ]}>
                                <Ionicons
                                    name={section.icon as any}
                                    size={20}
                                    color={section.color}
                                />
                            </View>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>

                        <View style={styles.sectionContent}>
                            {section.items.map((item, itemIndex) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.settingItem,
                                        itemIndex === section.items.length - 1 &&
                                        styles.settingItemLast,
                                    ]}
                                    onPress={
                                        item.type === 'action' ? item.onPress : undefined
                                    }
                                    disabled={item.type === 'toggle'}
                                    activeOpacity={item.type === 'action' ? 0.7 : 1}>
                                    <View
                                        style={[
                                            styles.itemIcon,
                                            { backgroundColor: `${item.color}15` },
                                        ]}>
                                        <Ionicons
                                            name={item.icon as any}
                                            size={20}
                                            color={item.color}
                                        />
                                    </View>

                                    <View style={styles.itemContent}>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        {item.description && (
                                            <Text style={styles.itemDescription}>
                                                {item.description}
                                            </Text>
                                        )}
                                    </View>

                                    {item.type === 'toggle' && item.onToggle && (
                                        <Switch
                                            value={item.value as boolean}
                                            onValueChange={item.onToggle}
                                            trackColor={{ false: '#cbd5e1', true: item.color }}
                                            thumbColor="#fff"
                                        />
                                    )}

                                    {item.type === 'action' && (
                                        <Ionicons
                                            name="chevron-forward"
                                            size={20}
                                            color="#cbd5e1"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appInfoTitle}>Hotel Manager</Text>
                    <Text style={styles.appInfoVersion}>Phiên bản 1.0.0</Text>
                    <Text style={styles.appInfoCopyright}>© 2025 All rights reserved</Text>
                </View>
            </ScrollView>

            {/* Hotel Info Modal */}
            <Modal
                visible={showHotelInfoModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowHotelInfoModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Thông tin khách sạn</Text>
                            <TouchableOpacity
                                onPress={() => setShowHotelInfoModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tên khách sạn</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hotelName}
                                    onChangeText={setHotelName}
                                    placeholder="Nhập tên khách sạn"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Địa chỉ</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hotelAddress}
                                    onChangeText={setHotelAddress}
                                    placeholder="Nhập địa chỉ"
                                    multiline
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Số điện thoại</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hotelPhone}
                                    onChangeText={setHotelPhone}
                                    placeholder="Nhập số điện thoại"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={hotelEmail}
                                    onChangeText={setHotelEmail}
                                    placeholder="Nhập email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowHotelInfoModal(false)}>
                                <Text style={styles.modalCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleSaveHotelInfo}>
                                <LinearGradient
                                    colors={['#4a90e2', '#357abd']}
                                    style={styles.modalSaveGradient}>
                                    <Text style={styles.modalSaveText}>Lưu</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Backup Modal */}
            <Modal
                visible={showBackupModal}
                animationType="fade"
                transparent
                onRequestClose={() => setShowBackupModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: 300 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Sao lưu dữ liệu</Text>
                            <TouchableOpacity onPress={() => setShowBackupModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.backupInfo}>
                                <Ionicons
                                    name="information-circle"
                                    size={48}
                                    color="#3b82f6"
                                />
                                <Text style={styles.backupInfoText}>
                                    Dữ liệu sẽ được sao lưu bao gồm:{'\n\n'}
                                    • Thông tin phòng và loại phòng{'\n'}
                                    • Lịch sử đặt phòng{'\n'}
                                    • Thông tin khách hàng{'\n'}
                                    • Giao dịch và thanh toán
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowBackupModal(false)}>
                                <Text style={styles.modalCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSaveButton}
                                onPress={handleBackup}>
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    style={styles.modalSaveGradient}>
                                    <Ionicons
                                        name="cloud-upload"
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.modalSaveText}>Sao lưu ngay</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
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
    header: {
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    sectionIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    sectionContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    settingItemLast: {
        borderBottomWidth: 0,
    },
    itemIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    itemDescription: {
        fontSize: 13,
        color: '#64748b',
    },
    appInfo: {
        alignItems: 'center',
        paddingVertical: 32,
        gap: 8,
    },
    appInfoTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    appInfoVersion: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    appInfoCopyright: {
        fontSize: 12,
        color: '#94a3b8',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        maxHeight: '80%',
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
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    modalBody: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: '#1e293b',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    modalSaveButton: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalSaveGradient: {
        flexDirection: 'row',
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    modalSaveText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    backupInfo: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 16,
    },
    backupInfoText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
    },
});