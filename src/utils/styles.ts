import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { fontConfig } from './fonts';

// Re-export fontConfig for use in components
export { fontConfig };

// Спейсинги (увеличены для более воздушного дизайна)
export const spacing = {
  xs: 6,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Радиусы скругления (более мягкие, в стиле AI)
export const borderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 50,
  circle: 9999,
  full: 9999, // Alias for circle
};

// Размеры шрифтов (современные, оптимизированы для читаемости)
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  display: 42,
};

// Веса шрифтов
export const fontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

// Высота строк для улучшенной читаемости
export const lineHeight = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
};

// Тени в стиле AI/glassmorphism
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  small: {
    shadowColor: colors.ai.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  
  medium: {
    shadowColor: colors.ai.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  
  large: {
    shadowColor: colors.ai.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  
  glass: {
    shadowColor: colors.ai.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  
  glow: {
    shadowColor: colors.ai.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  
  floating: {
    shadowColor: colors.ai.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  }
};

// Эффекты glassmorphism
export const glassEffects = {
  card: {
    backgroundColor: colors.background.glassCard,
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
  },
  
  surface: {
    backgroundColor: colors.surface.glass,
    borderWidth: 0.5,
    borderColor: colors.border.glass,
  },
  
  overlay: {
    backgroundColor: colors.background.glass,
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
  },
  
  frosted: {
    backgroundColor: colors.surface.frosted,
    borderWidth: 1,
    borderColor: colors.border.glass,
  }
};

// Анимационные кривые
export const animationCurves = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Продолжительности анимаций
export const animationDuration = {
  fast: 150,
  normal: 250,
  slow: 350,
  slower: 500,
  slowest: 750,
};

// Общие стили компонентов
export const commonStyles = StyleSheet.create({
  // Контейнеры
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  // Карточки
  card: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  
  glassCard: {
    ...glassEffects.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.glass,
  },
  
  // Кнопки
  primaryButton: {
    backgroundColor: colors.ai.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  
  primaryButtonText: {
    color: colors.text.onPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    fontFamily: fontConfig.body,
  },
  
  // Инпуты
  input: {
    backgroundColor: colors.surface.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    fontFamily: fontConfig.body,
  },
  
  // Текст
  headingXL: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: fontSize.xxxl * lineHeight.tight,
    fontFamily: fontConfig.heading,
  },
  
  headingLG: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    lineHeight: fontSize.xxl * lineHeight.tight,
    fontFamily: fontConfig.heading,
  },
  
  headingMD: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    lineHeight: fontSize.xl * lineHeight.normal,
    fontFamily: fontConfig.heading,
  },
  
  bodyLG: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    color: colors.text.primary,
    lineHeight: fontSize.lg * lineHeight.normal,
    fontFamily: fontConfig.body,
  },
  
  bodyMD: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.normal,
    color: colors.text.secondary,
    lineHeight: fontSize.md * lineHeight.normal,
    fontFamily: fontConfig.body,
  },
  
  bodySM: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    color: colors.text.tertiary,
    lineHeight: fontSize.sm * lineHeight.relaxed,
    fontFamily: fontConfig.body,
  },
  
  // Центрирование
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Flexbox утилиты
  row: {
    flexDirection: 'row',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  spaceAround: {
    justifyContent: 'space-around',
  },
  
  alignCenter: {
    alignItems: 'center',
  },
  
  // Glassmorphism эффекты
  glassSurface: {
    ...glassEffects.surface,
    borderRadius: borderRadius.lg,
    ...shadows.glass,
  },
  
  glassOverlay: {
    ...glassEffects.overlay,
    borderRadius: borderRadius.xl,
    ...shadows.medium,
  },
  
  // AI-специфичные стили
  aiAccent: {
    color: colors.ai.accent,
  },
  
  aiGlow: {
    ...shadows.glow,
  },
  
  // Утилиты отступов
  marginXS: { margin: spacing.xs },
  marginSM: { margin: spacing.sm },
  marginMD: { margin: spacing.md },
  marginLG: { margin: spacing.lg },
  marginXL: { margin: spacing.xl },
  
  paddingXS: { padding: spacing.xs },
  paddingSM: { padding: spacing.sm },
  paddingMD: { padding: spacing.md },
  paddingLG: { padding: spacing.lg },
  paddingXL: { padding: spacing.xl },
}); 