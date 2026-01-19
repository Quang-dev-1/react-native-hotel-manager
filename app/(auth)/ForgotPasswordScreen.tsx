import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState<'phone' | 'code' | 'newPassword'>('phone');
    const [phone, setPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [phoneError, setPhoneError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const mockUsers = ['0367287044', '0912345678', '0987654321'];
    const mockVerificationCode = '123456';

    const handleSendCode = () => {
        if (!phone.trim()) {
            setPhoneError('Vui lòng nhập số điện thoại');
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            setPhoneError('Vui lòng nhập số điện thoại hợp lệ gồm 10 chữ số');
            return;
        }

        if (!mockUsers.includes(phone)) {
            setPhoneError('Số điện thoại này chưa được đăng ký trong hệ thống');
            return;
        }

        setPhoneError('');
        Alert.alert(
            'Đã Gửi Mã Xác Thực',
            `Mã xác thực đã được gửi đến ${phone}\n\nĐể kiểm tra, sử dụng mã: 123456`,
            [{ text: 'OK', onPress: () => setStep('code') }]
        );
    };

    const handleVerifyCode = () => {
        if (!verificationCode.trim()) {
            setCodeError('Vui lòng nhập mã xác thực');
            return;
        }

        if (verificationCode !== mockVerificationCode) {
            setCodeError('Mã xác thực không hợp lệ. Vui lòng thử lại');
            return;
        }

        setCodeError('');
        setStep('newPassword');
    };

    const handleResetPassword = () => {
        let hasError = false;

        if (!newPassword.trim()) {
            setPasswordError('Vui lòng nhập mật khẩu mới');
            hasError = true;
        } else if (newPassword.length < 6) {
            setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
            hasError = true;
        } else {
            setPasswordError('');
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Mật khẩu không khớp');
            hasError = true;
        } else {
            setConfirmPasswordError('');
        }

        if (hasError) return;

        Alert.alert(
            'Thành Công!',
            'Mật khẩu của bạn đã được đặt lại thành công.',
            [{ text: 'Đến Đăng Nhập', onPress: () => router.replace('/(auth)/login') }]
        );
    };

    const handleResendCode = () => {
        Alert.alert('Đã Gửi Lại Mã', `Mã xác thực mới đã được gửi đến ${phone}\n\nĐể kiểm tra, sử dụng mã: 123456`);
    };

    const handleBack = () => {
        if (step === 'phone') {
            router.back();
        } else if (step === 'code') {
            setStep('phone');
            setCodeError('');
        } else {
            setStep('code');
            setPasswordError('');
            setConfirmPasswordError('');
        }
    };

    const getTitle = () => {
        if (step === 'phone') return 'Quên Mật Khẩu?';
        if (step === 'code') return 'Mã Xác Thực';
        return 'Mật Khẩu Mới';
    };

    const getSubtitle = () => {
        if (step === 'phone') return 'Nhập số điện thoại để nhận mã xác thực';
        if (step === 'code') return 'Nhập mã được gửi đến điện thoại của bạn';
        return 'Tạo mật khẩu mới cho tài khoản của bạn';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}>
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">

                    {/* Nút Quay Lại */}
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1f2035ff" />
                    </TouchableOpacity>

                    {/* Logo & Tiêu Đề */}
                    <View style={styles.header}>
                        <Image
                            style={styles.logo}
                            source={require('../../assets/images/HotelManager.png')}
                        />
                        <Text style={styles.title}>{getTitle()}</Text>
                        <Text style={styles.subtitle}>{getSubtitle()}</Text>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        {/* Bước 1: Số Điện Thoại */}
                        {step === 'phone' && (
                            <>
                                <View>
                                    <View style={[styles.input, phoneError && styles.inputError]}>
                                        <Ionicons name="call" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Số Điện Thoại"
                                            value={phone}
                                            onChangeText={(text) => {
                                                setPhone(text);
                                                setPhoneError('');
                                            }}
                                            keyboardType="phone-pad"
                                            autoFocus
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                    {phoneError ? (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text style={styles.errorText}>{phoneError}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <TouchableOpacity onPress={handleSendCode} style={styles.btnWrap}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        <Text style={styles.btnTxt}>Gửi Mã</Text>
                                        <Ionicons name="send" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Bước 2: Mã Xác Thực */}
                        {step === 'code' && (
                            <>
                                <View>
                                    <View style={[styles.input, codeError && styles.inputError]}>
                                        <Ionicons name="key" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={[styles.textInput, styles.codeInput]}
                                            placeholder="------"
                                            value={verificationCode}
                                            onChangeText={(text) => {
                                                setVerificationCode(text);
                                                setCodeError('');
                                            }}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            autoFocus
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                    {codeError ? (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text style={styles.errorText}>{codeError}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <View style={styles.resend}>
                                    <Text style={styles.resendTxt}>Chưa nhận được mã? </Text>
                                    <TouchableOpacity onPress={handleResendCode}>
                                        <Text style={styles.resendLink}>Gửi Lại</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={handleVerifyCode} style={styles.btnWrap}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        <Text style={styles.btnTxt}>Xác Thực Mã</Text>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Bước 3: Mật Khẩu Mới */}
                        {step === 'newPassword' && (
                            <>
                                <View>
                                    <View style={[styles.input, passwordError && styles.inputError]}>
                                        <Ionicons name="lock-closed" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Mật Khẩu Mới"
                                            value={newPassword}
                                            onChangeText={(text) => {
                                                setNewPassword(text);
                                                setPasswordError('');
                                                if (confirmPassword && text !== confirmPassword) {
                                                    setConfirmPasswordError('Mật khẩu không khớp');
                                                } else {
                                                    setConfirmPasswordError('');
                                                }
                                            }}
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                            autoFocus
                                            placeholderTextColor="#9ca3af"
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>
                                    {passwordError ? (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text style={styles.errorText}>{passwordError}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <View>
                                    <View style={[styles.input, confirmPasswordError && styles.inputError]}>
                                        <Ionicons name="lock-closed" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Xác Nhận Mật Khẩu"
                                            value={confirmPassword}
                                            onChangeText={(text) => {
                                                setConfirmPassword(text);
                                                if (newPassword !== text) {
                                                    setConfirmPasswordError('Mật khẩu không khớp');
                                                } else {
                                                    setConfirmPasswordError('');
                                                }
                                            }}
                                            secureTextEntry={!showConfirmPassword}
                                            autoCapitalize="none"
                                            placeholderTextColor="#9ca3af"
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </View>
                                    {confirmPasswordError ? (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text style={styles.errorText}>{confirmPasswordError}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <View style={styles.requirements}>
                                    <Text style={styles.reqTitle}>Mật khẩu phải:</Text>
                                    <View style={styles.reqItem}>
                                        <Ionicons
                                            name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={newPassword.length >= 6 ? '#10b981' : '#9ca3af'}
                                        />
                                        <Text style={styles.reqTxt}>Có ít nhất 6 ký tự</Text>
                                    </View>
                                    <View style={styles.reqItem}>
                                        <Ionicons
                                            name={newPassword === confirmPassword && newPassword.length > 0 ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={newPassword === confirmPassword && newPassword.length > 0 ? '#10b981' : '#9ca3af'}
                                        />
                                        <Text style={styles.reqTxt}>Khớp với mật khẩu xác nhận</Text>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={handleResetPassword} style={styles.btnWrap}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        <Text style={styles.btnTxt}>Đặt Lại Mật Khẩu</Text>
                                        <Ionicons name="shield-checkmark" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    flex: {
        flex: 1,
    },
    scroll: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 40,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 90,
        height: 90,
        marginBottom: 20,
        borderRadius: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1f2035ff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        gap: 16,
    },
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 16,
        height: 60,
        gap: 12,
    },
    inputError: {
        borderColor: '#ef4444',
        borderWidth: 2,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: '#111',
        fontWeight: '500',
    },
    codeInput: {
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: 8,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 6,
        paddingHorizontal: 4,
    },
    errorText: {
        fontSize: 13,
        color: '#ef4444',
        fontWeight: '500',
    },
    resend: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resendTxt: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    resendLink: {
        fontSize: 14,
        color: '#1f2035ff',
        fontWeight: '800',
    },
    requirements: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    reqTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1f2035ff',
        marginBottom: 4,
    },
    reqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reqTxt: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    btnWrap: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
    },
    btn: {
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    btnTxt: {
        fontSize: 17,
        fontWeight: '700',
        color: '#fff',
    },
});