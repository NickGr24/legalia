import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../utils/styles';
import { colors } from '../utils/colors';

interface SlideProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  hasIllustration?: boolean;
  showLogo?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive font sizing based on screen size
const getResponsiveFontSizes = () => {
  const baseWidth = 375; // iPhone SE width as base
  const scale = screenWidth / baseWidth;
  
  return {
    title: Math.min(Math.max(28 * scale, 24), 32), // 24-32px range
    subtitle: Math.min(Math.max(16 * scale, 14), 18), // 14-18px range
  };
};

const fontSizes = getResponsiveFontSizes();

export const Slide: React.FC<SlideProps> = ({
  title,
  subtitle,
  children,
  hasIllustration = false,
  showLogo = false,
  iconName
}) => {
  // Dynamic illustration size based on screen
  const illustrationSize = Math.min(Math.max(screenWidth * 0.32, 120), 160);
  const logoSize = Math.min(Math.max(screenWidth * 0.45, 150), 200);
  const iconSize = Math.min(Math.max(screenWidth * 0.25, 100), 140);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Title and Subtitle */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: fontSizes.title }]} accessibilityRole="header">
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.subtitle, { fontSize: fontSizes.subtitle }]}
              accessibilityRole="text"
            >
              {subtitle}
            </Text>
          )}
        </View>

        {/* Logo */}
        {showLogo && (
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/legalia-logo.png')}
              style={{
                width: logoSize,
                height: logoSize,
                borderRadius: logoSize * 0.25,
              }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Icon */}
        {iconName && !showLogo && (
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { width: iconSize, height: iconSize }]}>
              <Ionicons
                name={iconName}
                size={iconSize * 0.55}
                color={colors.ai.primary}
              />
            </View>
          </View>
        )}

        {/* Optional Illustration */}
        {hasIllustration && !showLogo && !iconName && (
          <View style={styles.illustrationContainer}>
            <View style={[
              styles.illustration,
              {
                width: illustrationSize,
                height: illustrationSize,
              }
            ]} />
          </View>
        )}

        {/* Flexible Spacer */}
        <View style={styles.spacer} />

        {/* Custom Content */}
        {children && (
          <View style={styles.childrenContainer}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: fontSizes.title * 1.2,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  subtitle: {
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: fontSizes.subtitle * 1.4,
    paddingHorizontal: spacing.xs,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  iconCircle: {
    backgroundColor: colors.ai.glass,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.ai.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  illustration: {
    borderRadius: 16,
    backgroundColor: colors.ai.glass,
    borderWidth: 1,
    borderColor: colors.border.glass,
  },
  spacer: {
    flex: 1,
    minHeight: spacing.md,
  },
  childrenContainer: {
    width: '100%',
    alignItems: 'center',
  },
});