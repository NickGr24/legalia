import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  color?: string;
  backgroundColor?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  duration?: number;
  label?: string;
  gradientColors?: readonly string[];
  style?: any;
}

export const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  progress,
  color = colors.primary.main,
  backgroundColor = 'rgba(0, 0, 0, 0.06)',
  height = 8,
  showPercentage = false,
  animated = true,
  duration = 500,
  label,
  gradientColors,
  style,
}) => {
  const animatedProgress = useRef(new Animated.Value(0)).current;
  const shimmerPosition = useRef(new Animated.Value(-1)).current;
  const scaleY = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (animated) {
      // Animate progress bar fill
      Animated.timing(animatedProgress, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();

      // Scale animation for entrance
      Animated.spring(scaleY, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // Shimmer effect when progress increases
      if (progress > 0) {
        Animated.timing(shimmerPosition, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      }
    } else {
      animatedProgress.setValue(progress);
      scaleY.setValue(1);
    }
  }, [progress, animated, duration, animatedProgress, scaleY, shimmerPosition]);

  const progressBarWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: 'clamp',
  });

  const shimmerTranslateX = shimmerPosition.interpolate({
    inputRange: [-1, 1],
    outputRange: [-100, 300],
    extrapolate: 'clamp',
  });

  const shimmerOpacity = shimmerPosition.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0.6, 0],
    extrapolate: 'clamp',
  });

  const renderProgressFill = () => {
    if (gradientColors && gradientColors.length > 1) {
      return (
        <LinearGradient
          colors={gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { height }]}
        >
          {/* Shimmer effect */}
          <Animated.View 
            style={[
              styles.shimmer, 
              {
                transform: [{ translateX: shimmerTranslateX }],
                opacity: shimmerOpacity,
              }
            ]} 
          />
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.progressFill, { backgroundColor: color, height }]}>
        {/* Shimmer effect */}
        <Animated.View 
          style={[
            styles.shimmer, 
            {
              transform: [{ translateX: shimmerTranslateX }],
              opacity: shimmerOpacity,
            }
          ]} 
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}

      {/* Progress Bar */}
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor, 
            height, 
            borderRadius: height / 2,
            transform: [{ scaleY: scaleY }],
          }
        ]}
      >
        <Animated.View
          style={[
            styles.progressContainer,
            {
              width: progressBarWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              transform: [{ scaleY: scaleY }],
              borderRadius: height / 2,
            }
          ]}
        >
          {renderProgressFill()}
        </Animated.View>

        {/* Glow effect for active progress */}
        {progress > 0 && (
          <Animated.View
            style={[
              styles.glow,
              {
                width: progressBarWidth.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                transform: [{ scaleY: scaleY }],
                backgroundColor: `${color}30`,
                height: height + 4,
                borderRadius: (height + 4) / 2,
                top: -2,
              }
            ]}
          />
        )}
      </Animated.View>

      {/* Standalone percentage */}
      {showPercentage && !label && (
        <Text style={styles.standalonePercentage}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
  },

  percentage: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary.main,
    fontFamily: fontConfig.body,
  },

  standalonePercentage: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary.main,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontFamily: fontConfig.body,
  },

  track: {
    position: 'relative',
    overflow: 'hidden',
    ...shadows.small,
  },

  progressContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    overflow: 'hidden',
  },

  progressFill: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    width: 50,
  },

  glow: {
    position: 'absolute',
    left: 0,
    zIndex: -1,
    opacity: 0.3,
  },
});