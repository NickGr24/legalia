import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';


interface DisciplineCardProps {
  id: number;
  title: string;
  completed: number;
  total: number;
  onPress: (id: number, title: string) => void;
  index: number;
  isNew?: boolean;
  isUnlocked?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const DisciplineCard: React.FC<DisciplineCardProps> = ({
  id,
  title,
  completed,
  total,
  onPress,
  index,
  isNew = false,
  isUnlocked = false
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(index % 2 === 0 ? -100 : 100)).current; // Alternate left/right
  const badgeScale = useRef(new Animated.Value(0)).current;
  
  // Entrance animation with alternating direction
  useEffect(() => {
    const delay = index * 200; // Increased delay for smoother stagger
    
    // Fade in with slide from alternating sides
    Animated.timing(opacity, {
      toValue: 1,
      duration: 800,
      delay,
      useNativeDriver: true,
    }).start();
    
    Animated.spring(translateX, {
      toValue: 0,
      delay,
      useNativeDriver: true,
    }).start();
    
    // Badge animation if new/unlocked
    if (isNew || isUnlocked) {
      Animated.spring(badgeScale, {
        toValue: 1,
        delay: delay + 400,
        useNativeDriver: true,
      }).start();
    }
  }, [index, isNew, isUnlocked, opacity, translateX, badgeScale]);
  

  const handlePressIn = () => {
    // Subtle scale animation without flickering
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Return to normal scale
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    onPress(id, title);
  };

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  // AI-стиль темы для дисциплин
  const getCardTheme = (title: string, index: number) => {
    const themes = [
      {
        icon: 'library' as keyof typeof Ionicons.glyphMap,
        gradient: ['#1f4037', '#99f2c8'] as const,
        accentColor: '#99f2c8',
        bgGradient: ['#1f4037', '#99f2c8'] as const,
        iconBg: ['#1f4037', '#99f2c8'] as const,
      },
      {
        icon: 'time' as keyof typeof Ionicons.glyphMap,
        gradient: ['#1f4037', '#99f2c8'] as const,
        accentColor: '#99f2c8',
        bgGradient: ['#1f4037', '#99f2c8'] as const,
        iconBg: ['#1f4037', '#99f2c8'] as const,
      },
      {
        icon: 'document-text' as keyof typeof Ionicons.glyphMap,
        gradient: ['#1f4037', '#99f2c8'] as const,
        accentColor: '#99f2c8',
        bgGradient: ['#1f4037', '#99f2c8'] as const,
        iconBg: ['#1f4037', '#99f2c8'] as const,
      },
      {
        icon: 'school' as keyof typeof Ionicons.glyphMap,
        gradient: ['#1f4037', '#99f2c8'] as const,
        accentColor: '#99f2c8',
        bgGradient: ['#1f4037', '#99f2c8'] as const,
        iconBg: ['#1f4037', '#99f2c8'] as const,
      }
    ];

    return themes[index % themes.length];
  };

  const theme = getCardTheme(title, index);

  // Badge component
  const renderBadge = () => {
    if (!isNew && !isUnlocked) return null;
    
    const badgeText = isNew ? 'NOU' : 'DEBLOCAT';
    const badgeColor = isNew ? colors.status.error : colors.ai.accent;
    
    return (
      <Animated.View 
        style={[
          styles.badge, 
          {
            backgroundColor: badgeColor,
            transform: [{ scale: badgeScale }],
            opacity: badgeScale,
          }
        ]}
      >
        <Text style={styles.badgeText}>{badgeText}</Text>
      </Animated.View>
    );
  };

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.container, 
        {
          transform: [
            { scale: scale },
            { translateX: translateX }
          ],
          opacity: opacity,
        }
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >

      
      {/* Modern Card */}
      <Animated.View style={styles.modernCard}>
        {/* Background */}
        <LinearGradient
          colors={theme.bgGradient}
          style={styles.cardBackground}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Content */}
        <View style={styles.cardContent}>
          {/* Header with Icon and Progress */}
          <View style={styles.cardHeader}>
            <View style={styles.iconSection}>
              <LinearGradient
                colors={theme.iconBg}
                style={styles.iconContainer}
              >
                <Ionicons name={theme.icon} size={28} color="white" />
              </LinearGradient>
            </View>
            
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                {completed}/{total}
              </Text>
              <Text style={styles.progressLabel}>quiz-uri</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${percentage}%`,
                    backgroundColor: theme.accentColor 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressPercentage}>{percentage}%</Text>
          </View>
        </View>

        {/* Subtle Glow Effect */}
        <View style={[styles.cardGlow, { backgroundColor: `${theme.accentColor}10` }]} />
      </Animated.View>
      
      {/* Badge */}
      {renderBadge()}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
  },
  
  glowEffect2: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: borderRadius.xl + 10,
    zIndex: 0,
  },
  
  modernCard: {
    backgroundColor: colors.surface.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    minHeight: 140,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.medium,
  },
  
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.xl,
  },
  
  cardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: borderRadius.xl + 2,
    zIndex: 1,
  },
  
  cardContent: {
    position: 'relative',
    zIndex: 2,
  },
  
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  iconSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  
  progressSection: {
    alignItems: 'flex-end',
  },
  
  progressText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
  },
  
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.text.onPrimary + 'CC',
    fontFamily: fontConfig.body,
    marginTop: spacing.xs,
  },
  
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.onPrimary,
    marginBottom: spacing.md,
    lineHeight: fontSize.lg * 1.4,
    fontFamily: fontConfig.heading,
  },
  
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  
  progressBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.text.onPrimary + '20',
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  
  progressPercentage: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.onPrimary + 'CC',
    fontFamily: fontConfig.body,
    minWidth: 35,
    textAlign: 'right',
  },
  

  

  
  badge: {
    position: 'absolute',
    top: -8,
    right: 15,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    zIndex: 10,
    ...shadows.medium,
  },
  
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: 'white',
    letterSpacing: 0.5,
    fontFamily: fontConfig.body,
  },
}); 