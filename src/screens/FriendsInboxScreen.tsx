/**
 * FriendsInboxScreen
 * Shows incoming and outgoing friend requests with tabs
 * Romanian UI with Accept/Decline actions
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
import type { FriendRequest } from '@/utils/types';

type TabType = 'incoming' | 'outgoing';

export const FriendsInboxScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<TabType>('incoming');
  const {
    pendingIncoming,
    pendingOutgoing,
    loadingRequests,
    requestsError,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    refreshRequests,
  } = useFriends();

  const handleAccept = async (requestId: string) => {
    const success = await acceptFriendRequest(requestId);
    if (success) {
      // Show success feedback (optional toast)
      console.log('Friend request accepted');
    }
  };

  const handleDecline = async (requestId: string) => {
    Alert.alert(
      'Respinge cererea?',
      'Sigur vrei să respingi această cerere de prietenie?',
      [
        { text: 'Anulează', style: 'cancel' },
        {
          text: 'Respinge',
          style: 'destructive',
          onPress: async () => {
            const success = await declineFriendRequest(requestId);
            if (success) {
              console.log('Friend request declined');
            }
          },
        },
      ]
    );
  };

  const handleCancel = async (requestId: string) => {
    Alert.alert(
      'Anulează cererea?',
      'Sigur vrei să anulezi această cerere de prietenie?',
      [
        { text: 'Nu', style: 'cancel' },
        {
          text: 'Da, anulează',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelFriendRequest(requestId);
            if (success) {
              console.log('Friend request cancelled');
            }
          },
        },
      ]
    );
  };

  const renderRequestCard = (request: FriendRequest, type: 'incoming' | 'outgoing') => {
    const otherUser =
      type === 'incoming' ? request.requester : request.addressee;
    const displayName =
      otherUser?.username ||
      otherUser?.email?.split('@')[0] ||
      'Utilizator';

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color={colors.text.onPrimary} />
          </View>
          <View style={styles.requestInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userEmail}>{otherUser?.email || ''}</Text>
            <Text style={styles.requestDate}>
              {new Date(request.created_at).toLocaleDateString('ro-RO', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.requestActions}>
          {type === 'incoming' ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAccept(request.id)}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.text.onPrimary}
                />
                <Text style={styles.acceptButtonText}>Acceptă</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDecline(request.id)}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.error.main}
                />
                <Text style={styles.declineButtonText}>Respinge</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleCancel(request.id)}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={colors.text.secondary}
              />
              <Text style={styles.cancelButtonText}>Anulează</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const message =
      selectedTab === 'incoming'
        ? 'Nu ai cereri de prietenie primite.'
        : 'Nu ai cereri de prietenie trimise.';

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="mail-open-outline"
          size={64}
          color={colors.text.disabled}
        />
        <Text style={styles.emptyStateText}>{message}</Text>
      </View>
    );
  };

  const currentRequests =
    selectedTab === 'incoming' ? pendingIncoming : pendingOutgoing;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cereri de prietenie</Text>
        <Text style={styles.headerSubtitle}>
          {pendingIncoming.length} primite · {pendingOutgoing.length} trimise
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'incoming' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('incoming')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'incoming' && styles.activeTabText,
            ]}
          >
            Primite ({pendingIncoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'outgoing' && styles.activeTab,
          ]}
          onPress={() => setSelectedTab('outgoing')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'outgoing' && styles.activeTabText,
            ]}
          >
            Trimise ({pendingOutgoing.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error */}
      {requestsError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{requestsError}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loadingRequests}
            onRefresh={refreshRequests}
            colors={[colors.ai.primary]}
            tintColor={colors.ai.primary}
          />
        }
      >
        {loadingRequests ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.ai.primary} />
            <Text style={styles.loadingText}>Se încarcă cererile...</Text>
          </View>
        ) : currentRequests.length === 0 ? (
          renderEmptyState()
        ) : (
          currentRequests.map((request) => renderRequestCard(request, selectedTab))
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

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.ai.primary,
  },
  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.ai.primary,
    fontWeight: fontWeight.bold,
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
  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },

  // Request Card
  requestCard: {
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ai.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  requestInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  userEmail: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xxs,
  },
  requestDate: {
    fontSize: fontSize.xs,
    color: colors.text.disabled,
  },

  // Actions
  requestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.success.main,
  },
  acceptButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.onPrimary,
  },
  declineButton: {
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.error.main,
  },
  declineButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.error.main,
  },
  cancelButton: {
    backgroundColor: colors.surface.card,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
});

export default FriendsInboxScreen;
