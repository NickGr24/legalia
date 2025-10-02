export const colors = {
  primary: {
    main: '#02343F',        // Your main dark teal
    light: '#0A4A58',       // Lighter teal
    dark: '#012A33',        // Darker teal
    gradient: ['#02343F', '#0A4A58'] as const
  },

  secondary: {
    main: '#F5F5DC',        // Ivory Cream
    light: '#FEFEF0',       // Lighter cream
    dark: '#EDE6C4',        // Darker cream
    gradient: ['#F5F5DC', '#EDE6C4'] as const
  },

  ai: {
    primary: '#02343F',     // Dark teal for AI elements
    secondary: '#2E8B8B',   // Medium teal accent
    accent: '#4ECDC4',      // Light teal accent
    glow: '#B0E0E6',        // Powder blue glow
    glass: 'rgba(2, 52, 63, 0.15)',
    glassBorder: 'rgba(245, 245, 220, 0.3)'
  },

  background: {
    primary: '#F5F5DC',     // Ivory cream primary
    secondary: '#FEFEF0',   // Very light cream
    tertiary: '#FFFFFF',    // Pure white
    glass: 'rgba(245, 245, 220, 0.85)',
    glassCard: 'rgba(245, 245, 220, 0.45)',
    overlay: 'rgba(2, 52, 63, 0.02)'
  },

  surface: {
    primary: '#FFFFFF',
    secondary: '#FEFEF0',   // Light cream
    elevated: '#F5F5DC',    // Ivory cream
    glass: 'rgba(245, 245, 220, 0.6)',
    frosted: 'rgba(245, 245, 220, 0.8)'
  },

  text: {
    primary: '#02343F',     // Dark teal for primary text
    secondary: '#0A4A58',   // Medium teal for secondary text
    tertiary: '#2E8B8B',    // Light teal for tertiary text
    light: '#4ECDC4',       // Very light teal
    onPrimary: '#F5F5DC',   // Cream text on dark backgrounds
    onSecondary: '#02343F', // Dark text on light backgrounds
    gradient: ['#02343F', '#0A4A58'] as const
  },

  border: {
    light: '#EDE6C4',       // Light cream border
    medium: '#D4C5A0',      // Medium cream border
    dark: '#2E8B8B',        // Teal border
    glass: 'rgba(245, 245, 220, 0.3)',
    accent: 'rgba(2, 52, 63, 0.2)'
  },

  status: {
    success: '#48BB78',
    warning: '#ED8936', 
    error: '#F56565',
    info: '#4299E1'
  },

  gradients: {
    primary: ['#02343F', '#0A4A58'] as const,           // Dark teal gradient
    secondary: ['#F5F5DC', '#EDE6C4'] as const,         // Cream gradient
    accent: ['#4ECDC4', '#2E8B8B'] as const,            // Light to medium teal
    warm: ['#F5F5DC', '#D2A969'] as const,              // Cream to gold
    cool: ['#02343F', '#4ECDC4'] as const,              // Dark to light teal
    success: ['#2E8B8B', '#4ECDC4'] as const,           // Teal success gradient
    glass: ['rgba(245, 245, 220, 0.7)', 'rgba(245, 245, 220, 0.3)'] as const,
    overlay: ['rgba(2, 52, 63, 0.0)', 'rgba(2, 52, 63, 0.05)'] as const,
    // Background gradients for main screen
    background: ['#02343F', '#0A4A58'] as const,        // Main teal gradient
    backgroundAlt: ['#F5F5DC', '#EDE6C4'] as const,    // Cream gradient
    backgroundCool: ['#02343F', '#4ECDC4'] as const,   // Dark to light teal
    backgroundWarm: ['#F5F5DC', '#D2A969'] as const   // Cream to warm gold
  },

  // Legacy support
  difficulty: {
    beginner: '#4ECDC4',    // Light teal for beginner
    intermediate: '#2E8B8B', // Medium teal for intermediate  
    advanced: '#02343F'     // Dark teal for advanced
  },

  progress: {
    new: '#D4C5A0',         // Light cream for new
    learning: '#4ECDC4',    // Light teal for learning
    mastered: '#2E8B8B',    // Medium teal for mastered
    review: '#D2A969',      // Gold for review
    locked: '#EDE6C4'       // Light cream for locked
  },

  // Additional accent colors
  gold: '#D2A969',          // Gold accent color
}; 