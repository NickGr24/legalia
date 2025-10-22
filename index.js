import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Alert, LogBox } from 'react-native';

// Ignore all warnings in production
LogBox.ignoreAllLogs(true);

// Global error handler with defensive checks
if (typeof ErrorUtils !== 'undefined') {
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global error:', error);
    console.error('Error stack:', error.stack);
    console.error('Is fatal:', isFatal);

    if (isFatal) {
      setTimeout(() => {
        try {
          Alert.alert(
            'Fatal Error - Please Screenshot',
            `${error.name}: ${error.message}\n\nStack: ${error.stack?.substring(0, 200)}`,
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
