import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';

// Global error handler
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('Global error handler:', error, 'isFatal:', isFatal);

  if (isFatal) {
    Alert.alert(
      'Unexpected error occurred',
      `Error: ${error.name}\n${error.message}\n\nPlease restart the app.`,
      [
        {
          text: 'Close',
          onPress: () => {},
        },
      ]
    );
  }
});

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
