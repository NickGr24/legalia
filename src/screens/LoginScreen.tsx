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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../utils/types';
import { t } from '../i18n';
import { isValidEmail } from '../utils/validators';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('error_generic'), t('validation_required'));
      return;
    }

    if (!isValidEmail(email.trim())) {
      Alert.alert(t('error_generic'), t('validation_email_invalid'));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        Alert.alert(t('error_generic'), error.message || t('error_login_failed'));
        return;
      }
      
      
    } catch (error) {
      console.error('❌ Login error:', error);
      Alert.alert(t('error_generic'), t('error_login_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        Alert.alert(t('error_generic'), error.message || t('error_login_failed'));
      }
    } catch (error) {
      console.error('🔴 handleGoogleLogin error:', error);
      Alert.alert(t('error_generic'), t('error_login_failed'));
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient
          colors={colors.gradients.background}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) }
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
        <View style={styles.content}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/legalia-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>{t('app_name')}</Text>
            <Text style={styles.subtitle}>Platformă de educație juridică</Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.text.onPrimary + 'B3'} />
              <TextInput
                style={styles.input}
                placeholder={t('field_email')}
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
                placeholder={t('field_password')}
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

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? [colors.text.tertiary, colors.text.secondary] : colors.gradients.primary}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>{t('btn_login')}</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Google Login Button */}
            <TouchableOpacity
              style={[styles.socialButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <View style={styles.socialButtonContent}>
                <Ionicons name="logo-google" size={20} color={colors.status.error} />
                <Text style={styles.socialButtonText}>Continuă cu Google</Text>
              </View>
            </TouchableOpacity>


            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Onboarding')}
              disabled={isLoading}
            >
              <Text style={styles.registerLinkText}>
                {t('auth_need_account')}{' '}
                <Text style={styles.registerLinkTextBold}>{t('auth_signup_link')}</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Transformând educația juridică prin experiențe alimentate de IA
            </Text>
          </View>
          </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.onPrimary + 'CC',
    fontFamily: fontConfig.body,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ai.glass,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
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
  loginButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginTop: spacing.lg,
    ...shadows.medium,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  loginButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.text.onPrimary + '99',
    fontFamily: fontConfig.body,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  socialButton: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
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
  registerLink: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  registerLinkText: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fontConfig.body,
    textAlign: 'center',
  },
  registerLinkTextBold: {
    fontWeight: fontWeight.bold,
    color: 'white',
  },
});