import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { spacing, borderRadius } from '@/utils/styles';
import { colors } from '@/utils/colors';

interface SlideProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  hasIllustration?: boolean;
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
  hasIllustration = false 
}) => {
  // Dynamic illustration size based on screen
  const illustrationSize = Math.min(Math.max(screenWidth * 0.32, 120), 160);

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
        
        {/* Optional Illustration */}
        {hasIllustration && (
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