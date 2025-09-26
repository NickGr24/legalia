import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/utils/colors';
import { shadowStyles, borderRadii } from '@/utils/shadow';
import { layoutSpacing } from '@/utils/layout';

interface AppButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'text' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  children: string;
  style?: ViewStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled,
  children,
  style,
  ...props
}) => {
  const isDisabled = disabled || loading;
  
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    !isDisabled && variant !== 'text' && shadowStyles.button,
    style,
  ];

  const textColor = getTextColor(variant, isDisabled);

  return (
    <TouchableOpacity
      {...props}
      style={buttonStyle}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
        />
      ) : (
        <AppText
          variant="button"
          color={textColor as any}
          align="center"
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          {children}
        </AppText>
      )}
    </TouchableOpacity>
  );
};

const getTextColor = (variant: string, disabled: boolean) => {
  if (disabled) return colors.text.tertiary;
  
  switch (variant) {
    case 'primary':
      return colors.text.onPrimary;
    case 'secondary':
    case 'outline':
      return colors.text.primary;
    case 'text':
      return colors.ai.primary;
    default:
      return colors.text.primary;
  }
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadii.md,
    minWidth: 112,
    flexDirection: 'row',
  },
  
  // Variants
  primary: {
    backgroundColor: colors.ai.primary,
  },
  
  secondary: {
    backgroundColor: colors.surface.secondary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.ai.primary,
  },
  
  text: {
    backgroundColor: 'transparent',
    minWidth: 72,
  },
  
  // Sizes
  size_small: {
    paddingVertical: 10,
    paddingHorizontal: layoutSpacing.md,
    minHeight: 40,
  },
  
  size_medium: {
    paddingVertical: 14,
    paddingHorizontal: layoutSpacing.lg,
    minHeight: 48,
  },
  
  size_large: {
    paddingVertical: 18,
    paddingHorizontal: layoutSpacing.xl,
    minHeight: 52,
  },
  
  // States
  fullWidth: {
    width: '100%',
  },
  
  disabled: {
    opacity: 0.5,
  },
});