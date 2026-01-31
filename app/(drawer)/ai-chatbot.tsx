import chatbotService, { ChatMessage } from '@/services/chatbotService';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function AIChatbotScreen() {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    const handleSendMessage = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage = inputText.trim();
        setInputText('');

        // Thêm tin nhắn của user vào UI
        const tempMessage: ChatMessage = {
            userMessage: userMessage,
            aiResponse: '',
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            setLoading(true);

            // Gửi tin nhắn đến AI
            const response = await chatbotService.sendMessage({
                message: userMessage,
                userId: 'user-001', // Có thể lấy từ AsyncStorage
            });

            // Cập nhật với response từ AI
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = response;
                return updated;
            });

            // Scroll xuống cuối
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);

        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
            // Xóa tin nhắn lỗi
            setMessages(prev => prev.slice(0, -1));
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = useCallback(({ item, index }: { item: ChatMessage; index: number }) => (
        <View key={index} style={styles.messageContainer}>
            {/* User Message */}
            <View style={styles.userMessageWrapper}>
                <View style={styles.userMessage}>
                    <Text style={styles.userMessageText}>{item.userMessage}</Text>
                </View>
            </View>

            {/* AI Response */}
            {item.aiResponse ? (
                <View style={styles.aiMessageWrapper}>
                    <View style={styles.aiAvatar}>
                        <Ionicons name="chatbubbles" size={20} color="#fff" />
                    </View>
                    <View style={styles.aiMessage}>
                        <Text style={styles.aiMessageText}>{item.aiResponse}</Text>
                    </View>
                </View>
            ) : (
                <View style={styles.aiMessageWrapper}>
                    <View style={styles.aiAvatar}>
                        <Ionicons name="chatbubbles" size={20} color="#fff" />
                    </View>
                    <View style={styles.aiMessage}>
                        <ActivityIndicator size="small" color="#4a90e2" />
                        <Text style={styles.aiTypingText}>AI đang suy nghĩ...</Text>
                    </View>
                </View>
            )}
        </View>
    ), []);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0}>

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
                    <Text style={styles.headerTitle}>AI Trợ lý</Text>
                    <View style={{ width: 44 }} />
                </View>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.messagesList}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="chatbubbles-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>Xin chào! 👋</Text>
                        <Text style={styles.emptySubtitle}>
                            Tôi là trợ lý AI của hệ thống quản lý khách sạn.{'\n'}
                            Hãy hỏi tôi bất cứ điều gì!
                        </Text>
                    </View>
                }
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập câu hỏi của bạn..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={500}
                    editable={!loading}
                />
                <TouchableOpacity
                    style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
                    onPress={handleSendMessage}
                    disabled={!inputText.trim() || loading}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        paddingBottom: 20,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    },
    messagesList: {
        padding: 16,
    },
    messageContainer: {
        marginBottom: 20,
    },
    userMessageWrapper: {
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    userMessage: {
        backgroundColor: '#4a90e2',
        borderRadius: 16,
        borderBottomRightRadius: 4,
        padding: 12,
        maxWidth: '80%',
    },
    userMessageText: {
        color: '#fff',
        fontSize: 15,
        lineHeight: 20,
    },
    aiMessageWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    aiAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#8b5cf6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiMessage: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
        maxWidth: '75%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    aiMessageText: {
        color: '#1e293b',
        fontSize: 15,
        lineHeight: 22,
    },
    aiTypingText: {
        color: '#64748b',
        fontSize: 13,
        fontStyle: 'italic',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#4a90e2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#cbd5e1',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
    },
});