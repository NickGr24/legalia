import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Alert, LogBox } from 'react-native';

// Ignore all warnings in production
LogBox.ignoreAllLogs(true);

// Global error handler with defensive checks
if (typeof ErrorUtils !== 'undefined') {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global error:', error);

    if (isFatal) {
      setTimeout(() => {
        try {
          Alert.alert(
            'Error',
            `${error.name}: ${error.message}`,
            [{ text: 'OK' }]
          );
        } catch (e) {
          console.error('Could not show alert:', e);
        }
      }, 500);
    }
  });
}

import App from './App';

registerRootComponent(App);
