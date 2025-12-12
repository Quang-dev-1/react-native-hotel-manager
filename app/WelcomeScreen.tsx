import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
    Animated,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function WelcomeScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.3)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 10,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        router.replace('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient
                colors={['#fcfdffff', '#d4d2f4ff', '#bcbcfbff']}
                style={styles.gradient}>
                <View style={styles.circleTop} />
                <View style={styles.circleBottom} />

                <View style={styles.content}>
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ scale: scaleAnim }],
                            },
                        ]}>
                        <View style={styles.logoWrapper}>
                            <Image
                                style={styles.logo}
                                source={require('../assets/images/HotelManager.png')}
                            />
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.textContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}>
                        <Text style={styles.welcomeText}>Welcome to</Text>
                        <Text style={styles.appName}>Hotel Manager</Text>
                        <Text style={styles.tagline}>
                            Quản lý khách sạn hiệu quả
                        </Text>
                        <Text style={styles.description}>
                            Hệ thống quản lý khách sạn toàn diện với giao diện hiện đại
                        </Text>
                    </Animated.View>

                    {/* Features */}
                    <Animated.View
                        style={[
                            styles.featuresContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}>
                        <View style={styles.feature}>
                            <Ionicons name="bed" size={24} color="#fbbf24" />
                            <Text style={styles.featureText}>Quản lý phòng</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="calendar" size={24} color="#10b981" />
                            <Text style={styles.featureText}>Đặt phòng dễ dàng</Text>
                        </View>
                        <View style={styles.feature}>
                            <Ionicons name="bar-chart" size={24} color="#f59e0b" />
                            <Text style={styles.featureText}>Báo cáo chi tiết</Text>
                        </View>
                    </Animated.View>

                    <Animated.View
                        style={[
                            styles.buttonContainer,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleGetStarted}
                            activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#4a90e2', '#357abd']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}>
                                <Text style={styles.buttonText}>Bắt đầu</Text>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.replace('/(drawer)/dashboard')}
                            style={styles.skipButton}>
                            <Text style={styles.skipText}>Bỏ qua</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    circleTop: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
    },
    circleBottom: {
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: 'rgba(53, 122, 189, 0.1)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        paddingTop: 80,
    },
    logoContainer: {
        marginBottom: 40,
    },
    logoWrapper: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    logo: {
        width: 150,
        height: 150,
        borderRadius: 20,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    welcomeText: {
        fontSize: 20,
        color: '#d1d5db',
        marginBottom: 8,
        letterSpacing: 1,
    },
    appName: {
        fontSize: 48,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
        letterSpacing: 2,
    },
    tagline: {
        fontSize: 20,
        color: '#f3e7f5',
        marginBottom: 16,
        fontWeight: '600',
    },
    description: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    featuresContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 60,
        paddingHorizontal: 20,
    },
    feature: {
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 12,
        color: '#d1d5db',
        fontWeight: '600',
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 16,
    },
    button: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#4a90e2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 18,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    skipButton: {
        paddingVertical: 12,
    },
    skipText: {
        fontSize: 16,
        color: '#d1d5db',
        fontWeight: '600',
    },
});