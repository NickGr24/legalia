import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import screens - use new HomeScreen
import { HomeScreenNew } from '../screens/HomeScreenNew';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

// Import new design system
import { newTheme } from '../utils/newDesignSystem';
import { TabParamList } from '../utils/types';
import { t } from '../i18n';

const Tab = createBottomTabNavigator<TabParamList>();

interface TabBarIconProps {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  label: string;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ name, focused, label }) => {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  
  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.9,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [focused, scale]);

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View 
        style={{
          transform: [{ scale }],
        }}
      >
        <Ionicons 
          name={name} 
          size={24} 
          color={focused ? newTheme.colors.tabBar.active : newTheme.colors.tabBar.inactive} 
        />
      </Animated.View>
      <Text 
        style={[
          styles.tabLabel,
          { color: focused ? newTheme.colors.tabBar.active : newTheme.colors.tabBar.inactive }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

export const TabNavigatorNew: React.FC = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          { 
            height: 70 + insets.bottom,
            paddingBottom: insets.bottom + 8,
          }
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: newTheme.colors.tabBar.active,
        tabBarInactiveTintColor: newTheme.colors.tabBar.inactive,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreenNew}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'home' : 'home-outline'}
              focused={focused}
              label="Acasă"
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'trophy' : 'trophy-outline'}
              focused={focused}
              label="Clasament"
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Achievements" 
        component={ProfileScreen} // Temporary - will create new screen
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'medal' : 'medal-outline'}
              focused={focused}
              label="Trofee"
            />
          ),
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon 
              name={focused ? 'person' : 'person-outline'}
              focused={focused}
              label="Profil"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: newTheme.colors.tabBar.background,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    paddingTop: 8,
  },
  
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});