import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { UserStreak, Achievement } from '../utils/types';
import { UserStats } from '../utils/supabaseTypes';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { supabaseService } from '../services/supabaseService';
import { AchievementsSection } from '../components/AchievementsSection';
import { AchievementPopup } from '../components/AchievementPopup';
import { BurgerButton } from '../components/BurgerButton';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { handleApiError } = useErrorHandler();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const achievementsAnim = useRef(new Animated.Value(0)).current;
  const settingsAnim = useRef(new Animated.Value(0)).current;
  const accountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    
    // Start entrance animations
    const animations = [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(achievementsAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(settingsAnim, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(accountAnim, {
        toValue: 1,
        duration: 600,
        delay: 500,
        useNativeDriver: true,
      }),
    ];
    
    Animated.stagger(100, animations).start();
  }, [headerAnim, statsAnim, achievementsAnim, settingsAnim, accountAnim]);

  const loadUserData = async () => {
    if (!user) {
      console.log('No user found, setting default stats');
      // Set default stats if no user
      setUserStats({
        profile: {
          id: 0,
          timezone: 'UTC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: '',
        },
        streak: {
          id: 0,
          current_streak: 0,
          longest_streak: 0,
          last_active_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: '',
        },
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      });
      return;
    }

    try {
      setLoading(true);

      // Load user statistics from Supabase
      const stats = await supabaseService.getUserStats();
      console.log('Loaded user stats:', stats);
      setUserStats(stats);

    } catch (error) {
      console.error('Failed to load profile data:', error);
      handleApiError(error, 'Failed to load profile data');

      // Fallback to default stats if API fails
      setUserStats({
        profile: {
          id: 0,
          timezone: 'UTC',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id,
        },
        streak: {
          id: 0,
          current_streak: 0,
          longest_streak: 0,
          last_active_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: user.id,
        },
        totalQuizzes: 0,
        completedQuizzes: 0,
        averageScore: 0,
        totalQuestions: 0,
        correctAnswers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
            }
          }
        },
      ]
    );
  };

  const handleAchievementPress = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setShowAchievementPopup(true);
  };

  const handleCloseAchievementPopup = () => {
    setShowAchievementPopup(false);
    setSelectedAchievement(null);
  };

  if (loading && !userStats) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with Burger Button */}
        <View style={styles.headerBar}>
          <BurgerButton />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userStats) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <BurgerButton />
        </View>

        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load profile data</Text>
          <TouchableOpacity onPress={loadUserData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Burger Button */}
      <View style={styles.headerBar}>
        <BurgerButton />
      </View>
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.gradients.background}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View 
            style={[
              styles.profileHeader,
              {
                opacity: headerAnim,
                transform: [{
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  })
                }]
              }
            ]}
          >
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color="white" />
            </View>
            
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.user_metadata?.provider && (
                <Text style={styles.providerText}>
                  Signed in with {user.user_metadata.provider === 'google' ? 'Google' : user.user_metadata.provider}
                </Text>
              )}
            </View>
          </Animated.View>
        </LinearGradient>

        {/* Stats Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: statsAnim,
              transform: [{
                translateY: statsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Statistici</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color={colors.status.warning} />
              <Text style={styles.statValue}>{userStats?.streak?.current_streak || 0}</Text>
              <Text style={styles.statLabel}>Zile{'\n'}consecutive</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color={colors.gold} />
              <Text style={styles.statValue}>{userStats?.streak?.longest_streak || 0}</Text>
              <Text style={styles.statLabel}>Record{'\n'}streak</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="school" size={24} color={colors.status.success} />
              <Text style={styles.statValue}>{userStats?.completedQuizzes || 0}</Text>
              <Text style={styles.statLabel}>Quiz-uri{'\n'}complete</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="bar-chart" size={24} color={colors.status.info} />
              <Text style={styles.statValue}>{Math.round(userStats?.averageScore || 0)}%</Text>
              <Text style={styles.statLabel}>Scor{'\n'}mediu</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle" size={24} color={colors.ai.accent} />
              <Text style={styles.statValue}>{userStats?.correctAnswers || 0}</Text>
              <Text style={styles.statLabel}>Răspunsuri{'\n'}corecte</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color={colors.status.warning} />
              <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                {userStats?.streak?.last_active_date
                  ? new Date(userStats.streak.last_active_date).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' })
                  : 'N/A'
                }
              </Text>
              <Text style={styles.statLabel}>Ultima{'\n'}activitate</Text>
            </View>
          </View>
        </Animated.View>

        {/* Achievements Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: achievementsAnim,
              transform: [{
                translateY: achievementsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Realizări</Text>
          <AchievementsSection onAchievementPress={handleAchievementPress} />
        </Animated.View>

        {/* Settings Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: settingsAnim,
              transform: [{
                translateY: settingsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Setări</Text>
          
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="notifications-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Notificări</Text>
                <Text style={styles.settingSubtitle}>Gestionează notificările</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="language-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Limbă</Text>
                <Text style={styles.settingSubtitle}>Română</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="help-circle-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Ajutor & Suport</Text>
                <Text style={styles.settingSubtitle}>FAQ și contact</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Account Section */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: accountAnim,
              transform: [{
                translateY: accountAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                })
              }]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Cont</Text>
          
          <View style={styles.settingsContainer}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="person-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Editează profilul</Text>
                <Text style={styles.settingSubtitle}>Modifică informațiile personale</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Ionicons name="shield-outline" size={24} color={colors.primary.main} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Confidențialitate</Text>
                <Text style={styles.settingSubtitle}>Setări de confidențialitate</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.settingItem, styles.logoutItem]} 
              onPress={handleLogoutPress}
            >
              <View style={[styles.settingIcon, styles.logoutIconContainer]}>
                <Ionicons name="log-out-outline" size={24} color={colors.status.error} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, styles.logoutText]}>Ieși din cont</Text>
                <Text style={styles.settingSubtitle}>Deconectează-te din aplicație</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Legalia v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Transforming legal learning through AI-powered experiences
          </Text>
        </View>
      </ScrollView>

      <AchievementPopup
        visible={showAchievementPopup}
        achievement={selectedAchievement}
        onClose={handleCloseAchievementPopup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.status.error,
    fontFamily: fontConfig.body,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.medium,
  },
  retryButtonText: {
    fontSize: fontSize.md,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: Platform.OS === 'android' ? 100 : 80, // Extra padding for Android gesture navigation
  },
  headerGradient: {
    paddingBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.ai.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.ai.glassBorder,
  },
  userInfo: {
    marginLeft: spacing.lg,
    flex: 1,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: fontSize.md,
    color: colors.text.onPrimary + 'CC',
    fontFamily: fontConfig.body,
  },
  providerText: {
    fontSize: fontSize.sm,
    color: colors.text.onPrimary + '99',
    fontFamily: fontConfig.body,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    ...shadows.small,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginTop: spacing.xs,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    textAlign: 'center',
    lineHeight: 14,
  },
  settingsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.primary,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.ai.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    fontFamily: fontConfig.body,
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutIconContainer: {
    backgroundColor: colors.status.error + '15',
  },
  logoutText: {
    color: colors.status.error,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  footerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontFamily: fontConfig.body,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});