import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/utils/colors';
import { ErrorBoundary } from './ErrorBoundary';

// Global error handler for production debugging
const errorLogs: string[] = [];

const originalError = console.error;
console.error = (...args) => {
  errorLogs.push(args.join(' '));
  originalError(...args);
};

// Catch unhandled promise rejections
const promiseRejectionHandler = (event: any) => {
  errorLogs.push(`Unhandled Promise Rejection: ${event.reason}`);
};

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', promiseRejectionHandler);
}

function ErrorDisplay() {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (errorLogs.length > 0) {
        setErrors([...errorLogs]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (errors.length === 0) return null;

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Debug Errors (Production):</Text>
      <ScrollView style={styles.errorScroll}>
        {errors.map((error, index) => (
          <Text key={index} style={styles.errorText}>
            {index + 1}. {error}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

export default function App() {
  const [renderError, setRenderError] = useState<Error | null>(null);

  useEffect(() => {
    // Catch any initialization errors
    try {
      console.log('App initializing...');
    } catch (error) {
      setRenderError(error as Error);
    }
  }, []);

  if (renderError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Initialization Error</Text>
        <Text style={styles.error}>{renderError.toString()}</Text>
        <Text style={styles.stack}>{renderError.stack}</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor={colors.primary.main} />
            <RootNavigator />
            {!__DEV__ && <ErrorDisplay />}
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 10,
  },
  errorScroll: {
    flex: 1,
  },
  errorTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 5,
  },
  errorText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  error: {
    fontSize: 14,
    color: 'red',
    marginBottom: 10,
  },
  stack: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
}); 