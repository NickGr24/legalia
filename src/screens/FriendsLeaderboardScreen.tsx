/**
 * FriendsLeaderboardScreen
 * Shows leaderboard filtered to friends only
 * Romanian UI with top 100 friends + user rank if outside
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useFriends } from '@/hooks/useFriends';
import { colors } from '@/utils/colors';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '@/utils/styles';
import type { FriendsLeaderboardEntry, RootStackParamList } from '@/utils/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const FriendsLeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    leaderboard,
    currentUserRank,
    loadingLeaderboard,
    leaderboardError,
    refreshLeaderboard,
    friends,
  } = useFriends();

  useEffect(() => {
    // Refresh leaderboard when screen mounts
    refreshLeaderboard();
  }, []);

  const renderPodium = () => {
    const topThree = leaderboard.slice(0, 3);
    if (topThree.length === 0) return null;

    // Reorder to show 2nd, 1st, 3rd for podium visual
    const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

    return (
      <View style={styles.podiumContainer}>
        <View style={styles.podiumRow}>
          {podiumOrder.map((entry, index) => {
            const actualRank = entry.rank;
            const height = actualRank === 1 ? 120 : actualRank === 2 ? 100 : 80;
            const color =
              actualRank === 1
                ? colors.warning.main
                : actualRank === 2
                ? colors.text.disabled
                : '#CD7F32';

            const handlePodiumPress = () => {
              if (!entry.is_current_user) {
                navigation.navigate('UserProfile', {
                  userId: entry.user_id,
                  userName: entry.username,
                });
              }
            };

            return (
              <TouchableOpacity
                key={entry.user_id}
                onPress={handlePodiumPress}
                activeOpacity={entry.is_current_user ? 1 : 0.7}
                disabled={entry.is_current_user}
              >
                <View
                  style={[
                    styles.podiumItem,
                    { height },
                    entry.is_current_user && styles.currentUserPodium,
                  ]}
                >
                  <View style={styles.podiumRank}>
                    <Text style={styles.podiumRankText}>#{actualRank}</Text>
                    <Ionicons
                      name={
                        actualRank === 1
                          ? 'trophy'
                          : actualRank === 2
                          ? 'medal'
                          : 'ribbon'
                      }
                      size={24}
                      color={color}
                    />
                  </View>
                  <View style={[styles.podiumAvatar, { backgroundColor: color }]}>
                    <Ionicons name="person" size={28} color={colors.text.onPrimary} />
                  </View>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {entry.username}
                  </Text>
                  <Text style={styles.podiumScore}>{entry.total_score} pts</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderLeaderboardEntry = (entry: FriendsLeaderboardEntry, index: number) => {
    // Skip top 3 as they're in podium
    if (index < 3 && leaderboard.length >= 3) return null;

    const isCurrentUser = entry.is_current_user;

    const handlePress = () => {
      if (!isCurrentUser) {
        navigation.navigate('UserProfile', {
          userId: entry.user_id,
          userName: entry.username,
        });
      }
    };

    return (
      <TouchableOpacity
        key={entry.user_id}
        onPress={handlePress}
        activeOpacity={isCurrentUser ? 1 : 0.7}
        disabled={isCurrentUser}
      >
        <View
          style={[
            styles.entryCard,
            isCurrentUser && styles.currentUserCard,
          ]}
        >
          <Text style={styles.entryRank}>#{entry.rank}</Text>
          <View style={styles.entryAvatar}>
            <Ionicons name="person" size={24} color={colors.text.onPrimary} />
          </View>
          <View style={styles.entryInfo}>
            <Text style={styles.entryName} numberOfLines={1}>
              {entry.username}
            </Text>
            <View style={styles.entryStats}>
              <View style={styles.entryStat}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.success.main}
                />
                <Text style={styles.entryStatText}>
                  {entry.total_quizzes_completed} teste
                </Text>
            </View>
            <View style={styles.entryStat}>
              <Ionicons name="flame" size={14} color={colors.warning.main} />
              <Text style={styles.entryStatText}>
                {entry.current_streak} zile
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.entryScore}>{entry.total_score}</Text>
        {!isCurrentUser && (
          <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} style={{ marginLeft: 8 }} />
        )}
      </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="people-outline"
        size={80}
        color={colors.text.disabled}
      />
      <Text style={styles.emptyStateTitle}>Niciun prieten încă</Text>
      <Text style={styles.emptyStateText}>
        Adaugă prieteni pentru a vedea clasamentul!
      </Text>
    </View>
  );

  const renderCurrentUserRank = () => {
    if (!currentUserRank || currentUserRank <= 100) return null;

    const currentUserEntry = leaderboard.find((e) => e.is_current_user);
    if (!currentUserEntry) return null;

    return (
      <View style={styles.currentRankContainer}>
        <Text style={styles.currentRankTitle}>Rangul tău</Text>
        {renderLeaderboardEntry(currentUserEntry, currentUserRank - 1)}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Clasament prieteni</Text>
        <Text style={styles.headerSubtitle}>
          {friends.length > 0
            ? `Top 100 din ${friends.length} prieteni`
            : 'Niciun prieten'}
        </Text>
      </View>

      {/* Error */}
      {leaderboardError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{leaderboardError}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loadingLeaderboard}
            onRefresh={refreshLeaderboard}
            colors={[colors.ai.primary]}
            tintColor={colors.ai.primary}
          />
        }
      >
        {loadingLeaderboard ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.ai.primary} />
            <Text style={styles.loadingText}>Se încarcă clasamentul...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Podium */}
            {renderPodium()}

            {/* Leaderboard List */}
            <View style={styles.leaderboardList}>
              {leaderboard.map((entry, index) =>
                renderLeaderboardEntry(entry, index)
              )}
            </View>

            {/* Current User Rank (if outside top 100) */}
            {renderCurrentUserRank()}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },

  // Header
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },

  // Error
  errorContainer: {
    padding: spacing.md,
    backgroundColor: colors.error.light,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error.main,
    textAlign: 'center',
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xl,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Podium
  podiumContainer: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  podiumRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  podiumItem: {
    width: 100,
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...shadows.medium,
  },
  currentUserPodium: {
    borderWidth: 2,
    borderColor: colors.ai.primary,
  },
  podiumRank: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  podiumRankText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  podiumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  podiumName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  podiumScore: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },

  // Leaderboard List
  leaderboardList: {
    paddingHorizontal: spacing.lg,
  },

  // Entry Card
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: colors.ai.primary,
    backgroundColor: colors.ai.light,
  },
  entryRank: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
    width: 40,
  },
  entryAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ai.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  entryStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  entryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  entryStatText: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
  },
  entryScore: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.ai.primary,
  },

  // Current User Rank (outside top 100)
  currentRankContainer: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.medium,
  },
  currentRankTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});

export default FriendsLeaderboardScreen;
