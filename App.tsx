import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Minimal safe app that loads modules progressively
export default function App() {
  const [step, setStep] = useState('initializing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApp();
  }, []);

  async function loadApp() {
    try {
      setStep('Loading basic modules...');
      await new Promise(resolve => setTimeout(resolve, 100));

      // Initialize expo-asset first
      setStep('Initializing assets...');
      const { Asset } = require('expo-asset');
      await Asset.loadAsync([
        require('./assets/icon.png'),
        require('./assets/splash.png'),
      ]).catch(() => {
        // Ignore asset loading errors for now
        console.log('Some assets failed to load, continuing...');
      });

      // Load fonts
      setStep('Loading fonts...');
      const { loadAsync } = require('expo-font');
      const { Ionicons } = require('@expo/vector-icons');
      await loadAsync({
        ...Ionicons.font,
      }).catch(() => {
        console.log('Font loading failed, continuing...');
      });

      setStep('Loading StatusBar...');
      const { StatusBar } = require('expo-status-bar');

      setStep('Loading SafeAreaProvider...');
      const { SafeAreaProvider } = require('react-native-safe-area-context');

      setStep('Loading Navigation...');
      const { NavigationContainer } = require('@react-navigation/native');

      setStep('Loading colors...');
      const { colors } = require('./src/utils/colors');

      setStep('Loading AuthContext...');
      const { AuthProvider } = require('./src/contexts/AuthContext');

      setStep('Loading ErrorBoundary...');
      const { ErrorBoundary } = require('./ErrorBoundary');

      setStep('Loading RootNavigator...');
      const { RootNavigator } = require('./src/navigation/RootNavigator');

      setStep('Rendering app...');
      await new Promise(resolve => setTimeout(resolve, 100));

      // If we get here, load the real app
      setStep('ready');

    } catch (err: any) {
      setError(`Error at step "${step}": ${err.message}\n\nStack: ${err.stack}`);
    }
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>App Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (step === 'ready') {
    try {
      const { StatusBar } = require('expo-status-bar');
      const { SafeAreaProvider } = require('react-native-safe-area-context');
      const { NavigationContainer } = require('@react-navigation/native');
      const { AuthProvider } = require('./src/contexts/AuthContext');
      const { RootNavigator } = require('./src/navigation/RootNavigator');
      const { colors } = require('./src/utils/colors');
      const { ErrorBoundary } = require('./ErrorBoundary');

      return (
        <ErrorBoundary>
          <SafeAreaProvider>
            <AuthProvider>
              <NavigationContainer>
                <StatusBar style="light" backgroundColor={colors.primary.main} />
                <RootNavigator />
              </NavigationContainer>
            </AuthProvider>
          </SafeAreaProvider>
        </ErrorBoundary>
      );
    } catch (err: any) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorTitle}>Render Error</Text>
          <Text style={styles.errorText}>{err.message}\n\n{err.stack}</Text>
        </View>
      );
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1a237e" />
      <Text style={styles.loadingText}>{step}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
}); 