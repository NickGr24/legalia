/**
 * UserProfileScreen
 * View any user's profile with basic info and friend request option
 * Romanian UI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { supabase } from '@/services/supabaseClient';
// import { FriendRequestButton } from '@/components/FriendRequestButton'; // Friends feature to be implemented
import { useAuth } from '@/contexts/AuthContext';
import { colors } from '@/utils/colors';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '@/utils/styles';
import type { RootStackParamList } from '@/utils/types';

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UserProfileData {
  user_id: string;
  email: string;
  username?: string;
  total_score: number;
  total_quizzes_completed: number;
  current_streak: number;
  longest_streak: number;
  average_score: number;
  account_created: string;
}

export const UserProfileScreen: React.FC = () => {
  const route = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { user: currentUser } = useAuth();
  const { userId, userName } = route.params;

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user's quiz stats
      const { data: quizData, error: quizError } = await supabase
        .from('home_marks_of_user')
        .select('marks_obtained')
        .eq('user_id', userId) as { data: Array<{ marks_obtained: number }> | null; error: any };

      if (quizError) throw quizError;

      const totalScore = quizData?.reduce((sum, q) => sum + (q.marks_obtained || 0), 0) || 0;
      const totalQuizzes = quizData?.length || 0;
      const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

      // Fetch user's streak
      const { data: streakData, error: streakError } = await supabase
        .from('home_userstreak')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .maybeSingle() as { data: { current_streak: number; longest_streak: number } | null; error: any };

      if (streakError && streakError.code !== 'PGRST116') throw streakError;

      // Fetch user email from auth
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('email, created_at')
        .eq('id', userId)
        .maybeSingle() as { data: { email: string; created_at: string } | null; error: any };

      // Fallback: try to get email from a table that references the user
      let email = userData?.email || '';
      let createdAt = userData?.created_at || new Date().toISOString();

      if (!email) {
        // Try to get email from friendship or other tables
        const { data: friendData } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
          .limit(1)
          .maybeSingle();

        // For now, use username as fallback
        email = userName || 'Utilizator';
      }

      setProfileData({
        user_id: userId,
        email,
        username: userName || email.split('@')[0],
        total_score: totalScore,
        total_quizzes_completed: totalQuizzes,
        current_streak: streakData?.current_streak || 0,
        longest_streak: streakData?.longest_streak || 0,
        average_score: averageScore,
        account_created: createdAt,
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Eroare la încărcarea profilului');
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    label: string,
    value: string | number,
    color: string
  ) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={colors.text.onPrimary} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ai.primary} />
          <Text style={styles.loadingText}>Se încarcă profilul...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profileData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error.main} />
          <Text style={styles.errorText}>{error || 'Profil negăsit'}</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Înapoi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={colors.text.onPrimary} />
            </View>
            {isOwnProfile && (
              <View style={styles.ownProfileBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success.main} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{profileData.username}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>

          {/* Friend Request Button (only for other users) */}
          {!isOwnProfile && (
            <View style={styles.friendButtonContainer}>
              {/* <FriendRequestButton targetUserId={userId} /> */}
              {/* Friends feature to be implemented */}
            </View>
          )}

          {isOwnProfile && (
            <View style={styles.ownProfileNote}>
              <Text style={styles.ownProfileNoteText}>Acesta este profilul tău</Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistici</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'trophy',
              'Scor total',
              profileData.total_score.toLocaleString('ro-RO'),
              colors.warning.main
            )}
            {renderStatCard(
              'checkmark-circle',
              'Teste completate',
              profileData.total_quizzes_completed,
              colors.success.main
            )}
            {renderStatCard(
              'flame',
              'Streak curent',
              `${profileData.current_streak} zile`,
              colors.error.main
            )}
            {renderStatCard(
              'star',
              'Scor mediu',
              `${profileData.average_score}%`,
              colors.ai.primary
            )}
            {renderStatCard(
              'trending-up',
              'Cel mai lung streak',
              `${profileData.longest_streak} zile`,
              colors.info.main
            )}
            {renderStatCard(
              'calendar',
              'Membru din',
              new Date(profileData.account_created).toLocaleDateString('ro-RO', {
                month: 'short',
                year: 'numeric',
              }),
              colors.text.secondary
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Acțiuni rapide</Text>

          {!isOwnProfile && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  // Navigate to main screen with leaderboard tab
                  navigation.navigate('Main');
                }}
              >
                <Ionicons name="bar-chart" size={24} color={colors.ai.primary} />
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Compară scorurile</Text>
                  <Text style={styles.actionSubtitle}>
                    Vezi clasamentul prietenilor
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Main')}
          >
            <Ionicons name="trophy" size={24} color={colors.warning.main} />
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>Clasament general</Text>
              <Text style={styles.actionSubtitle}>Vezi toți utilizatorii</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.md,
    color: colors.error.main,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: colors.ai.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.onPrimary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.ai.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.large,
  },
  ownProfileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.background.main,
    borderRadius: 12,
    padding: spacing.xxs,
  },
  userName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  friendButtonContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
  ownProfileNote: {
    backgroundColor: colors.success.light,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  ownProfileNoteText: {
    fontSize: fontSize.sm,
    color: colors.success.dark,
    fontWeight: fontWeight.medium,
  },

  // Stats Section
  statsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  statCard: {
    width: '33.33%',
    padding: spacing.xs,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    alignSelf: 'center',
  },
  statValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Actions Section
  actionsSection: {
    marginBottom: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.medium,
  },
  actionTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  actionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  actionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
});

export default UserProfileScreen;
