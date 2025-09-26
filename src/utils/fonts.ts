import { Oswald_300Light, Oswald_400Regular, Oswald_500Medium, Oswald_600SemiBold, Oswald_700Bold } from '@expo-google-fonts/oswald';

// Modern font configuration for Legalia
export const fontFamilies = {
  // Oswald is the primary font family - modern, clean, and professional
  primary: 'Oswald', // Will fallback to system fonts if not loaded
  
  // Oswald for headings - consistent and strong
  heading: 'Oswald',
  
  // System fallbacks for reliability
  systemPrimary: 'System',
  systemSecondary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const fontConfig = {
  // Use Oswald for body text and most UI elements
  body: fontFamilies.primary,
  
  // Use Oswald for headings and important elements
  heading: fontFamilies.heading,
  
  // Fallback to system fonts
  system: fontFamilies.systemPrimary,
};

// Font loading configuration
export const fontAssets = {
  oswald: {
    '300': Oswald_300Light,
    '400': Oswald_400Regular,
    '500': Oswald_500Medium,
    '600': Oswald_600SemiBold,
    '700': Oswald_700Bold,
  },
};

// Web font configuration (for web platform)
export const webFonts = {
  oswald: {
    weights: ['300', '400', '500', '600', '700'],
    display: 'swap',
    url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap',
  },
};

// Romanian language specific optimizations
export const languageSupport = {
  romanian: {
    // Ensure proper rendering of Romanian diacritics
    diacritics: ['ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț'],
    fallbacks: ['system-ui', 'sans-serif'],
  },
};

// Font styles used by components
export const fonts = {
  light: {
    fontFamily: fontFamilies.primary,
    fontWeight: '300' as const,
  },
  regular: {
    fontFamily: fontFamilies.primary,
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: fontFamilies.primary,
    fontWeight: '500' as const,
  },
  semiBold: {
    fontFamily: fontFamilies.primary,
    fontWeight: '600' as const,
  },
  bold: {
    fontFamily: fontFamilies.primary,
    fontWeight: '700' as const,
  },
}; 