import React, { useState, useEffect } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { View, ActivityIndicator, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabNavigator } from './TabNavigator';
import { LoginScreen, RegisterScreen } from '../screens';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { DisciplineRoadmapScreen } from '../screens/DisciplineRoadmapScreen';
import { QuizGameScreen } from '../screens/QuizGameScreen';
import { QuizResultScreen } from '../screens/QuizResultScreen';
import { RootStackParamList } from '../utils/types';
import { colors } from '../utils/colors';
import { useAuth } from '../contexts/AuthContext';
import { BurgerMenuProvider } from '@/contexts/BurgerMenuContext';
import { BurgerDrawer } from '@/components/BurgerDrawer';
import { BurgerButton } from '@/components/BurgerButton';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { user, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingStatus = await AsyncStorage.getItem('legalia.onboarded');
      setOnboarded(onboardingStatus === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboarded(false);
    }
  };

  // Show loading screen while checking auth and onboarding status
  if (loading || onboarded === null) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colors.background.primary 
      }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  // Custom transition animations
  const slideFromRight = {
    cardStyleInterpolator: ({ current, layouts }: any) => {
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
    transitionSpec: {
      open: {
        animation: 'timing' as const,
        config: {
          duration: 350,
          easing: Easing.out(Easing.poly(4)),
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 300,
          easing: Easing.in(Easing.poly(4)),
        },
      },
    },
  };

  const fadeTransition = {
    cardStyleInterpolator: ({ current }: any) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
      };
    },
    transitionSpec: {
      open: {
        animation: 'timing' as const,
        config: {
          duration: 400,
          easing: Easing.out(Easing.quad),
        },
      },
      close: {
        animation: 'timing' as const,
        config: {
          duration: 300,
          easing: Easing.in(Easing.quad),
        },
      },
    },
  };

  const getInitialRoute = (): keyof RootStackParamList => {
    if (user && onboarded) {
      return 'Main';
    } else if (user && !onboarded) {
      return 'Main'; // User is authenticated but hasn't completed onboarding (shouldn't happen)
    } else if (!user && !onboarded) {
      return 'Onboarding';
    } else {
      return 'Login'; // !user && onboarded
    }
  };

  return (
    <BurgerMenuProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          ...slideFromRight,
        }}
        initialRouteName={getInitialRoute()}
      >
        {!user ? (
          <>
            <Stack.Screen 
              name="Onboarding" 
              options={{ gestureEnabled: false }}
              component={OnboardingScreen}
            />
            <Stack.Screen 
              name="Login" 
              options={{ gestureEnabled: false }}
              component={LoginScreen}
            />
            <Stack.Screen 
              name="Register" 
              options={{ gestureEnabled: false }}
              component={RegisterScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen 
              name="Main"
              options={{ gestureEnabled: false }}
              component={TabNavigator}
            />
            <Stack.Screen 
              name="DisciplineRoadmap" 
              component={DisciplineRoadmapScreen}
              options={{
                presentation: 'card',
                ...slideFromRight,
                headerShown: true,
                headerLeft: () => <BurgerButton />,
                headerTitle: '',
                headerStyle: {
                  backgroundColor: colors.surface.primary,
                  borderBottomWidth: 0,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                },
                headerLeftContainerStyle: {
                  paddingLeft: 8,
                },
              }}
            />
            <Stack.Screen 
              name="QuizGame" 
              component={QuizGameScreen}
              options={{
                presentation: 'modal',
                gestureEnabled: false,
                ...TransitionPresets.ModalSlideFromBottomIOS,
              }}
            />
            <Stack.Screen 
              name="QuizResult" 
              component={QuizResultScreen}
              options={{
                presentation: 'card',
                gestureEnabled: false,
                ...fadeTransition,
              }}
            />
          </>
        )}
      </Stack.Navigator>
      
      {/* Render BurgerDrawer overlay for authenticated users */}
      {user && <BurgerDrawer />}
    </BurgerMenuProvider>
  );
}; 