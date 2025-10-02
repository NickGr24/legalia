import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { spacing, borderRadius, fontSize, fontWeight, shadows, commonStyles } from '../utils/styles';
import { colors } from '../utils/colors';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
      ...styles[`${variant}Button`],
    };
    
    if (isDisabled) {
      return { ...baseStyle, ...styles.disabled };
    }
    
    return baseStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    return {
      ...styles.text,
      ...styles[`${size}Text`],
      ...styles[`${variant}Text`],
      ...(isDisabled && styles.disabledText),
    };
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' ? colors.ai.primary : colors.text.onPrimary} 
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  
  // Sizes
  smallButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
  },
  largeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 56,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: colors.ai.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface.elevated,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.ai.primary,
  },
  
  // Text styles
  text: {
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  smallText: {
    fontSize: fontSize.sm,
  },
  mediumText: {
    fontSize: fontSize.md,
  },
  largeText: {
    fontSize: fontSize.lg,
  },
  
  // Text variants
  primaryText: {
    color: colors.text.onPrimary,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  outlineText: {
    color: colors.ai.primary,
  },
  
  // Disabled states
  disabled: {
    opacity: 0.5,
    ...shadows.none,
  },
  disabledText: {
    opacity: 0.7,
  },
});