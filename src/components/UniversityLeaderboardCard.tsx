import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { AppText } from './AppText';
import { colors } from '@/utils/colors';
import { shadowStyles, borderRadii } from '@/utils/shadow';
import { layoutSpacing } from '@/utils/layout';
import { getUniversityLogo } from '@/utils/universityLogos';
import { UniversityLeaderboardRow } from '@/services/leaderboardService';

interface UniversityLeaderboardCardProps {
  university: UniversityLeaderboardRow;
  index: number;
  isTopThree?: boolean;
}

export const UniversityLeaderboardCard: React.FC<UniversityLeaderboardCardProps> = ({
  university,
  index,
  isTopThree = false,
}) => {
  const localLogo = getUniversityLogo(university.university_name);
  const isWinner = university.rank_position === 1;
  const isSecond = university.rank_position === 2;
  const isThird = university.rank_position === 3;

  const getRankIcon = () => {
    if (isWinner) return 'trophy';
    if (isSecond) return 'medal';
    if (isThird) return 'medal-outline';
    return null;
  };

  const getRankColor = () => {
    if (isWinner) return '#FFD700'; // Gold
    if (isSecond) return '#C0C0C0'; // Silver
    if (isThird) return '#CD7F32'; // Bronze
    return colors.text.secondary;
  };

  const getCardGradient = (): [string, string] => {
    if (isWinner) return ['#FFD700', '#FFA500']; // Gold gradient
    if (isSecond) return ['#C0C0C0', '#A0A0A0']; // Silver gradient
    if (isThird) return ['#CD7F32', '#B8860B']; // Bronze gradient
    return [colors.background.secondary, colors.background.primary]; // Light cream to white
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={[
        styles.container,
        isTopThree && styles.topThreeContainer,
        isWinner && styles.winnerContainer,
      ]}
    >
      <TouchableOpacity activeOpacity={0.9}>
        <LinearGradient
          colors={getCardGradient()}
          style={[
            styles.card,
            isTopThree && styles.topThreeCard,
            isWinner && styles.winnerCard,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Rank Badge */}
          <View style={[styles.rankBadge, { backgroundColor: getRankColor() }]}>
            {getRankIcon() ? (
              <Ionicons 
                name={getRankIcon() as any} 
                size={isTopThree ? 20 : 16} 
                color={isTopThree ? '#FFFFFF' : colors.text.onPrimary} 
              />
            ) : (
              <AppText 
                variant="caption" 
                weight="bold" 
                style={[
                  styles.rankText,
                  { color: isTopThree ? '#FFFFFF' : colors.text.onPrimary }
                ]}
              >
                #{university.rank_position}
              </AppText>
            )}
          </View>

          {/* University Logo */}
          <View style={[styles.logoContainer, isTopThree && styles.topThreeLogoContainer]}>
            {localLogo ? (
              <Image 
                source={localLogo} 
                style={[styles.logo, isTopThree && styles.topThreeLogo]}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.logoPlaceholder, isTopThree && styles.topThreeLogoPlaceholder]}>
                <Ionicons 
                  name="school" 
                  size={isTopThree ? 32 : 24} 
                  color={colors.text.secondary} 
                />
              </View>
            )}
          </View>

          {/* University Info */}
          <View style={styles.infoContainer}>
            <AppText 
              variant={isTopThree ? "subtitle" : "body"} 
              weight="bold" 
              style={[
                styles.universityName,
                isTopThree && styles.topThreeUniversityName,
              ]}
              numberOfLines={isTopThree ? 3 : 2}
            >
              {university.university_name}
            </AppText>
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={14} color={colors.text.tertiary} />
                <AppText variant="caption" color="tertiary" style={styles.statText}>
                  {university.students_count || 0} studenți
                </AppText>
              </View>
            </View>
          </View>

          {/* XP Points */}
          <View style={[styles.xpContainer, isTopThree && styles.topThreeXpContainer]}>
            <AppText 
              variant={isTopThree ? "subtitle" : "body"} 
              weight="bold" 
              style={[
                styles.xpPoints,
                isTopThree && styles.topThreeXpPoints,
              ]}
            >
              {university.total_xp?.toLocaleString() || 0}
            </AppText>
            <AppText 
              variant="caption" 
              color="secondary" 
              style={styles.xpLabel}
            >
              XP
            </AppText>
          </View>

          {/* Winner Crown Effect */}
          {isWinner && (
            <View style={styles.crownContainer}>
              <Ionicons name="diamond" size={16} color="#FFD700" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: layoutSpacing.lg,
    marginVertical: layoutSpacing.xs,
  },

  topThreeContainer: {
    marginVertical: layoutSpacing.sm,
  },

  winnerContainer: {
    marginVertical: layoutSpacing.md,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: layoutSpacing.md,
    paddingHorizontal: layoutSpacing.lg,
    borderRadius: borderRadii.lg,
    ...shadowStyles.card,
    backgroundColor: colors.surface.primary,
  },

  topThreeCard: {
    paddingVertical: layoutSpacing.lg,
    borderRadius: borderRadii.xl,
    ...shadowStyles.large,
  },

  winnerCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    ...shadowStyles.large,
  },

  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: layoutSpacing.md,
  },

  rankText: {
    fontSize: 12,
  },

  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadii.md,
    marginRight: layoutSpacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface.secondary,
    ...shadowStyles.small,
  },

  topThreeLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadii.lg,
    ...shadowStyles.medium,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  topThreeLogo: {
    width: '100%',
    height: '100%',
  },

  logoPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface.secondary,
  },

  topThreeLogoPlaceholder: {
    backgroundColor: colors.surface.elevated,
  },

  infoContainer: {
    flex: 1,
    marginRight: layoutSpacing.sm,
  },

  universityName: {
    marginBottom: layoutSpacing.xs,
  },

  topThreeUniversityName: {
    fontSize: 18,
    lineHeight: 22,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: layoutSpacing.md,
  },

  statText: {
    marginLeft: 4,
  },

  xpContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
  },

  topThreeXpContainer: {
    minWidth: 100,
  },

  xpPoints: {
    marginBottom: 2,
  },

  topThreeXpPoints: {
    fontSize: 20,
    color: colors.ai.primary,
  },

  xpLabel: {
    fontSize: 12,
  },

  crownContainer: {
    position: 'absolute',
    top: -8,
    right: layoutSpacing.lg,
    backgroundColor: colors.surface.primary,
    borderRadius: 12,
    padding: 4,
    ...shadowStyles.small,
  },
});