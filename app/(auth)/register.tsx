import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

  const handleRegister = async () => {
    let hasError = false;

    if (!name.trim()) {
      setNameError('Vui lòng nhập họ và tên');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Vui lòng nhập email hợp lệ');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!phone.trim()) {
      setPhoneError('Vui lòng nhập số điện thoại');
      hasError = true;
    } else if (phone.length < 10) {
      setPhoneError('Số điện thoại phải có ít nhất 10 chữ số');
      hasError = true;
    } else {
      setPhoneError('');
    }

    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    if (!agreeTerms) {
      setTermsError('Vui lòng đồng ý với Điều Khoản và Chính Sách Bảo Mật');
      hasError = true;
    } else {
      setTermsError('');
    }

    if (hasError) return;

    try {
      setLoading(true);

      // Gửi fullName thay vì name để khớp với backend
      await authService.register({
        fullName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password,
      });

      Alert.alert(
        'Thành Công',
        'Đăng ký thành công! Vui lòng đăng nhập bằng thông tin của bạn.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      Alert.alert('Đăng Ký Thất Bại', errorMessage);

      if (errorMessage.toLowerCase().includes('email')) {
        setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes('phone')) {
        setPhoneError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
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

          <View style={styles.header}>
            <Image
              style={styles.logo}
              source={require('../../assets/images/HotelManager.png')}
            />
            <Text style={styles.title}>Tạo Tài Khoản</Text>
            <Text style={styles.subtitle}>Tham gia cùng chúng tôi để bắt đầu mua sắm</Text>
          </View>

          <View style={styles.form}>
            <View>
              <View style={[styles.input, nameError && styles.inputError]}>
                <Ionicons name="person" size={20} color="#1f2035ff" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Họ và Tên"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError('');
                  }}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
                />
              </View>
              {nameError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{nameError}</Text>
                </View>
              ) : null}
            </View>

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
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
                />
              </View>
              {emailError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

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
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
                />
              </View>
              {phoneError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{phoneError}</Text>
                </View>
              ) : null}
            </View>

            <View>
              <View style={[styles.input, passwordError && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color="#1f2035ff" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Mật Khẩu"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setPasswordError('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
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
                    setConfirmPasswordError('');
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
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

            <View>
              <TouchableOpacity
                style={styles.terms}
                onPress={() => {
                  setAgreeTerms(!agreeTerms);
                  setTermsError('');
                }}
                disabled={loading}>
                <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                  {agreeTerms && <View style={styles.checkDot} />}
                </View>
                <Text style={styles.termsTxt}>
                  Tôi đồng ý với Điều Khoản Dịch Vụ và Chính Sách Bảo Mật
                </Text>
              </TouchableOpacity>
              {termsError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{termsError}</Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              style={styles.btnWrap}
              disabled={loading}>
              <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.btnTxt}>Tạo Tài Khoản</Text>
                    <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerTxt}>HOẶC</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.social}>
              <TouchableOpacity style={styles.socialBtn} disabled={loading}>
                <Ionicons name="logo-google" size={22} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} disabled={loading}>
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn} disabled={loading}>
                <Ionicons name="logo-apple" size={22} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.signin}>
              <Text style={styles.signinTxt}>Đã có tài khoản? </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}>
                <Text style={styles.signinLink}>Đăng Nhập</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 80,
    paddingBottom: 40,
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
    fontSize: 36,
    fontWeight: '800',
    color: '#1f2035ff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
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
  terms: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#1f2035ff',
    borderColor: '#1f2035ff',
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  termsTxt: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    lineHeight: 20,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerTxt: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '600',
  },
  social: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signin: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signinTxt: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  signinLink: {
    fontSize: 15,
    color: '#1f2035ff',
    fontWeight: '800',
  },
});