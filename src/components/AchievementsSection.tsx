import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { t } from '../i18n';
import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress, 
  AchievementStats 
} from '../utils/types';
import { 
  ACHIEVEMENT_CATEGORY_LABELS, 
  ACHIEVEMENT_RARITY_LABELS,
  getAchievementsByCategory 
} from '../data/achievements';
import { achievementsService } from '../services/achievementsService';

interface AchievementsSectionProps {
  onAchievementPress?: (achievement: Achievement) => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return colors.status.success;
    case 'rare': return colors.status.info;
    case 'epic': return colors.ai.accent;
    case 'legendary': return colors.gold;
    default: return colors.status.success;
  }
};

const AchievementCard: React.FC<{
  achievement: Achievement;
  userAchievement: UserAchievement | null;
  progress: AchievementProgress | null;
  onPress: () => void;
}> = ({ achievement, userAchievement, progress, onPress }) => {
  const isUnlocked = !!userAchievement;
  const rarityColor = getRarityColor(achievement.rarity);
  const progressPercentage = progress?.percentage || 0;

  return (
    <TouchableOpacity
      style={[
        styles.achievementCard,
        isUnlocked && styles.achievementCardUnlocked
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.achievementHeader}>
        <View style={[
          styles.achievementIcon,
          isUnlocked && styles.achievementIconUnlocked,
          { borderColor: rarityColor }
        ]}>
          <Text style={[
            styles.achievementEmoji,
            !isUnlocked && styles.achievementEmojiLocked
          ]}>
            {achievement.icon}
          </Text>
        </View>

        <View style={styles.achievementInfo}>
          <Text style={[
            styles.achievementTitle,
            !isUnlocked && styles.achievementTitleLocked
          ]}>
            {achievement.title}
          </Text>
          
          <View style={styles.rarityBadge}>
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {ACHIEVEMENT_RARITY_LABELS[achievement.rarity]}
            </Text>
          </View>
        </View>

        <View style={styles.achievementPoints}>
          <Ionicons 
            name="star" 
            size={14} 
            color={isUnlocked ? colors.gold : colors.text.tertiary} 
          />
          <Text style={[
            styles.pointsText,
            !isUnlocked && styles.pointsTextLocked
          ]}>
            {achievement.points}
          </Text>
        </View>
      </View>

      <Text style={[
        styles.achievementDescription,
        !isUnlocked && styles.achievementDescriptionLocked
      ]}>
        {achievement.description}
      </Text>

      {!isUnlocked && progress && progressPercentage > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: rarityColor
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {progress.current_progress}/{progress.target_progress}
          </Text>
        </View>
      )}

      {isUnlocked && userAchievement && (
        <View style={styles.unlockedContainer}>
          <Ionicons name="checkmark-circle" size={16} color={colors.status.success} />
          <Text style={styles.unlockedDate}>
            Deblocat: {new Date(userAchievement.unlocked_at).toLocaleDateString('ro-RO')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ 
  onAchievementPress 
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [progress, setProgress] = useState<Record<string, AchievementProgress>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievementData();
  }, []);

  const loadAchievementData = async () => {
    try {
      setLoading(true);
      
      const [achievementStats, userAchs, progressData] = await Promise.all([
        achievementsService.getAchievementStats(),
        achievementsService.getUserAchievements(),
        achievementsService.getAchievementProgress()
      ]);

      setStats(achievementStats);
      setUserAchievements(userAchs);
      setProgress(progressData);
    } catch (error) {
      console.error('Failed to load achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Object.keys(ACHIEVEMENT_CATEGORY_LABELS)];

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return achievementsService.getAchievementsByCategory('quiz_progress')
        .concat(achievementsService.getAchievementsByCategory('perfect_scores'))
        .concat(achievementsService.getAchievementsByCategory('speed_bonuses'))
        .concat(achievementsService.getAchievementsByCategory('streaks'))
        .concat(achievementsService.getAchievementsByCategory('scoring_milestones'))
        .concat(achievementsService.getAchievementsByCategory('leaderboard'));
    }
    return getAchievementsByCategory(selectedCategory);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary.main} />
        <Text style={styles.loadingText}>{t('loading_achievements')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Overview */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Progres Realizări</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.unlockedAchievements}</Text>
              <Text style={styles.statLabel}>Deblocate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalAchievements}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.completionPercentage)}%</Text>
              <Text style={styles.statLabel}>Completat</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.earnedPoints}</Text>
              <Text style={styles.statLabel}>Puncte</Text>
            </View>
          </View>
        </View>
      )}

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>
                {category === 'all' ? 'Toate' : ACHIEVEMENT_CATEGORY_LABELS[category]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Achievement List */}
      <ScrollView style={styles.achievementsList} showsVerticalScrollIndicator={false}>
        {getFilteredAchievements().map((achievement, index) => {
          const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
          const achievementProgress = progress[achievement.id];

          return (
            <View key={achievement.id}>
              <AchievementCard
                achievement={achievement}
                userAchievement={userAchievement || null}
                progress={achievementProgress || null}
                onPress={() => onAchievementPress?.(achievement)}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    marginTop: spacing.sm,
  },
  statsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  statsTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    marginTop: spacing.xs,
  },
  categoryContainer: {
    marginBottom: spacing.md,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.background.primary,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  categoryButtonText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    fontWeight: fontWeight.medium,
  },
  categoryButtonTextActive: {
    color: colors.text.onPrimary,
  },
  achievementsList: {
    flex: 1,
  },
  achievementCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    opacity: 0.7,
    ...shadows.small,
  },
  achievementCardUnlocked: {
    opacity: 1,
    borderWidth: 1,
    borderColor: colors.status.success + '30',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.text.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  achievementIconUnlocked: {
    backgroundColor: colors.background.primary,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementEmojiLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.xs,
  },
  achievementTitleLocked: {
    color: colors.text.secondary,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
  },
  rarityText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    fontFamily: fontConfig.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.gold,
    fontFamily: fontConfig.body,
    marginLeft: spacing.xs,
  },
  pointsTextLocked: {
    color: colors.text.tertiary,
  },
  achievementDescription: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    lineHeight: fontSize.sm * 1.4,
    marginBottom: spacing.sm,
  },
  achievementDescriptionLocked: {
    color: colors.text.tertiary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.background.primary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    fontFamily: fontConfig.body,
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unlockedDate: {
    fontSize: fontSize.xs,
    color: colors.status.success,
    fontFamily: fontConfig.body,
    fontStyle: 'italic',
  },
});