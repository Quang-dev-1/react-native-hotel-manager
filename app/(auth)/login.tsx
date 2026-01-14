import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

const STORAGE_KEYS = {
  REMEMBER_ME: '@remember_me',
  SAVED_EMAIL: '@saved_email',
  SAVED_PASSWORD: '@saved_password',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Load saved credentials khi component mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedRememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);

      if (savedRememberMe === 'true') {
        const savedEmail = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_EMAIL);
        const savedPassword = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD);

        if (savedEmail) setEmail(savedEmail);
        if (savedPassword) setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, email.trim());
        await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PASSWORD, password);
      } else {
        // Xóa thông tin đã lưu nếu không chọn remember me
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.REMEMBER_ME,
          STORAGE_KEYS.SAVED_EMAIL,
          STORAGE_KEYS.SAVED_PASSWORD,
        ]);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const handleLogin = async () => {
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Please enter your email');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Please enter your password');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    try {
      setLoading(true);

      const response = await authService.login({
        email: email.trim(),
        password: password,
      });

      // Lưu thông tin đăng nhập nếu thành công
      await saveCredentials();

      Alert.alert('Success', 'Login successful!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(drawer)/dashboard'),
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setEmailError(errorMessage);
      setPasswordError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeToggle = async () => {
    const newValue = !rememberMe;
    setRememberMe(newValue);

    // Nếu bỏ chọn remember me, xóa thông tin đã lưu ngay lập tức
    if (!newValue) {
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.REMEMBER_ME,
          STORAGE_KEYS.SAVED_EMAIL,
          STORAGE_KEYS.SAVED_PASSWORD,
        ]);
      } catch (error) {
        console.error('Error removing saved credentials:', error);
      }
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
            <Text style={styles.title}>Login Account</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          <View style={styles.form}>
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
              <View style={[styles.input, passwordError && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color="#1f2035ff" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
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

            <View style={styles.row}>
              <TouchableOpacity
                style={styles.remember}
                onPress={handleRememberMeToggle}
                disabled={loading}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <View style={styles.checkDot} />}
                </View>
                <Text style={styles.rememberTxt}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/ForgotPasswordScreen')}
                disabled={loading}>
                <Text style={styles.forgot}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.btnWrap}
              disabled={loading}>
              <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.btnTxt}>Sign In</Text>
                    <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerTxt}>OR</Text>
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

            <View style={styles.signup}>
              <Text style={styles.signupTxt}>Don`t have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                disabled={loading}>
                <Text style={styles.signupLink}>Sign Up</Text>
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  rememberTxt: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  forgot: {
    fontSize: 14,
    color: '#1f2035ff',
    fontWeight: '700',
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
  signup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  signupTxt: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  signupLink: {
    fontSize: 15,
    color: '#1f2035ff',
    fontWeight: '800',
  },
});