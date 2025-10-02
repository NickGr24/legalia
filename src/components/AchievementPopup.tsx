import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { Achievement } from '../utils/types';
import { ACHIEVEMENT_RARITY_LABELS } from '../data/achievements';

interface AchievementPopupProps {
  visible: boolean;
  achievement: Achievement | null;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return colors.status.success;
    case 'rare': return colors.status.info;
    case 'epic': return colors.ai.accent;
    case 'legendary': return colors.gold;
    default: return colors.status.success;
  }
};

const getRarityGradient = (rarity: string): [string, string] => {
  switch (rarity) {
    case 'common': 
      return [colors.status.success + '20', colors.status.success + '10'];
    case 'rare': 
      return [colors.status.info + '20', colors.status.info + '10'];
    case 'epic': 
      return [colors.ai.accent + '20', colors.ai.accent + '10'];
    case 'legendary': 
      return [colors.gold + '20', colors.gold + '10'];
    default: 
      return [colors.status.success + '20', colors.status.success + '10'];
  }
};

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  visible,
  achievement,
  onClose
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          delay: 150,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!achievement) return null;

  const rarityColor = getRarityColor(achievement.rarity);
  const rarityGradient = getRarityGradient(achievement.rarity);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
        
        <Animated.View
          style={[
            styles.popup,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={rarityGradient}
            style={styles.popupBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Achievement unlocked title */}
            <View style={styles.header}>
              <Ionicons name="trophy" size={32} color={colors.gold} />
              <Text style={styles.unlockedText}>Realizare Deblocată!</Text>
            </View>

            {/* Achievement icon with bounce animation */}
            <Animated.View
              style={styles.iconContainer}
            >
              <View style={[styles.iconBackground, { borderColor: rarityColor }]}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              </View>
            </Animated.View>

            {/* Achievement details */}
            <View style={styles.details}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              
              <View style={styles.rarityContainer}>
                <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '20' }]}>
                  <Text style={[styles.rarityText, { color: rarityColor }]}>
                    {ACHIEVEMENT_RARITY_LABELS[achievement.rarity]}
                  </Text>
                </View>
              </View>

              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>

              <View style={styles.pointsContainer}>
                <Ionicons name="star" size={18} color={colors.gold} />
                <Text style={styles.pointsText}>
                  +{achievement.points} puncte
                </Text>
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: rarityColor }]}
              onPress={onClose}
            >
              <Text style={styles.actionButtonText}>Super!</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  popup: {
    width: Math.min(screenWidth - spacing.xl * 2, 350),
    maxHeight: screenHeight * 0.8,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  popupBackground: {
    backgroundColor: colors.background.secondary,
    padding: spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.primary + '50',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  unlockedText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginLeft: spacing.sm,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.primary,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  achievementIcon: {
    fontSize: 48,
  },
  details: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  achievementTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  rarityContainer: {
    marginBottom: spacing.sm,
  },
  rarityBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  rarityText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    fontFamily: fontConfig.body,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  achievementDescription: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    textAlign: 'center',
    lineHeight: fontSize.md * 1.4,
    marginBottom: spacing.md,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary + '50',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  pointsText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.gold,
    fontFamily: fontConfig.body,
    marginLeft: spacing.xs,
  },
  actionButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    minWidth: 120,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.body,
  },
});