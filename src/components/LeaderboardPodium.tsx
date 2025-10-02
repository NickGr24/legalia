import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import { AppText } from './AppText';
import { colors } from '../utils/colors';
import { shadowStyles, borderRadii } from '../utils/shadow';
import { layoutSpacing } from '../utils/layout';
import { getUniversityLogo } from '../utils/universityLogos';
import { UniversityLeaderboardRow } from '../services/leaderboardService';

interface LeaderboardPodiumProps {
  topThree: UniversityLeaderboardRow[];
}

interface PodiumPositionProps {
  university: UniversityLeaderboardRow;
  position: 1 | 2 | 3;
  height: number;
}

const PodiumPosition: React.FC<PodiumPositionProps> = ({ university, position, height }) => {
  const localLogo = getUniversityLogo(university.university_name);
  
  const getPositionColor = (): [string, string] => {
    switch (position) {
      case 1: return ['#FFD700', '#FFA500']; // Gold
      case 2: return ['#C0C0C0', '#A0A0A0']; // Silver  
      case 3: return ['#CD7F32', '#B8860B']; // Bronze
    }
  };

  const getTrophyIcon = () => {
    switch (position) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'medal-outline';
    }
  };

  const getTrophyColor = () => {
    switch (position) {
      case 1: return '#FFD700';
      case 2: return '#C0C0C0';
      case 3: return '#CD7F32';
    }
  };

  return (
    <Animated.View 
      style={[styles.positionContainer, { marginTop: position === 1 ? 0 : 20 }]}
    >
      {/* Trophy Icon */}
      <Animated.View 
        style={[styles.trophyContainer, { backgroundColor: getTrophyColor() }]}
      >
        <Ionicons name={getTrophyIcon()} size={24} color="#FFFFFF" />
      </Animated.View>

      {/* University Logo */}
      <View style={[styles.logoContainer, position === 1 && styles.winnerLogoContainer]}>
        {localLogo ? (
          <Image 
            source={localLogo} 
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Ionicons name="school" size={position === 1 ? 32 : 24} color={colors.text.secondary} />
          </View>
        )}
      </View>

      {/* University Name */}
      <AppText 
        variant="caption" 
        weight="bold" 
        align="center"
        style={[styles.universityName, position === 1 && styles.winnerName]}
        numberOfLines={2}
      >
        {university.university_name}
      </AppText>

      {/* XP Points */}
      <AppText 
        variant={position === 1 ? "body" : "caption"}
        weight="bold" 
        align="center"
        style={[styles.xpText, { color: getTrophyColor() }]}
      >
        {university.total_xp?.toLocaleString() || 0} XP
      </AppText>

      {/* Podium Base */}
      <LinearGradient
        colors={getPositionColor()}
        style={[styles.podiumBase, { height }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <AppText 
          variant="title" 
          weight="bold" 
          align="center"
          style={styles.positionNumber}
        >
          {position}
        </AppText>
      </LinearGradient>
    </Animated.View>
  );
};

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ topThree }) => {
  if (topThree.length === 0) return null;

  // Arrange for podium display: 2nd, 1st, 3rd
  const arrangedPositions = [
    topThree.find(u => u.rank_position === 2),
    topThree.find(u => u.rank_position === 1),
    topThree.find(u => u.rank_position === 3),
  ].filter(Boolean) as UniversityLeaderboardRow[];

  const podiumHeights = [80, 100, 60]; // Heights for 2nd, 1st, 3rd

  return (
    <Animated.View 
      style={styles.container}
    >
      <View style={styles.podiumContainer}>
        {arrangedPositions.map((university, index) => (
          <PodiumPosition
            key={university.university_name}
            university={university}
            position={university.rank_position as 1 | 2 | 3}
            height={podiumHeights[index]}
          />
        ))}
      </View>
      
      {/* Decorative elements */}
      <View style={styles.decorativeElements}>
        <Ionicons name="star" size={16} color="#FFD700" style={styles.star1} />
        <Ionicons name="star" size={12} color="#FFA500" style={styles.star2} />
        <Ionicons name="star" size={14} color="#FFD700" style={styles.star3} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: layoutSpacing.xl,
    paddingHorizontal: layoutSpacing.lg,
    alignItems: 'center',
  },

  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
  },

  positionContainer: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 120,
  },

  trophyContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: layoutSpacing.sm,
    ...shadowStyles.medium,
  },

  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadii.lg,
    marginBottom: layoutSpacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface.primary,
    ...shadowStyles.small,
  },

  winnerLogoContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadii.xl,
    borderWidth: 3,
    borderColor: '#FFD700',
    ...shadowStyles.large,
  },

  logo: {
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

  universityName: {
    marginBottom: layoutSpacing.xs,
    paddingHorizontal: 4,
    color: colors.text.primary,
  },

  winnerName: {
    fontSize: 14,
    fontWeight: '700',
  },

  xpText: {
    marginBottom: layoutSpacing.sm,
  },

  podiumBase: {
    width: '90%',
    borderTopLeftRadius: borderRadii.sm,
    borderTopRightRadius: borderRadii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyles.medium,
  },

  positionNumber: {
    color: '#FFFFFF',
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },

  star1: {
    position: 'absolute',
    top: 20,
    left: 30,
  },

  star2: {
    position: 'absolute',
    top: 40,
    right: 25,
  },

  star3: {
    position: 'absolute',
    bottom: 100,
    left: 20,
  },
});