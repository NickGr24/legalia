import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { colors } from '../utils/colors';
import { newColors, newSpacing, newBorderRadius } from '../utils/newDesignSystem';
import {
  UserLeaderboardRow,
  getUsersAllTime,
  getUsersThisWeek,
} from '../services/leaderboardService';
import { RootStackParamList } from '../utils/types';

type TabType = 'alltime' | 'weekly';
type NavigationProp = StackNavigationProp<RootStackParamList>;

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedTab, setSelectedTab] = useState<TabType>('alltime');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alltimeData, setAlltimeData] = useState<UserLeaderboardRow[]>([]);
  const [weeklyData, setWeeklyData] = useState<UserLeaderboardRow[]>([]);

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);

      const [alltime, weekly] = await Promise.all([
        getUsersAllTime(100),
        getUsersThisWeek(100),
      ]);

      setAlltimeData(alltime);
      setWeeklyData(weekly);
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      setAlltimeData([]);
      setWeeklyData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboardData();
  };

  const getCurrentData = () => {
    return selectedTab === 'alltime' ? alltimeData : weeklyData;
  };

  const renderUserItem = (item: UserLeaderboardRow) => {
    return (
      <View
        key={`user-${item.user_id}`}
        style={styles.userItem}
      >
        {/* User Avatar */}
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color={newColors.text.tertiary} />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user_name}</Text>
          {item.university_name && (
            <Text style={styles.universityName}>{item.university_name}</Text>
          )}
        </View>

        {/* XP */}
        <Text style={styles.xpText}>{item.total_xp?.toLocaleString() || 0} XP</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={newColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Clasament</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={newColors.text.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentData = getCurrentData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={newColors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clasament</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'alltime' && styles.activeTab]}
          onPress={() => setSelectedTab('alltime')}
        >
          <Text style={[styles.tabText, selectedTab === 'alltime' && styles.activeTabText]}>
            All-time
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
          onPress={() => setSelectedTab('weekly')}
        >
          <Text style={[styles.tabText, selectedTab === 'weekly' && styles.activeTabText]}>
            Weekly
          </Text>
        </TouchableOpacity>
      </View>

      {/* User List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentData.length > 0 ? (
          currentData.map((item) => renderUserItem(item))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={newColors.text.tertiary} />
            <Text style={styles.emptyText}>Nu există date disponibile</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newColors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: newSpacing.md,
    paddingVertical: newSpacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: newColors.text.primary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: newSpacing.lg,
    marginBottom: newSpacing.xl,
    backgroundColor: newColors.background.tertiary,
    borderRadius: newBorderRadius.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: newSpacing.sm,
    paddingHorizontal: newSpacing.lg,
    borderRadius: newBorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: newColors.background.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: newColors.text.secondary,
  },
  activeTabText: {
    color: newColors.text.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: newSpacing.lg,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: newSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: newColors.ui.border,
  },
  avatarContainer: {
    marginRight: newSpacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: newColors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: newColors.text.primary,
    marginBottom: 4,
  },
  universityName: {
    fontSize: 14,
    color: newColors.text.secondary,
  },
  xpText: {
    fontSize: 16,
    fontWeight: '600',
    color: newColors.text.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: newSpacing.xxxl,
  },
  emptyText: {
    fontSize: 16,
    color: newColors.text.tertiary,
    marginTop: newSpacing.md,
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: newSpacing.xxxl,
    paddingHorizontal: newSpacing.xl,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: newColors.text.secondary,
    marginTop: newSpacing.lg,
    marginBottom: newSpacing.sm,
  },
  comingSoonSubtitle: {
    fontSize: 14,
    color: newColors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
