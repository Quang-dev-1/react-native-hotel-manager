import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddRoomModal from '../../components/AddRoomModal';
import AddRoomTypeModal from '../../components/AddRoomTypeModal';
import AddServiceModal from '../../components/AddServiceModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function SystemScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const [showRoomModal, setShowRoomModal] = useState(false);
    const [showRoomTypeModal, setShowRoomTypeModal] = useState(false);
    const [showServiceModal, setShowServiceModal] = useState(false);

    const systemActions = [
        {
            id: 'add-room',
            title: 'Thêm phòng',
            description: 'Thêm phòng mới vào hệ thống',
            icon: 'bed',
            color: '#3b82f6',
            bgColor: '#dbeafe',
            onPress: () => router.push('/rooms'),
        },
        {
            id: 'add-room-type',
            title: 'Loại phòng',
            description: 'Quản lý loại phòng',
            icon: 'pricetag',
            color: '#8b5cf6',
            bgColor: '#ede9fe',
            onPress: () => router.push('/room-types'),
        },
        {
            id: 'add-service',
            title: 'Dịch vụ',
            description: 'Quản lý dịch vụ khách sạn',
            icon: 'restaurant',
            color: '#ec4899',
            bgColor: '#fce7f3',
            onPress: () => router.push('/services'),
        },
        {
            id: 'manage-staff',
            title: 'Nhân viên',
            description: 'Quản lý thông tin nhân viên',
            icon: 'people',
            color: '#22c55e',
            bgColor: '#dcfce7',
            onPress: () => Alert.alert('Nhân viên', 'Chức năng đang phát triển'),
        },
        {
            id: 'view-history',
            title: 'Lịch sử',
            description: 'Xem lịch sử hoạt động',
            icon: 'time',
            color: '#f59e0b',
            bgColor: '#fef3c7',
            onPress: () => router.push('/logs'),
        },
        {
            id: 'statistics',
            title: 'Thống kê',
            description: 'Báo cáo và phân tích',
            icon: 'bar-chart',
            color: '#06b6d4',
            bgColor: '#cffafe',
            onPress: () => Alert.alert('Thống kê', 'Chức năng đang phát triển'),
        },
        {
            id: 'settings',
            title: 'Cài đặt',
            description: 'Cấu hình hệ thống',
            icon: 'settings',
            color: '#64748b',
            bgColor: '#f1f5f9',
            onPress: () => Alert.alert('Cài đặt', 'Chức năng đang phát triển'),
        },
        {
            id: 'backup',
            title: 'Sao lưu',
            description: 'Backup & khôi phục',
            icon: 'cloud-upload',
            color: '#10b981',
            bgColor: '#d1fae5',
            onPress: () => Alert.alert('Sao lưu', 'Chức năng đang phát triển'),
        },
    ];

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
                    <Text style={styles.headerTitle}>Quản lý hệ thống</Text>
                </View>
            </LinearGradient>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>

                <View style={styles.gridContainer}>
                    {systemActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.gridCard}
                            onPress={action.onPress}
                            activeOpacity={0.7}>
                            <View style={[styles.cardGradient, { backgroundColor: action.bgColor }]}>
                                <View style={[styles.iconWrapper, { backgroundColor: '#fff' }]}>
                                    <Ionicons
                                        name={action.icon as any}
                                        size={40}
                                        color={action.color}
                                    />
                                </View>

                                <View style={styles.cardContent}>
                                    <Text style={styles.cardTitle}>{action.title}</Text>
                                    <Text style={styles.cardDescription}>
                                        {action.description}
                                    </Text>
                                </View>

                                <View style={styles.cardFooter}>
                                    <View style={[styles.actionIndicator, { backgroundColor: action.color }]}>
                                        <Ionicons name="arrow-forward" size={16} color="#fff" />
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            <AddRoomModal visible={showRoomModal} onClose={() => setShowRoomModal(false)} />
            <AddRoomTypeModal visible={showRoomTypeModal} onClose={() => setShowRoomTypeModal(false)} />
            <AddServiceModal visible={showServiceModal} onClose={() => setShowServiceModal(false)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuButton: {
        width: 44, height: 44, borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center', alignItems: 'center'
    },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff', flex: 1 },
    scrollContent: { padding: 16 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    gridCard: {
        width: CARD_WIDTH, borderRadius: 20, overflow: 'hidden',
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08, shadowRadius: 12
    },
    cardGradient: { padding: 20, minHeight: 180, justifyContent: 'space-between' },
    iconWrapper: {
        width: 64, height: 64, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
        elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 8
    },
    cardContent: { marginTop: 16, marginBottom: 12 },
    cardTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 4 },
    cardDescription: { fontSize: 12, color: '#64748b', fontWeight: '500', lineHeight: 16 },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end' },
    actionIndicator: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
});