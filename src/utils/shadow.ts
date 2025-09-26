import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

// Cross-platform shadow helpers
export const createShadow = (
  elevation: number,
  shadowColor = colors.ai.primary,
  opacity = 0.1
): ViewStyle => {
  if (Platform.OS === 'android') {
    return {
      elevation,
      shadowColor,
    };
  }

  // iOS shadows
  const shadowRadius = elevation * 0.6;
  const shadowOffset = {
    width: 0,
    height: elevation * 0.3,
  };

  return {
    shadowColor,
    shadowOffset,
    shadowOpacity: opacity,
    shadowRadius,
  };
};

// Predefined shadow styles
export const shadowStyles = {
  none: createShadow(0),
  small: createShadow(2, colors.ai.primary, 0.08),
  medium: createShadow(4, colors.ai.primary, 0.12),
  large: createShadow(8, colors.ai.primary, 0.16),
  button: createShadow(3, colors.ai.primary, 0.15),
  card: createShadow(6, colors.ai.primary, 0.1),
};

// Standard border radii
export const borderRadii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 50,
  circle: 9999,
};