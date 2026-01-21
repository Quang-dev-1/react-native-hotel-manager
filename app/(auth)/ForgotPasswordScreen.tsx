import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
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
import authService from '../../services/authService';

export default function ForgotPasswordScreen() {
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [emailError, setEmailError] = useState('');
    const [otpError, setOtpError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handleSendOTP = async () => {
        // Validate email
        if (!email.trim()) {
            setEmailError('Vui lòng nhập email');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setEmailError('Vui lòng nhập email hợp lệ');
            return;
        }

        setEmailError('');
        setLoading(true);

        try {
            await authService.forgotPassword({ email: email.trim() });

            Alert.alert(
                'Thành Công!',
                'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).',
                [{ text: 'OK', onPress: () => setStep('otp') }]
            );
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể gửi mã OTP');
            setEmailError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = () => {
        // Validate OTP
        if (!otp.trim()) {
            setOtpError('Vui lòng nhập mã OTP');
            return;
        }

        if (otp.length !== 6) {
            setOtpError('Mã OTP phải có 6 chữ số');
            return;
        }

        setOtpError('');
        // Chuyển sang bước nhập mật khẩu
        setStep('password');
    };

    const handleResetPassword = async () => {
        let hasError = false;

        // Validate new password
        if (!newPassword.trim()) {
            setPasswordError('Vui lòng nhập mật khẩu mới');
            hasError = true;
        } else if (newPassword.length < 6) {
            setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
            hasError = true;
        } else {
            setPasswordError('');
        }

        // Validate confirm password
        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Mật khẩu không khớp');
            hasError = true;
        } else {
            setConfirmPasswordError('');
        }

        if (hasError) return;

        setLoading(true);

        try {
            await authService.resetPassword({
                token: otp.trim(),
                newPassword: newPassword.trim(),
            });

            Alert.alert(
                'Thành Công!',
                'Mật khẩu của bạn đã được đặt lại thành công.',
                [{ text: 'Đến Đăng Nhập', onPress: () => router.replace('/(auth)/login') }]
            );
        } catch (error: any) {
            if (error.message.includes('không hợp lệ') || error.message.includes('hết hạn')) {
                Alert.alert(
                    'Lỗi',
                    'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.',
                    [{
                        text: 'Gửi Lại OTP', onPress: () => {
                            setStep('email');
                            setOtp('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setOtpError('');
                            setPasswordError('');
                            setConfirmPasswordError('');
                        }
                    }]
                );
            } else {
                Alert.alert('Lỗi', error.message || 'Không thể đặt lại mật khẩu');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);

        try {
            await authService.forgotPassword({ email: email.trim() });
            Alert.alert('Thành Công', 'Mã OTP mới đã được gửi đến email của bạn');
            setOtp('');
            setOtpError('');
        } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể gửi lại mã OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step === 'email') {
            router.back();
        } else if (step === 'otp') {
            setStep('email');
            setOtp('');
            setOtpError('');
        } else {
            setStep('otp');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordError('');
            setConfirmPasswordError('');
        }
    };

    const getTitle = () => {
        if (step === 'email') return 'Quên Mật Khẩu?';
        if (step === 'otp') return 'Xác Thực OTP';
        return 'Mật Khẩu Mới';
    };

    const getSubtitle = () => {
        if (step === 'email') return 'Nhập email để nhận mã OTP xác thực';
        if (step === 'otp') return 'Nhập mã OTP được gửi đến email của bạn';
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
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack} disabled={loading}>
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
                        {/* Bước 1: Email */}
                        {step === 'email' && (
                            <>
                                <View>
                                    <View style={[styles.input, emailError && styles.inputError]}>
                                        <Ionicons name="mail" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Email"
                                            value={email}
                                            onChangeText={(text) => {
                                                setEmail(text);
                                                setEmailError('');
                                            }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoFocus
                                            editable={!loading}
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                    {emailError ? (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text style={styles.errorText}>{emailError}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <TouchableOpacity
                                    onPress={handleSendOTP}
                                    style={styles.btnWrap}
                                    disabled={loading}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Text style={styles.btnTxt}>Gửi Mã OTP</Text>
                                                <Ionicons name="send" size={20} color="#fff" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Bước 2: Nhập OTP */}
                        {step === 'otp' && (
                            <>
                                <View>
                                    <View style={[styles.input, otpError && styles.inputError]}>
                                        <Ionicons name="key" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={[styles.textInput, styles.codeInput]}
                                            placeholder="------"
                                            value={otp}
                                            onChangeText={(text) => {
                                                setOtp(text);
                                                setOtpError('');
                                            }}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            autoFocus
                                            editable={!loading}
                                            placeholderTextColor="#9ca3af"
                                        />
                                    </View>
                                    {otpError ? (
                                        <View style={styles.errorContainer}>
                                            <Ionicons name="alert-circle" size={14} color="#ef4444" />
                                            <Text style={styles.errorText}>{otpError}</Text>
                                        </View>
                                    ) : null}
                                </View>

                                <View style={styles.resend}>
                                    <Text style={styles.resendTxt}>Chưa nhận được mã? </Text>
                                    <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                                        <Text style={[styles.resendLink, loading && styles.disabled]}>
                                            {loading ? 'Đang gửi...' : 'Gửi Lại'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleVerifyOTP}
                                    style={styles.btnWrap}
                                    disabled={loading}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Text style={styles.btnTxt}>Xác Thực</Text>
                                                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Bước 3: Mật Khẩu Mới */}
                        {step === 'password' && (
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
                                            editable={!loading}
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
                                            editable={!loading}
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

                                <TouchableOpacity
                                    onPress={handleResetPassword}
                                    style={styles.btnWrap}
                                    disabled={loading}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <>
                                                <Text style={styles.btnTxt}>Đặt Lại Mật Khẩu</Text>
                                                <Ionicons name="shield-checkmark" size={20} color="#fff" />
                                            </>
                                        )}
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
    disabled: {
        opacity: 0.5,
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