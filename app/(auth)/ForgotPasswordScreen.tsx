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

    // Error states
    const [phoneError, setPhoneError] = useState('');
    const [codeError, setCodeError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const mockUsers = ['0367287044', '0912345678', '0987654321'];
    const mockVerificationCode = '123456';

    const handleSendCode = () => {
        if (!phone.trim()) {
            setPhoneError('Please enter phone number');
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            setPhoneError('Please enter a valid 10-digit phone number');
            return;
        }

        if (!mockUsers.includes(phone)) {
            setPhoneError('This phone number is not registered in our system');
            return;
        }

        setPhoneError('');
        Alert.alert(
            'Verification Code Sent',
            `A verification code has been sent to ${phone}\n\nFor testing, use code: 123456`,
            [{ text: 'OK', onPress: () => setStep('code') }]
        );
    };

    const handleVerifyCode = () => {
        if (!verificationCode.trim()) {
            setCodeError('Please enter the verification code');
            return;
        }

        if (verificationCode !== mockVerificationCode) {
            setCodeError('Invalid verification code. Please try again');
            return;
        }

        setCodeError('');
        setStep('newPassword');
    };

    const handleResetPassword = () => {
        let hasError = false;

        if (!newPassword.trim()) {
            setPasswordError('Please enter your new password');
            hasError = true;
        } else if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            hasError = true;
        } else {
            setPasswordError('');
        }

        if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            hasError = true;
        } else {
            setConfirmPasswordError('');
        }

        if (hasError) return;

        Alert.alert(
            'Success!',
            'Your password has been reset successfully.',
            [{ text: 'Go to Login', onPress: () => router.replace('/(auth)/login') }]
        );
    };

    const handleResendCode = () => {
        Alert.alert('Code Resent', `A new verification code has been sent to ${phone}\n\nFor testing, use code: 123456`);
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
        if (step === 'phone') return 'Forgot Password?';
        if (step === 'code') return 'Verification Code';
        return 'New Password';
    };

    const getSubtitle = () => {
        if (step === 'phone') return 'Enter your phone to receive a verification code';
        if (step === 'code') return 'Enter the code sent to your phone';
        return 'Create a new password for your account';
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

                    {/* Back Button */}
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <Ionicons name="arrow-back" size={24} color="#1f2035ff" />
                    </TouchableOpacity>

                    {/* Logo & Title */}
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
                        {/* Step 1: Phone */}
                        {step === 'phone' && (
                            <>
                                <View>
                                    <View style={[styles.input, phoneError && styles.inputError]}>
                                        <Ionicons name="call" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Phone Number"
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
                                        <Text style={styles.btnTxt}>Send Code</Text>
                                        <Ionicons name="send" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Step 2: Verification Code */}
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
                                    <Text style={styles.resendTxt}>Didn`t receive the code? </Text>
                                    <TouchableOpacity onPress={handleResendCode}>
                                        <Text style={styles.resendLink}>Resend</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={handleVerifyCode} style={styles.btnWrap}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        <Text style={styles.btnTxt}>Verify Code</Text>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        )}

                        {/* Step 3: New Password */}
                        {step === 'newPassword' && (
                            <>
                                <View>
                                    <View style={[styles.input, passwordError && styles.inputError]}>
                                        <Ionicons name="lock-closed" size={20} color="#1f2035ff" />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="New Password"
                                            value={newPassword}
                                            onChangeText={(text) => {
                                                setNewPassword(text);
                                                setPasswordError('');
                                                if (confirmPassword && text !== confirmPassword) {
                                                    setConfirmPasswordError('Passwords do not match');
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
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChangeText={(text) => {
                                                setConfirmPassword(text);
                                                if (newPassword !== text) {
                                                    setConfirmPasswordError('Passwords do not match');
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
                                    <Text style={styles.reqTitle}>Password must:</Text>
                                    <View style={styles.reqItem}>
                                        <Ionicons
                                            name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={newPassword.length >= 6 ? '#10b981' : '#9ca3af'}
                                        />
                                        <Text style={styles.reqTxt}>Be at least 6 characters</Text>
                                    </View>
                                    <View style={styles.reqItem}>
                                        <Ionicons
                                            name={newPassword === confirmPassword && newPassword.length > 0 ? 'checkmark-circle' : 'ellipse-outline'}
                                            size={16}
                                            color={newPassword === confirmPassword && newPassword.length > 0 ? '#10b981' : '#9ca3af'}
                                        />
                                        <Text style={styles.reqTxt}>Match confirmation password</Text>
                                    </View>
                                </View>

                                <TouchableOpacity onPress={handleResetPassword} style={styles.btnWrap}>
                                    <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                                        <Text style={styles.btnTxt}>Reset Password</Text>
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