// Layout utilities for native-only app
export const clamp = (value: number, min: number, max: number): number => 
  Math.max(min, Math.min(value, max));

export const contentMaxWidth = 600;

// Typography utilities with clamped sizes
export const typography = {
  title: {
    fontSize: clamp(28, 24, 32),
    lineHeight: clamp(28, 24, 32) * 1.2,
  },
  subtitle: {
    fontSize: clamp(18, 16, 20),
    lineHeight: clamp(18, 16, 20) * 1.4,
  },
  body: {
    fontSize: 16,
    lineHeight: 16 * 1.4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 14 * 1.4,
  },
};

// Standard spacing values
export const layoutSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Content container helper
export const contentContainer = {
  maxWidth: contentMaxWidth,
  paddingHorizontal: layoutSpacing.lg,
  alignSelf: 'center' as const,
  width: '100%' as const,
};

// Safe area helpers
export const safeAreaPadding = {
  top: 16,
  bottom: 24,
  horizontal: 24,
};