/**
 * FriendsListScreen
 * Shows list of accepted friends
 * Romanian UI with unfriend option
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFriends } from '@/hooks/useFriends';
import { colors } from '@/utils/colors';
import {
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  shadows,
} from '@/utils/styles';
import type { Friend } from '@/utils/types';

export const FriendsListScreen: React.FC = () => {
  const {
    friends,
    loadingFriends,
    friendsError,
    unfriend,
    refreshFriends,
    stats,
  } = useFriends();

  const [expandedFriendId, setExpandedFriendId] = useState<string | null>(null);

  const handleUnfriend = async (friendUserId: string, friendName: string) => {
    Alert.alert(
      'Elimină prieten?',
      `Sigur vrei să îl elimini pe ${friendName} din lista de prieteni?`,
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Elimină',
          style: 'destructive',
          onPress: async () => {
            const success = await unfriend(friendUserId);
            if (success) {
              setExpandedFriendId(null);
              console.log('Friend removed');
            }
          },
        },
      ]
    );
  };

  const toggleExpanded = (friendId: string) => {
    setExpandedFriendId(expandedFriendId === friendId ? null : friendId);
  };

  const renderFriendCard = (friend: Friend) => {
    const isExpanded = expandedFriendId === friend.friendship_id;
    const displayName = friend.username || friend.email?.split('@')[0] || 'User';

    return (
      <TouchableOpacity
        key={friend.friendship_id}
        style={styles.friendCard}
        onPress={() => toggleExpanded(friend.friendship_id)}
        activeOpacity={0.7}
      >
        <View style={styles.friendHeader}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={28} color={colors.text.onPrimary} />
          </View>
          <View style={styles.friendInfo}>
            <Text style={styles.friendName}>{displayName}</Text>
            <Text style={styles.friendEmail}>{friend.email}</Text>
            <Text style={styles.friendSince}>
              Prieteni din{' '}
              {new Date(friend.friend_since).toLocaleDateString('ro-RO', {
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.text.secondary}
          />
        </View>

        {isExpanded && (
          <View style={styles.friendActions}>
            <TouchableOpacity
              style={styles.unfriendButton}
              onPress={() => handleUnfriend(friend.user_id, displayName)}
            >
              <Ionicons
                name="person-remove"
                size={20}
                color={colors.error.main}
              />
              <Text style={styles.unfriendButtonText}>Elimină prieten</Text>
            </TouchableOpacity>
          </View>
        )}
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
      <Text style={styles.emptyStateTitle}>Nu ai încă prieteni</Text>
      <Text style={styles.emptyStateText}>
        Trimite o cerere și începe competiția!
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prieteni</Text>
        <Text style={styles.headerSubtitle}>
          {stats ? `${stats.total_friends} prieteni` : 'Se încarcă...'}
        </Text>
      </View>

      {/* Error */}
      {friendsError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{friendsError}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loadingFriends}
            onRefresh={refreshFriends}
            colors={[colors.ai.primary]}
            tintColor={colors.ai.primary}
          />
        }
      >
        {loadingFriends ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.ai.primary} />
            <Text style={styles.loadingText}>Se încarcă prietenii...</Text>
          </View>
        ) : friends.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Ionicons
                  name="people"
                  size={24}
                  color={colors.ai.primary}
                />
                <Text style={styles.statValue}>{friends.length}</Text>
                <Text style={styles.statLabel}>Prieteni</Text>
              </View>
              {stats && stats.pending_incoming > 0 && (
                <View style={styles.statItem}>
                  <Ionicons
                    name="mail"
                    size={24}
                    color={colors.warning.main}
                  />
                  <Text style={styles.statValue}>{stats.pending_incoming}</Text>
                  <Text style={styles.statLabel}>Cereri noi</Text>
                </View>
              )}
            </View>

            {/* Friends List */}
            {friends.map((friend) => renderFriendCard(friend))}
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
    padding: spacing.lg,
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

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
  },

  // Friend Card
  friendCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.ai.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  friendEmail: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  friendSince: {
    fontSize: fontSize.xs,
    color: colors.text.disabled,
  },

  // Friend Actions
  friendActions: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  unfriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.error.main,
    gap: spacing.xs,
  },
  unfriendButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.error.main,
  },
});

export default FriendsListScreen;
