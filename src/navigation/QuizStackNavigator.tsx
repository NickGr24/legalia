import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { QuizGameScreen } from '../screens/QuizGameScreen';
import { QuizResultScreen } from '../screens/QuizResultScreen';
import { RootStackParamList } from '../utils/types';

const Stack = createStackNavigator<RootStackParamList>();

export const QuizStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      
      <Stack.Screen 
        name="QuizGame" 
        component={QuizGameScreen}
        options={{
          gestureEnabled: false, // Disable gesture to prevent accidental exit
        }}
      />
      <Stack.Screen 
        name="QuizResult" 
        component={QuizResultScreen}
        options={{
          gestureEnabled: false, // Disable gesture on result screen
        }}
      />
    </Stack.Navigator>
  );
}; 