import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { HomeScreen } from '../screens/HomeScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows } from '../utils/styles';
import { TabParamList } from '../utils/types';
import { BurgerButton } from '@/components/BurgerButton';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, color, size }) => {
  const scale = useSharedValue(focused ? 1 : 0.8);
  const opacity = useSharedValue(focused ? 1 : 0.7);
  const indicatorScale = useSharedValue(focused ? 1 : 0);
  
  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 0.9, {
      damping: 15,
      stiffness: 200,
    });
    
    opacity.value = withTiming(focused ? 1 : 0.6, {
      duration: 200,
    });
    
    indicatorScale.value = withSpring(focused ? 1 : 0, {
      damping: 12,
      stiffness: 150,
    });
  }, [focused]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const indicatorAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: indicatorScale.value }],
    opacity: indicatorScale.value,
  }));

  return (
    <View style={styles.tabIconContainer}>
      {/* Animated Background Indicator */}
      <Animated.View 
        style={[
          styles.tabIndicator, 
          indicatorAnimatedStyle,
          { backgroundColor: `${colors.primary.main}15` }
        ]} 
      />
      
      {/* Animated Icon */}
      <Animated.View style={iconAnimatedStyle}>
        <Ionicons name={name} size={size} color={color} />
      </Animated.View>
      
      {/* Active Dot Indicator */}
      {focused && (
        <Animated.View 
          style={[
            styles.activeDot, 
            indicatorAnimatedStyle,
            { backgroundColor: colors.primary.main }
          ]} 
        />
      )}
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Leaderboard':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          const iconColor = focused ? colors.primary.main : colors.text.secondary;
          
          return (
            <TabBarIcon 
              name={iconName} 
              focused={focused} 
              color={iconColor} 
              size={size} 
            />
          );
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 8) : insets.bottom,
            height: Platform.OS === 'android' ? 68 + Math.max(insets.bottom, 8) : 60 + insets.bottom,
          }
        ],
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen 
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen 
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: () => null,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface.primary,
    borderTopWidth: 0,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    ...shadows.medium,
    elevation: 8,
    // Height and paddingBottom are set dynamically in the component based on safe area insets
  },
  


  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 50,
    height: 35,
  },

  tabIndicator: {
    position: 'absolute',
    width: 50,
    height: 32,
    borderRadius: borderRadius.lg,
    top: 4,
  },

  activeDot: {
    position: 'absolute',
    bottom: -8,
    width: 6,
    height: 6,
    borderRadius: 3,
    ...shadows.small,
  },
}); 