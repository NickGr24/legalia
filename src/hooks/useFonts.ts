// Simplified fonts hook - always returns true to avoid blocking app startup
export const useFonts = (): boolean => {
  // For SDK 50 stability, we'll skip custom font loading and use system fonts
  return true;
}; 