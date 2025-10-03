import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';
import { profileService } from '../services/profileService';
import { Slide } from '../components/Slide';
import { BottomStepper } from '../components/BottomStepper';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { Checkbox } from '../components/Checkbox';
import { UniversityPicker } from '../components/UniversityPicker';
import { popularUniversities } from '../data/popularUniversities';
import { spacing, borderRadius, fontSize, shadows, commonStyles } from '../utils/styles';
import { colors } from '../utils/colors';
import { contentContainer, safeAreaPadding } from '../utils/layout';
import { isValidEmail, isValidPassword, isValidName, isValidUniversity } from '../utils/validators';
import { t } from '../i18n';
import { RootStackParamList } from '../utils/types';

const { width: screenWidth } = Dimensions.get('window');
const TOTAL_SLIDES = 4;

interface OnboardingScreenProps {
  navigation: StackNavigationProp<RootStackParamList>;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    graduated: false,
    workplace: '',
  });
  
  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Check if in mock mode
  const useMock = process.env.USE_MOCK === 'true';

  const scrollToSlide = (slideIndex: number) => {
    if (slideIndex >= 0 && slideIndex < TOTAL_SLIDES) {
      scrollViewRef.current?.scrollTo({
        x: slideIndex * screenWidth,
        animated: true,
      });
      setCurrentSlide(slideIndex);
    }
  };

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  const handleSkip = () => {
    scrollToSlide(TOTAL_SLIDES - 1); // Jump to registration slide
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isValidName(formData.name)) {
      newErrors.name = t('validation_name_short');
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = t('validation_email_invalid');
    }

    if (!isValidPassword(formData.password)) {
      newErrors.password = t('validation_password_short');
    }

    if (!isValidUniversity(formData.university)) {
      newErrors.university = t('validation_university_required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegistration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      if (useMock) {
        // Mock mode - simulate registration
        await new Promise(resolve => setTimeout(resolve, 800));
        await AsyncStorage.setItem('legalia.onboarded', 'true');
        navigation.replace('Main');
        return;
      }

      // Real registration flow
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          }
        }
      });

      if (error) {
        Alert.alert(t('error_generic'), error.message || t('error_signup_failed'));
        return;
      }

      if (!data.user) {
        Alert.alert(t('error_generic'), t('error_signup_failed'));
        return;
      }

      // Create empty profile
      await profileService.upsertEmptyProfile(data.user.id);

      // Set user university
      await profileService.setUserUniversity({
        userId: data.user.id,
        name: formData.university,
        graduated: formData.graduated,
        workplace: formData.graduated ? formData.workplace || null : null,
      });

      // Award signup bonus
      await profileService.awardSignupBonus(data.user.id);

      // Mark as onboarded and navigate
      await AsyncStorage.setItem('legalia.onboarded', 'true');
      navigation.replace('Main');

    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(t('error_generic'), error.message || t('error_signup_failed'));
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleScroll = (event: any) => {
    const slideWidth = event.nativeEvent.layoutMeasurement.width;
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    setCurrentSlide(currentIndex);
  };

  const renderSlide1 = () => (
    <Slide
      title={t('onboarding_slide1_title')}
      subtitle={t('onboarding_slide1_text')}
      showLogo
    />
  );

  const renderSlide2 = () => (
    <Slide
      title={t('onboarding_slide2_title')}
      subtitle={t('onboarding_slide2_text')}
      iconName="bulb"
    >
      <View style={styles.featuresContainer}>
        {[
          t('onboarding_slide2_feature1'),
          t('onboarding_slide2_feature2'),
          t('onboarding_slide2_feature3'),
        ].map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.ai.primary}
            />
            <AppText variant="body" style={styles.featureText}>{feature}</AppText>
          </View>
        ))}
      </View>
    </Slide>
  );

  const renderSlide3 = () => (
    <Slide
      title={t('onboarding_slide3_title')}
      subtitle={t('onboarding_slide3_text')}
      iconName="trophy"
    />
  );

  const renderSlide4 = () => (
    <View style={styles.registrationSlide}>
      <View style={styles.registrationHeader}>
        <Image
          source={require('../../assets/legalia-logo.png')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <AppText variant="title" align="center" style={styles.registrationTitle}>
          {t('onboarding_slide4_title')}
        </AppText>
        <AppText variant="subtitle" align="center" color="secondary" style={styles.registrationSubtitle}>
          {t('onboarding_slide4_subtitle')}
        </AppText>
      </View>
      
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={160}
      >
        <ScrollView 
          style={styles.formScrollView}
          contentContainerStyle={[
            styles.formScrollContent,
            { paddingBottom: Math.max(insets.bottom, safeAreaPadding.bottom) + 24 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
          {/* Name input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder={t('field_name')}
              placeholderTextColor={colors.text.tertiary}
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              autoCapitalize="words"
              accessibilityLabel={t('field_name')}
              accessibilityHint={t('field_name_hint')}
            />
            {errors.name && <AppText variant="caption" style={styles.errorText}>{errors.name}</AppText>}
          </View>

          {/* Email input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder={t('field_email')}
              placeholderTextColor={colors.text.tertiary}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel={t('field_email')}
              accessibilityHint={t('field_email_hint')}
            />
            {errors.email && <AppText variant="caption" style={styles.errorText}>{errors.email}</AppText>}
          </View>

          {/* Password input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.password ? styles.inputError : null]}
              placeholder={t('field_password')}
              placeholderTextColor={colors.text.tertiary}
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              accessibilityLabel={t('field_password')}
              accessibilityHint={t('field_password_hint')}
            />
            {errors.password && <AppText variant="caption" style={styles.errorText}>{errors.password}</AppText>}
          </View>

          {/* University picker */}
          <View style={styles.inputContainer}>
            <UniversityPicker
              value={formData.university}
              onChange={(name) => updateFormData('university', name)}
              popular={popularUniversities}
            />
            {errors.university && <AppText variant="caption" style={styles.errorText}>{errors.university}</AppText>}
            <AppText variant="caption" color="tertiary" style={styles.universityHint}>{t('university_hint')}</AppText>
          </View>

          {/* Graduate checkbox */}
          <Checkbox
            checked={formData.graduated}
            onPress={() => updateFormData('graduated', !formData.graduated)}
            label={t('checkbox_graduate')}
          />

          {/* Workplace input (conditional) */}
          {formData.graduated && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t('field_workplace')}
                placeholderTextColor={colors.text.tertiary}
                value={formData.workplace}
                onChangeText={(text) => updateFormData('workplace', text)}
                autoCapitalize="words"
                accessibilityLabel={t('field_workplace')}
                accessibilityHint={t('field_workplace_hint')}
              />
            </View>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Login Link */}
      <View style={styles.loginLinkContainer}>
        <AppText variant="body" align="center" style={styles.loginLinkText}>
          {t('auth_have_account')}{' '}
          <AppText 
            variant="body"
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
          >
            {t('auth_login_link')}
          </AppText>
        </AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {renderSlide1()}
        {renderSlide2()}
        {renderSlide3()}
        {renderSlide4()}
      </ScrollView>

      <BottomStepper
        page={currentSlide}
        total={TOTAL_SLIDES}
        onPrev={currentSlide > 0 ? handleBack : undefined}
        onNext={currentSlide < TOTAL_SLIDES - 1 ? handleNext : handleRegistration}
        onSkip={currentSlide < TOTAL_SLIDES - 1 ? handleSkip : undefined}
        nextLabel={currentSlide < TOTAL_SLIDES - 1 ? t('btn_next') : t('btn_create_account')}
        nextDisabled={loading}
        nextLoading={loading && currentSlide === TOTAL_SLIDES - 1}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  
  featuresContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  
  registrationSlide: {
    width: screenWidth,
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  registrationHeader: {
    paddingTop: spacing.xl,
    paddingHorizontal: 24,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  headerLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  registrationTitle: {
    marginBottom: spacing.sm,
  },
  registrationSubtitle: {
    // AppText handles styling
  },
  
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formScrollView: {
    flex: 1,
  },
  formScrollContent: {
    flexGrow: 1,
  },
  form: {
    paddingBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 48,
    ...shadows.small,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    ...commonStyles.bodySM,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
  universityHint: {
    ...commonStyles.bodySM,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  loginLinkContainer: {
    paddingHorizontal: 24,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  loginLinkText: {
    ...commonStyles.bodyMD,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loginLink: {
    color: colors.ai.primary,
    fontWeight: '600',
  },
});