import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import { fontAssets } from '../utils/fonts';

export const useFonts = (): boolean => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Load all Oswald font weights
        const fontPromises = Object.values(fontAssets.oswald).map(font => Font.loadAsync({ 'Oswald': font }));
        await Promise.all(fontPromises);
        setFontsLoaded(true);
      } catch (error) {
        console.error('❌ Error loading fonts:', error);
        // Fallback to system fonts
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  return fontsLoaded;
}; 