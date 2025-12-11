import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');

  const handleRegister = () => {
    let hasError = false;

    // Validate name
    if (!name.trim()) {
      setNameError('Please enter your full name');
      hasError = true;
    } else {
      setNameError('');
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Please enter your email');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Validate phone
    if (!phone.trim()) {
      setPhoneError('Please enter your phone number');
      hasError = true;
    } else if (phone.length < 10) {
      setPhoneError('Phone number must be at least 10 digits');
      hasError = true;
    } else {
      setPhoneError('');
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Please enter your password');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    } else {
      setPasswordError('');
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      setConfirmPasswordError('Please confirm your password');
      hasError = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasError = true;
    } else {
      setConfirmPasswordError('');
    }

    // Validate terms
    if (!agreeTerms) {
      setTermsError('Please agree to Terms and Privacy Policy');
      hasError = true;
    } else {
      setTermsError('');
    }

    if (hasError) return;

    // Registration successful
    router.replace('/(tabs)/shop');
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

          {/* Logo & Title */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#1f2035ff', '#151165ff']}
              style={styles.logo}>
              <Image
                style={styles.logoImg}
                source={require('../../assets/images/logo_shopp.png')}
              />
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to start shopping</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View>
              <View style={[styles.input, nameError && styles.inputError]}>
                <Ionicons name="person" size={20} color="#1f2035ff" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setNameError('');
                  }}
                  autoCapitalize="words"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              {nameError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{nameError}</Text>
                </View>
              ) : null}
            </View>

            {/* Email Input */}
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
                />
              </View>
              {emailError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            {/* Phone Input */}
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

            {/* Password Input */}
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

            {/* Confirm Password Input */}
            <View>
              <View style={[styles.input, confirmPasswordError && styles.inputError]}>
                <Ionicons name="lock-closed" size={20} color="#1f2035ff" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setConfirmPasswordError('');
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

            {/* Terms Checkbox */}
            <View>
              <TouchableOpacity
                style={styles.terms}
                onPress={() => {
                  setAgreeTerms(!agreeTerms);
                  setTermsError('');
                }}>
                <View style={[styles.checkbox, agreeTerms && styles.checkboxActive]}>
                  {agreeTerms && <View style={styles.checkDot} />}
                </View>
                <Text style={styles.termsTxt}>
                  I agree to the Terms of Service and Privacy Policy
                </Text>
              </TouchableOpacity>
              {termsError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#ef4444" />
                  <Text style={styles.errorText}>{termsError}</Text>
                </View>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity onPress={handleRegister} style={styles.btnWrap}>
              <LinearGradient colors={['#1f2035ff', '#151165ff']} style={styles.btn}>
                <Text style={styles.btnTxt}>Create Account</Text>
                <Ionicons name="arrow-forward-circle" size={24} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerTxt}>OR</Text>
              <View style={styles.line} />
            </View>

            {/* Social Buttons */}
            <View style={styles.social}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={22} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={22} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View style={styles.signin}>
              <Text style={styles.signinTxt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.signinLink}>Sign In</Text>
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
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImg: {
    width: 60,
    height: 60,
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