import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { useBurgerMenu } from '@/contexts/BurgerMenuContext';
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/utils/colors';
import { fonts } from '@/utils/fonts';
import { getUniversityLogoUrl } from '@/services/storage';
import { t } from '@/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(SCREEN_WIDTH * 0.78, 320);
const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 500;

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

export const BurgerDrawer: React.FC = () => {
  const { progress, close, isOpen } = useBurgerMenu();
  const { user, supabase } = useAuth();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      close();
      // Navigation reset will be handled by AuthContext
    } catch (error) {
      Alert.alert(t('error_generic'), t('error_sign_out'));
    }
  };

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      title: t('menu_home'),
      icon: '🏠',
      onPress: () => {
        close();
        navigation.navigate('Home');
      },
    },
    {
      id: 'leaderboard',
      title: t('menu_leaderboard'),
      icon: '🏆',
      onPress: () => {
        close();
        navigation.navigate('Leaderboard');
      },
    },
    {
      id: 'profile',
      title: t('menu_profile'),
      icon: '👤',
      onPress: () => {
        close();
        navigation.navigate('Profile');
      },
    },
    {
      id: 'subscription',
      title: t('menu_subscription'),
      icon: '💎',
      onPress: () => {
        close();
        // TODO: Navigate to subscription screen when implemented
        Alert.alert(t('coming_soon'), t('coming_soon_message'));
      },
    },
    {
      id: 'settings',
      title: t('menu_settings'),
      icon: '⚙️',
      onPress: () => {
        close();
        // TODO: Navigate to settings screen when implemented
        Alert.alert(t('coming_soon'), t('coming_soon_message'));
      },
    },
  ];

  const secondaryItems: MenuItem[] = [
    {
      id: 'contact',
      title: t('menu_contact'),
      icon: '📧',
      onPress: () => {
        close();
        // TODO: Open email client or navigate to contact screen
        Alert.alert(t('contact_title'), t('contact_support'));
      },
    },
    {
      id: 'legal',
      title: t('menu_legal'),
      icon: '📄',
      onPress: () => {
        close();
        // TODO: Navigate to legal screen when implemented
        Alert.alert(t('coming_soon'), t('coming_soon_message'));
      },
    },
  ];

  const signOutItem: MenuItem = {
    id: 'signout',
    title: t('menu_sign_out'),
    icon: '🚪',
    onPress: handleSignOut,
  };

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { startX: number }>({
    onStart: (_, context) => {
      context.startX = progress.value * PANEL_WIDTH;
    },
    onActive: (event, context) => {
      const translationX = event.translationX;
      const currentX = context.startX + translationX;
      const newProgress = Math.max(0, Math.min(1, currentX / PANEL_WIDTH));
      progress.value = newProgress;
    },
    onEnd: (event) => {
      const shouldClose =
        event.translationX < -SWIPE_THRESHOLD ||
        event.velocityX < -VELOCITY_THRESHOLD;
      
      if (shouldClose) {
        progress.value = withSpring(0);
        runOnJS(close)();
      } else {
        progress.value = withSpring(1);
      }
    },
  });

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0, 0.5]);
    return {
      opacity,
    };
  });

  const panelStyle = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [-PANEL_WIDTH, 0]);
    return {
      transform: [{ translateX }],
      opacity: 1, // Force full opacity
    };
  });

  const renderMenuItem = (item: MenuItem) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        {
          backgroundColor: 'transparent',
        }
      ]}
      onPress={item.onPress}
      accessibilityRole="button"
      accessibilityLabel={item.title}
      activeOpacity={0.6}
    >
      <Text style={styles.menuItemIcon}>{item.icon}</Text>
      <Text style={styles.menuItemText}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (!isOpen) {
    return null;
  }

  return (
    <View style={[styles.container, StyleSheet.absoluteFillObject]}>
      {/* Backdrop */}
      <Animated.View 
        style={[styles.backdrop, backdropStyle]} 
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t('menu_close')}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Panel */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.panel, panelStyle, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Utilizator'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || ''}
              </Text>
            </View>
          </View>

          {/* Main Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map(renderMenuItem)}
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Secondary Menu Items */}
          <View style={styles.menuSection}>
            {secondaryItems.map(renderMenuItem)}
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Sign Out */}
          <View style={styles.menuSection}>
            {renderMenuItem(signOutItem)}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9998,
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#02343F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...fonts.semiBold,
    fontSize: 18,
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...fonts.semiBold,
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    ...fonts.regular,
    fontSize: 14,
    color: '#666666',
  },
  menuSection: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    ...fonts.medium,
    fontSize: 16,
    color: '#1A1A1A',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
    marginHorizontal: 16,
  },
});