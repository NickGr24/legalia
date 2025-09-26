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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { colors } from '../utils/colors';
import { contentContainer, layoutSpacing } from '../utils/layout';
import { shadowStyles, borderRadii } from '../utils/shadow';
import { AppText } from '../components/AppText';
import { UniversityLeaderboardCard } from '../components/UniversityLeaderboardCard';
import { LeaderboardPodium } from '../components/LeaderboardPodium';
import { useAuth } from '../contexts/AuthContext';
import { 
  LeaderboardEntry, 
  UserLeaderboardStats, 
  getLeaderboardWithRealUser,
  getUsersAllTime,
  getUniversitiesAllTime,
  getUniversitiesThisWeek,
  UserLeaderboardRow,
  UniversityLeaderboardRow,
} from '../services/leaderboardService';
import { t } from '../i18n';
import { BurgerButton } from '../components/BurgerButton';

type TabType = 'users' | 'universities';

export const LeaderboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usersData, setUsersData] = useState<UserLeaderboardRow[]>([]);
  const [universitiesData, setUniversitiesData] = useState<UniversityLeaderboardRow[]>([]);

  useEffect(() => {
    loadLeaderboardData();
  }, [user?.id]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      
      // Load all leaderboard data
      const [users, universities] = await Promise.all([
        getUsersAllTime(100), // Top 100 as per requirements
        getUniversitiesAllTime(50),
      ]);
      
      setUsersData(users);
      setUniversitiesData(universities);

    } catch (error) {
      console.error('Error loading leaderboard data:', error);
      
      // Fallback to empty data if there's an error
      setUsersData([]);
      setUniversitiesData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboardData();
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏆';
    if (rank <= 50) return '⭐';
    return '🎯';
  };

  const formatRank = (rank: number) => {
    if (rank <= 3) return '';
    return `${rank}`;
  };

  const getCurrentData = () => {
    switch (selectedTab) {
      case 'users':
        return usersData;
      case 'universities':
        return universitiesData;
      default:
        return [];
    }
  };

  const renderUserItem = (item: UserLeaderboardRow, index: number) => {
    return (
      <Animated.View
        key={`user-${item.user_id}`}
        entering={FadeInDown.delay(index * 100).duration(600)}
      >
        <View style={styles.leaderboardItem}>
          <View style={styles.rankContainer}>
            <AppText variant="body" style={styles.rankBadge}>{getRankBadge(item.rank_position)}</AppText>
            <AppText variant="caption" color="secondary" style={styles.rankText}>{formatRank(item.rank_position)}</AppText>
          </View>

          <View style={styles.userContainer}>
            <View style={styles.avatarContainer}>
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={24} color={colors.text.secondary} />
              )}
            </View>
            <View style={styles.userInfo}>
              <AppText variant="body" weight="medium" style={styles.userName} numberOfLines={1}>
                {item.user_name}
              </AppText>
              {item.university_name && (
                <AppText variant="caption" color="tertiary" style={styles.universityName} numberOfLines={1}>
                  {item.university_name}
                </AppText>
              )}
            </View>
          </View>

          <View style={styles.pointsContainer}>
            <AppText variant="body" weight="bold" style={styles.points}>
              {item.total_xp?.toLocaleString() || 0}
            </AppText>
            <AppText variant="caption" color="secondary" style={styles.pointsLabel}>
              XP
            </AppText>
          </View>
        </View>
      </Animated.View>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header with Burger Button */}
        <View style={styles.headerBar}>
          <BurgerButton />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <AppText variant="body" color="secondary" style={styles.loadingText}>
            {t('loading')}
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  const currentData = getCurrentData();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Burger Button */}
      <View style={styles.headerBar}>
        <BurgerButton />
      </View>
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient
          colors={colors.gradients.background}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="trophy" size={32} color="white" />
            </View>
            <AppText variant="title" weight="bold" style={styles.headerTitle}>
              {t('leaderboard_title')}
            </AppText>
            <AppText variant="body" color="secondary" style={styles.headerSubtitle}>
              {t('leaderboard_subtitle')}
            </AppText>
          </Animated.View>
        </LinearGradient>

        {/* Tab Selector */}
        <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'users' && styles.activeTab]}
            onPress={() => setSelectedTab('users')}
          >
            <Ionicons
              name="person"
              size={16}
              color={selectedTab === 'users' ? colors.primary.main : colors.text.secondary}
            />
            <AppText variant="caption" weight={selectedTab === 'users' ? 'bold' : 'medium'} style={[styles.tabText, selectedTab === 'users' && styles.activeTabText]}>
              {t('leaderboard_users')}
            </AppText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'universities' && styles.activeTab]}
            onPress={() => setSelectedTab('universities')}
          >
            <Ionicons
              name="school"
              size={16}
              color={selectedTab === 'universities' ? colors.primary.main : colors.text.secondary}
            />
            <AppText variant="caption" weight={selectedTab === 'universities' ? 'bold' : 'medium'} style={[styles.tabText, selectedTab === 'universities' && styles.activeTabText]}>
              {t('leaderboard_universities')}
            </AppText>
          </TouchableOpacity>

        </Animated.View>

        {/* Leaderboard Content */}
        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.leaderboardContainer}>
          {selectedTab === 'users' ? (
            <>
              <AppText variant="subtitle" weight="bold" style={styles.sectionTitle}>
                {t('leaderboard_users')}
              </AppText>
              
              {currentData.length > 0 ? (
                currentData.map((item, index) => renderUserItem(item as UserLeaderboardRow, index))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
                  <AppText variant="subtitle" weight="bold" style={styles.emptyTitle}>
                    {t('leaderboard_no_data')}
                  </AppText>
                  <AppText variant="body" color="secondary" style={styles.emptySubtitle}>
                    {t('leaderboard_empty_subtitle')}
                  </AppText>
                </View>
              )}
            </>
          ) : (
            <>
              {currentData.length > 0 ? (
                <>
                  {/* Top 3 Podium for Universities */}
                  {currentData.slice(0, 3).length > 0 && (
                    <LeaderboardPodium topThree={currentData.slice(0, 3) as UniversityLeaderboardRow[]} />
                  )}

                  {/* Remaining Universities */}
                  {currentData.slice(3).length > 0 && (
                    <>
                      <AppText variant="subtitle" weight="bold" style={styles.sectionTitle}>
                        {t('leaderboard_all_universities')}
                      </AppText>
                      {currentData.slice(3).map((university, index) => (
                        <UniversityLeaderboardCard
                          key={`university-${university.university_name}`}
                          university={university as UniversityLeaderboardRow}
                          index={index + 3}
                          isTopThree={false}
                        />
                      ))}
                    </>
                  )}
                </>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="school-outline" size={64} color={colors.text.tertiary} />
                  <AppText variant="subtitle" weight="bold" style={styles.emptyTitle}>
                    {t('leaderboard_no_data')}
                  </AppText>
                  <AppText variant="body" color="secondary" style={styles.emptySubtitle}>
                    {t('leaderboard_empty_subtitle')}
                  </AppText>
                </View>
              )}
            </>
          )}
        </Animated.View>

        {/* Footer spacing for Samsung navigation */}
        <View style={styles.footerSpacing} />
      </ScrollView>
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
  },
  loadingText: {
    marginTop: layoutSpacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: layoutSpacing.sm,
  },
  content: {
    flex: 1,
  },
  headerGradient: {
    paddingBottom: layoutSpacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: layoutSpacing.xl,
    paddingTop: layoutSpacing.lg,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.ai.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.ai.glassBorder,
    marginBottom: layoutSpacing.md,
  },
  headerTitle: {
    color: colors.text.onPrimary,
    marginBottom: layoutSpacing.xs,
  },
  headerSubtitle: {
    color: colors.text.onPrimary + 'CC',
  },
  userStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: layoutSpacing.xl,
    paddingVertical: layoutSpacing.lg,
    gap: layoutSpacing.md,
  },
  userStatCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadii.xl,
    padding: layoutSpacing.lg,
    alignItems: 'center',
    ...shadowStyles.medium,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  userStatValue: {
    color: colors.primary.main,
    marginBottom: layoutSpacing.xs,
  },
  userStatLabel: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: layoutSpacing.xl,
    marginBottom: layoutSpacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadii.lg,
    padding: layoutSpacing.xs,
    ...shadowStyles.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: layoutSpacing.md,
    paddingHorizontal: layoutSpacing.sm,
    borderRadius: borderRadii.md,
    gap: layoutSpacing.sm,
  },
  activeTab: {
    backgroundColor: colors.primary.main + '15',
  },
  tabText: {
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary.main,
  },
  leaderboardContainer: {
    paddingHorizontal: layoutSpacing.xl,
    paddingBottom: layoutSpacing.xl,
  },
  sectionTitle: {
    color: colors.text.primary,
    marginBottom: layoutSpacing.lg,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadii.xl,
    padding: layoutSpacing.lg,
    marginBottom: layoutSpacing.md,
    ...shadowStyles.medium,
    elevation: 6,
  },
  currentUserItem: {
    borderWidth: 3,
    borderColor: colors.primary.main + '60',
    ...shadowStyles.large,
    elevation: 10,
  },
  topRankItem: {
    borderWidth: 2,
    borderColor: colors.gold + '40',
    ...shadowStyles.large,
    elevation: 8,
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: layoutSpacing.md,
    minWidth: 60,
  },
  rankBadge: {
    fontSize: 32,
    marginBottom: layoutSpacing.xs,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  rankText: {
    color: colors.text.secondary,
  },
  currentUserRank: {
    color: colors.primary.main,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: layoutSpacing.md,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  currentUserAvatar: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '10',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text.primary,
    marginBottom: layoutSpacing.xs,
  },
  currentUserName: {
    color: colors.primary.main,
  },
  youLabel: {
    color: colors.primary.main,
    textTransform: 'uppercase',
  },
  universityName: {
    color: colors.text.tertiary,
    marginTop: layoutSpacing.xs / 2,
  },
  logoContainer: {
    marginHorizontal: layoutSpacing.sm,
  },
  universityLogo: {
    width: 44,
    height: 44,
    borderRadius: borderRadii.sm,
  },
  logoPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: borderRadii.sm,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  studentsCount: {
    color: colors.text.tertiary,
    marginTop: layoutSpacing.xs / 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  points: {
    color: colors.text.primary,
    marginBottom: layoutSpacing.xs,
  },
  currentUserPoints: {
    color: colors.primary.main,
  },
  pointsLabel: {
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: layoutSpacing.xxl,
  },
  emptyTitle: {
    color: colors.text.secondary,
    marginTop: layoutSpacing.lg,
    marginBottom: layoutSpacing.sm,
  },
  emptySubtitle: {
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  footerSpacing: {
    height: Platform.OS === 'android' ? layoutSpacing.xxl : layoutSpacing.lg,
  },
});