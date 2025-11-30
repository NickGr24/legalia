// Import new design system colors
import { newColors, illustrationColors } from './newDesignSystem';

export const colors = {
  primary: {
    main: newColors.background.primary,        // Dark background #1A1A1A
    light: newColors.background.secondary,     // Lighter dark #2A2A2A
    dark: '#0F0F0F',                          // Even darker
    gradient: [newColors.background.primary, newColors.background.secondary] as const
  },

  secondary: {
    main: newColors.accents.peach,            // Soft peach accent
    light: '#F0DCC8',                         // Lighter peach
    dark: '#D4A574',                          // Darker peach
    gradient: [newColors.accents.peach, '#D4A574'] as const
  },

  ai: {
    primary: newColors.accents.sky,           // Soft sky blue
    secondary: newColors.accents.lavender,    // Soft lavender
    accent: newColors.accents.mint,           // Mint accent
    light: 'rgba(159, 197, 232, 0.1)',       // Light tint
    glow: newColors.accents.sky,              // Sky blue glow
    glass: 'rgba(45, 45, 45, 0.5)',
    glassBorder: newColors.ui.border
  },

  background: {
    main: newColors.background.primary,        // Main dark background
    primary: newColors.background.primary,     // #1A1A1A
    secondary: newColors.background.secondary, // #2A2A2A
    tertiary: newColors.background.tertiary,   // #353535
    glass: 'rgba(45, 45, 45, 0.85)',
    glassCard: newColors.background.card,
    overlay: newColors.ui.overlay
  },

  surface: {
    primary: newColors.background.card,
    secondary: newColors.background.secondary,
    elevated: newColors.background.tertiary,
    card: newColors.background.card,
    glass: 'rgba(45, 45, 45, 0.6)',
    frosted: 'rgba(45, 45, 45, 0.8)'
  },

  text: {
    primary: newColors.text.primary,          // White
    secondary: newColors.text.secondary,      // Gray
    tertiary: newColors.text.tertiary,        // Darker gray
    disabled: newColors.text.tertiary,
    light: newColors.text.accent,
    onPrimary: newColors.text.primary,
    onSecondary: newColors.text.secondary,
    gradient: [newColors.text.primary, newColors.text.secondary] as const
  },

  border: {
    light: newColors.ui.border,
    medium: newColors.ui.divider,
    dark: newColors.ui.border,
    glass: newColors.ui.border,
    accent: newColors.ui.border
  },

  success: {
    main: newColors.status.success,
    light: '#A8E6CF',
    dark: '#4CAF50'
  },

  error: {
    main: newColors.status.error,
    light: '#FFB3B3',
    dark: '#C53030'
  },

  warning: {
    main: newColors.status.warning,
    light: '#FFD97D',
    dark: '#D4A020'
  },

  info: {
    main: newColors.status.info,
    light: '#99E0F7',
    dark: '#2E8BC0'
  },

  // Legacy support
  status: newColors.status,

  gradients: {
    primary: [newColors.background.primary, newColors.background.secondary] as const,
    secondary: [newColors.accents.peach, '#D4A574'] as const,
    accent: [newColors.accents.mint, newColors.accents.sage] as const,
    warm: [newColors.accents.peach, newColors.accents.coral] as const,
    cool: [newColors.accents.sky, newColors.accents.lavender] as const,
    success: [newColors.status.success, '#5FB485'] as const,
    glass: ['rgba(45, 45, 45, 0.7)', 'rgba(45, 45, 45, 0.3)'] as const,
    overlay: ['rgba(0, 0, 0, 0.0)', 'rgba(0, 0, 0, 0.5)'] as const,
    // Background gradients for main screen
    background: [newColors.background.primary, newColors.background.secondary] as const,
    backgroundAlt: [newColors.background.secondary, newColors.background.tertiary] as const,
    backgroundCool: [newColors.background.primary, newColors.accents.sky] as const,
    backgroundWarm: [newColors.background.primary, newColors.accents.peach] as const,
    // New teal/cyan gradients
    ocean: [newColors.accents.teal, newColors.accents.cyan] as const,
    tealWave: [newColors.background.deepDark, newColors.accents.teal] as const,
    aqua: [newColors.accents.cyan, newColors.accents.sky] as const,
  },

  // Legacy support - using new accent colors
  difficulty: {
    beginner: newColors.accents.mint,
    intermediate: newColors.accents.sage,  
    advanced: newColors.accents.coral
  },

  progress: {
    new: newColors.accents.sand,
    learning: newColors.accents.sky,
    mastered: newColors.accents.sage,
    review: newColors.accents.peach,
    locked: newColors.text.tertiary
  },

  // Additional accent colors
  gold: newColors.accents.sand,
  teal: newColors.accents.teal,
  cyan: newColors.accents.cyan,
  deepDark: newColors.background.deepDark,

  // Add illustration colors for cards
  illustrations: illustrationColors
}; 