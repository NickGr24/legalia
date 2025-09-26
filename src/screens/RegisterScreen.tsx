import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../utils/types';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await signUp(email.trim(), password);
      if (error) {
        Alert.alert('Registration Failed', error.message);
      }
    } catch (error) {
      Alert.alert('Registration Failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert('Google Registration Failed', error.message);
      }
    } catch (error) {
      Alert.alert('Google Registration Failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Logo/Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../../assets/icon.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.title}>Join Legalia</Text>
              <Text style={styles.subtitle}>Start your legal education journey</Text>
            </View>

            {/* Registration Form */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.text.onPrimary + 'B3'} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={colors.text.onPrimary + '99'}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                              <Ionicons name="lock-closed-outline" size={20} color={colors.text.onPrimary + 'B3'} />
              <TextInput
                style={styles.input}
                placeholder="Password (min. 6 characters)"
                placeholderTextColor={colors.text.onPrimary + '99'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colors.text.onPrimary + 'B3'} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.inputContainer}>
                              <Ionicons name="lock-closed-outline" size={20} color={colors.text.onPrimary + 'B3'} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.text.onPrimary + '99'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={colors.text.onPrimary + 'B3'} 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? [colors.text.tertiary, colors.text.secondary] : colors.gradients.primary}
                  style={styles.registerButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Text style={styles.registerButtonText}>Create Account</Text>
                      <Ionicons name="arrow-forward" size={20} color="white" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Register Button */}
              <TouchableOpacity
                style={[styles.socialButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleGoogleRegister}
                disabled={isLoading}
              >
                <View style={styles.socialButtonContent}>
                  <Ionicons name="logo-google" size={20} color={colors.status.error} />
                  <Text style={styles.socialButtonText}>Continue with Google</Text>
                </View>
              </TouchableOpacity>

              {/* Login Link */}
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
                disabled={isLoading}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account? <Text style={styles.loginLinkTextBold}>Sign in</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ai.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.ai.glassBorder,
  },
  logo: {
    width: 70,
    height: 70,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.onPrimary + 'CC',
    fontFamily: fontConfig.body,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ai.glass,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.body,
    marginLeft: spacing.md,
  },
  registerButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  registerButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.text.onPrimary + '4D',
  },
  dividerText: {
    fontSize: fontSize.sm,
    color: colors.text.onPrimary + '99',
    fontFamily: fontConfig.body,
    marginHorizontal: spacing.lg,
  },
  socialButton: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  socialButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#333',
    fontFamily: fontConfig.body,
  },
  loginLink: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  loginLinkText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fontConfig.body,
    textAlign: 'center',
  },
  loginLinkTextBold: {
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fontConfig.body,
    textAlign: 'center',
    lineHeight: fontSize.xs * 1.4,
  },
});