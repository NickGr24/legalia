/**
 * FriendsScreen
 * Hub screen for friends feature with navigation to inbox, list, and leaderboard
 * Romanian UI
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
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
import type { RootStackParamList } from '@/utils/types';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const FriendsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { stats, refreshAll, loading } = useFriends();

  const menuItems = [
    {
      id: 'inbox',
      title: 'Cereri de prietenie',
      description: 'Acceptă sau respinge cereri',
      icon: 'mail' as const,
      badge: stats?.pending_incoming || 0,
      color: colors.warning.main,
      onPress: () => navigation.navigate('FriendsInbox'),
    },
    {
      id: 'list',
      title: 'Lista de prieteni',
      description: 'Vezi și gestionează prietenii',
      icon: 'people' as const,
      badge: stats?.total_friends || 0,
      color: colors.success.main,
      onPress: () => navigation.navigate('FriendsList'),
    },
    {
      id: 'leaderboard',
      title: 'Clasament prieteni',
      description: 'Compară scorurile cu prietenii',
      icon: 'trophy' as const,
      badge: null,
      color: colors.ai.primary,
      onPress: () => navigation.navigate('FriendsLeaderboard'),
    },
  ];

  const renderMenuItem = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={32} color={colors.text.onPrimary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <View style={styles.menuRight}>
        {item.badge !== null && item.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={24} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Prieteni</Text>
        <Text style={styles.headerSubtitle}>
          Invită prieteni și competează împreună
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshAll}
            colors={[colors.ai.primary]}
            tintColor={colors.ai.primary}
          />
        }
      >
        {/* Stats Card */}
        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={28} color={colors.ai.primary} />
              <Text style={styles.statValue}>{stats.total_friends}</Text>
              <Text style={styles.statLabel}>Prieteni</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="mail" size={28} color={colors.warning.main} />
              <Text style={styles.statValue}>{stats.pending_incoming}</Text>
              <Text style={styles.statLabel}>Cereri noi</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="paper-plane" size={28} color={colors.success.main} />
              <Text style={styles.statValue}>{stats.pending_outgoing}</Text>
              <Text style={styles.statLabel}>Trimise</Text>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuList}>
          {menuItems.map(renderMenuItem)}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle"
            size={24}
            color={colors.ai.primary}
          />
          <Text style={styles.infoText}>
            Adaugă prieteni pentru a vedea clasamentele împreună și a vă motiva
            reciproc să învățați!
          </Text>
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

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
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
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xxs,
    textAlign: 'center',
  },

  // Menu List
  menuList: {
    marginBottom: spacing.lg,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.elevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  menuDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.error.main,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.ai.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default FriendsScreen;
