// Simplified font configuration using system fonts for stability
export const fontFamilies = {
  // Use system fonts for maximum compatibility
  primary: 'System',
  heading: 'System',
  systemPrimary: 'System',
  systemSecondary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const fontConfig = {
  body: fontFamilies.systemPrimary,
  heading: fontFamilies.systemPrimary,
  system: fontFamilies.systemPrimary,
};

// Romanian language specific optimizations
export const languageSupport = {
  romanian: {
    // Ensure proper rendering of Romanian diacritics
    diacritics: ['ă', 'â', 'î', 'ș', 'ț', 'Ă', 'Â', 'Î', 'Ș', 'Ț'],
    fallbacks: ['system-ui', 'sans-serif'],
  },
};

// Font styles used by components - all using system fonts
export const fonts = {
  light: {
    fontFamily: fontFamilies.systemPrimary,
    fontWeight: '300' as const,
  },
  regular: {
    fontFamily: fontFamilies.systemPrimary,
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: fontFamilies.systemPrimary,
    fontWeight: '500' as const,
  },
  semiBold: {
    fontFamily: fontFamilies.systemPrimary,
    fontWeight: '600' as const,
  },
  bold: {
    fontFamily: fontFamilies.systemPrimary,
    fontWeight: '700' as const,
  },
}; 