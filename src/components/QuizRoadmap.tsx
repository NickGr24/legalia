import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';

const { width } = Dimensions.get('window');

interface QuizWithProgress {
  id: number;
  title: string;
  level: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  score?: number;
}

interface QuizRoadmapProps {
  quizzes: QuizWithProgress[];
  onQuizPress: (quizId: number, quizTitle: string) => void;
  disciplineName: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Separate QuizNode component to avoid hooks in render functions
const QuizNode: React.FC<{
  quiz: QuizWithProgress;
  index: number;
  position: { x: number; isLeft: boolean };
  theme: any;
  iconName: string;
  onQuizPress: (quizId: number, quizTitle: string) => void;
  visibleQuizzes: Set<number>;
  addVisibleQuiz: (index: number) => void;
}> = ({ 
  quiz, 
  index, 
  position, 
  theme, 
  iconName, 
  onQuizPress, 
  visibleQuizzes, 
  addVisibleQuiz
}) => {
  // Simple animation for current quiz
  const pulseScale = useRef(new Animated.Value(1)).current;
  const shadowOffset = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (quiz.isCurrent) {
      Animated.sequence([
        Animated.delay(1000),
        Animated.spring(pulseScale, {
          toValue: 1.05,
          useNativeDriver: true,
        }),
        Animated.spring(pulseScale, {
          toValue: 1,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [quiz.isCurrent, pulseScale]);

  const animatedStyle = {
    transform: [
      { 
        scale: Animated.multiply(
          pulseScale,
          shadowOffset.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.size, theme.size * 1.02],
          })
        )
      },
      { translateX: position.x }
    ],
    shadowColor: theme.shadowColor,
  };

  const glowStyle = {
    opacity: glowOpacity,
    transform: [
      { 
        scale: glowOpacity.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1.1],
        })
      }
    ],
  };

  const handlePressIn = () => {
    if (quiz.isLocked) return;
    Animated.spring(pulseScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    Animated.timing(shadowOffset, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    Animated.timing(glowOpacity, {
      toValue: 0.8,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (quiz.isLocked) return;
    Animated.spring(pulseScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    Animated.timing(shadowOffset, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(glowOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Prevent multiple rapid presses
    if (quiz.isLocked) return;
    
    Animated.sequence([
      Animated.spring(pulseScale, {
        toValue: 1.2,
        useNativeDriver: true,
      }),
      Animated.spring(pulseScale, {
        toValue: 1,
        useNativeDriver: true,
      })
    ]).start();
    
    // Debounce the quiz press to prevent multiple navigations
    setTimeout(() => {
      onQuizPress(quiz.id, quiz.title);
    }, 100);
  };

  return (
    <View 
      style={[
        styles.nodeContainer,
        { 
          width: width * 0.7,
          marginLeft: position.isLeft ? 0 : 'auto',
          marginRight: position.isLeft ? 'auto' : 0
        }
      ]}
      onLayout={() => {
        // Add quiz to visible on first render
        if (!visibleQuizzes.has(index)) {
          addVisibleQuiz(index);
        }
      }}
    >
      {/* Glow Effect */}
      <Animated.View 
        style={[
          styles.glowEffect, 
          glowStyle,
          { backgroundColor: `${theme.shadowColor}20` }
        ]} 
      />
      
      <AnimatedTouchableOpacity
        style={[styles.nodeCard, animatedStyle]}
        onPressIn={quiz.isLocked ? undefined : handlePressIn}
        onPressOut={quiz.isLocked ? undefined : handlePressOut}
        onPress={quiz.isLocked ? undefined : handlePress}
        activeOpacity={quiz.isLocked ? 1 : 0.8}
        disabled={quiz.isLocked}
      >
        <LinearGradient
          colors={theme.gradient as any}
          style={[
            styles.nodeGradient,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Status badges */}
          {quiz.isCompleted && (
            <View 
              style={styles.completedBadge}
            >
              <Ionicons name="checkmark-circle" size={20} color={theme.badgeColor} />
            </View>
          )}
          
          {quiz.isCurrent && (
            <View 
              style={styles.currentBadge}
            >
              <Ionicons name="play-circle" size={20} color={theme.badgeColor} />
            </View>
          )}

          <View style={styles.nodeContent}>
            {/* Icon */}
            <View style={[
              styles.iconContainer,
              quiz.isCurrent && styles.currentIconContainer
            ]}>
              <Ionicons 
                name={quiz.isLocked ? 'lock-closed' : iconName as any} 
                size={quiz.isCurrent ? 32 : 28} 
                color={theme.iconColor} 
              />
            </View>

            {/* Quiz info */}
            <View style={styles.nodeInfo}>
              <Text style={[styles.nodeTitle, { color: theme.textColor }]}>
                {quiz.title}
              </Text>
              
              <View style={styles.levelRow}>
                <View style={[styles.levelBadge, { backgroundColor: theme.badgeBgColor }]}>
                  <Text style={[styles.levelText, { color: theme.badgeTextColor }]}>
                    Nivel {quiz.level}
                  </Text>
                </View>
                
                {quiz.score !== undefined && (
                  <View style={[styles.scoreBadge, { backgroundColor: theme.badgeBgColor }]}>
                    <Text style={[styles.scoreText, { color: theme.badgeTextColor }]}>
                      {quiz.score}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </LinearGradient>
      </AnimatedTouchableOpacity>
    </View>
  );
};

export const QuizRoadmap: React.FC<QuizRoadmapProps> = ({ 
  quizzes, 
  onQuizPress, 
  disciplineName 
}) => {
  const [visibleQuizzes, setVisibleQuizzes] = useState<Set<number>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Shiny effect for button
  const shinyAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Start shiny animation once with delay
    const timer = setTimeout(() => {
      Animated.timing(shinyAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start();
    }, 500); // 500ms delay before starting animation

    return () => clearTimeout(timer);
  }, [shinyAnimation]);
  
  // Animated style for shiny effect
  const shinyStyle = {
    transform: [{
      translateX: shinyAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 150],
      })
    }],
    opacity: shinyAnimation.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [0, 1, 1, 0],
    }),
  };

  // Track scroll for animations
  const scrollHandler = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Function to determine if quiz should be visible
  const isQuizVisible = (index: number) => {
    return visibleQuizzes.has(index);
  };

  // Function to add quiz to visible when scrolling
  const addVisibleQuiz = (index: number) => {
    setVisibleQuizzes(prev => new Set([...prev, index]));
  };

  const getQuizIcon = (title: string, index: number) => {
    const icons = [
      'library-outline',
      'document-text-outline',
      'school-outline',
      'time-outline',
      'book-outline',
      'newspaper-outline',
      'bulb-outline',
      'shield-checkmark-outline',
      'scale-outline',
      'hammer-outline',
      'people-outline',
      'business-outline',
      'home-outline',
      'car-outline',
      'medical-outline'
    ];
    return icons[index % icons.length] as keyof typeof Ionicons.glyphMap;
  };

  const getNodePosition = (index: number) => {
    // Balanced zigzag with even offsets from center
    const isLeft = index % 2 === 0;
    const baseOffset = width * 0.12; // Base offset 12% of screen width
    
    // Calculate safe offset considering card width and margins
    const cardWidth = width * 0.7;
    const containerPadding = spacing.xxl * 2; // Container margins
    const cardMargin = spacing.sm * 2; // Card margins
    const availableSpace = width - cardWidth - containerPadding - cardMargin;
    const maxSafeOffset = Math.max(availableSpace / 2, 20); // Minimum 20px offset
    const safeOffset = Math.min(baseOffset, maxSafeOffset);
    
    // Special handling for first card (index === 0)
    let xOffset;
    if (index === 0) {
      // First card always left, but with minimal edge offset
      xOffset = -Math.min(safeOffset, 10); // Limit offset for first card
    } else {
      // Apply offset based on position
      xOffset = isLeft ? -safeOffset : safeOffset;
    }
    
    return {
      x: xOffset,
      isLeft: isLeft
    };
  };

  const getQuizTheme = (quiz: QuizWithProgress, index: number) => {
    if (quiz.isCompleted) {
      return {
        gradient: colors.gradients.success,
        shadowColor: colors.progress.mastered,
        textColor: colors.text.onPrimary,
        iconColor: colors.text.onPrimary,
        badgeColor: colors.text.onPrimary,
        badgeBgColor: colors.ai.glass,
        badgeTextColor: colors.progress.mastered,
        statusColor: colors.progress.mastered,
        size: 1,
        pulseEffect: false,
      };
    }
    
    if (quiz.isCurrent) {
      return {
        gradient: colors.gradients.primary,
        shadowColor: colors.primary.main,
        textColor: colors.text.onPrimary,
        iconColor: colors.text.onPrimary,
        badgeColor: colors.text.onPrimary,
        badgeBgColor: colors.ai.glass,
        badgeTextColor: colors.primary.main,
        statusColor: colors.primary.main,
        size: 1.1,
        pulseEffect: true,
      };
    }

    if (quiz.isLocked) {
      return {
        gradient: colors.gradients.background,
        shadowColor: colors.primary.main,
        textColor: colors.text.onPrimary + 'CC',
        iconColor: colors.text.onPrimary + 'B3',
        badgeColor: colors.text.onPrimary + '4D',
        badgeBgColor: colors.ai.glass + '1A',
        badgeTextColor: colors.text.onPrimary + '99',
        statusColor: colors.text.onPrimary + '4D',
        size: 0.95,
        pulseEffect: false,
      };
    }

    // Available but not started
    return {
      gradient: colors.gradients.accent,
      shadowColor: colors.ai.accent,
      textColor: colors.text.onPrimary,
      iconColor: colors.text.onPrimary,
      badgeColor: colors.text.onPrimary,
      badgeBgColor: colors.ai.glass,
      badgeTextColor: colors.ai.accent,
      statusColor: colors.ai.accent,
      size: 1,
      pulseEffect: false,
    };
  };

  const createSmoothPath = (startPos: any, endPos: any, pathHeight: number) => {
    const startX = width/2 + startPos.x;
    const endX = width/2 + endPos.x;
    const midY = pathHeight / 2;
    
    // Create smooth S-curve with control points
    const controlY1 = pathHeight * 0.3;
    const controlY2 = pathHeight * 0.7;
    
    return `
      M ${startX} 0
      C ${startX} ${controlY1} ${endX} ${controlY2} ${endX} ${pathHeight}
    `;
  };

  const renderPath = (index: number) => {
    if (index === quizzes.length - 1) return null;
    
    const currentPos = getNodePosition(index);
    const nextPos = getNodePosition(index + 1);
    const pathHeight = 160; // Increase height from 120 to 160px
    
    const pathData = createSmoothPath(currentPos, nextPos, pathHeight);
    
    // Determine path color based on status
    const currentQuiz = quizzes[index];
    const nextQuiz = quizzes[index + 1];
    
    let pathColors = {
      start: colors.text.onPrimary + '66',
      end: colors.text.onPrimary + '33'
    };
    
    if (currentQuiz.isCompleted && nextQuiz.isCompleted) {
      pathColors = { start: colors.progress.mastered, end: colors.ai.accent };
    } else if (currentQuiz.isCompleted || currentQuiz.isCurrent) {
      pathColors = { start: colors.text.onPrimary, end: colors.text.onPrimary + '99' };
    }
    
    return (
      <View 
        style={[styles.pathContainer, { height: pathHeight }]}
      >
        <Svg width={width} height={pathHeight} style={styles.svgPath}>
          <Defs>
            <SvgLinearGradient id={`pathGradient${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor={pathColors.start} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={pathColors.end} stopOpacity="0.6" />
            </SvgLinearGradient>
          </Defs>
          <Path
            d={pathData}
            stroke={`url(#pathGradient${index})`}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    );
  };

  const renderQuizNode = (quiz: QuizWithProgress, index: number) => {
    const position = getNodePosition(index);
    const theme = getQuizTheme(quiz, index);
    const iconName = getQuizIcon(quiz.title, index);
    
    return (
      <QuizNode
        key={quiz.id}
        quiz={quiz}
        index={index}
        position={position}
        theme={theme}
        iconName={iconName}
        onQuizPress={onQuizPress}
        visibleQuizzes={visibleQuizzes}
        addVisibleQuiz={addVisibleQuiz}
      />
    );
  };

  const currentQuiz = quizzes.find(q => q.isCurrent);
  const completedCount = quizzes.filter(q => q.isCompleted).length;
  const progressPercentage = quizzes.length > 0 ? (completedCount / quizzes.length) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Roadmap */}
      <ScrollView
        style={styles.roadmapWrapper}
        contentContainerStyle={styles.roadmapContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        ref={scrollViewRef}
      >
        {/* Start learning button */}
        <View 
          style={styles.startButtonContainer}
        >
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => {
              const firstAvailableQuiz = quizzes.find(q => !q.isLocked);
              if (firstAvailableQuiz) {
                onQuizPress(firstAvailableQuiz.id, firstAvailableQuiz.title);
              }
            }}
          >
            <LinearGradient
              colors={colors.gradients.primary}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="play" size={24} color="white" />
              
              {/* Shiny text with gradient */}
              <View style={styles.shinyTextContainer}>
                <Text style={styles.startButtonText}>
                  Începe învățarea
                </Text>
                <Animated.View style={[styles.shinyGradientContainer, shinyStyle]}>
                  <LinearGradient
                    colors={['transparent', colors.text.onPrimary + 'CC', 'transparent']}
                    style={styles.shinyGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </Animated.View>
              </View>
              
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quizzes */}
        {quizzes.map((quiz, index) => (
          <View key={quiz.id}>
            {renderQuizNode(quiz, index)}
            {renderPath(index)}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  roadmapWrapper: {
    paddingHorizontal: spacing.xxxl, // Increase edge margins
    paddingVertical: spacing.xl,
    overflow: 'hidden',
  },
  
  roadmapContent: {
    alignItems: 'center',
  },

  startButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  startButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.medium,
  },

  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },

  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: 'white',
    fontFamily: fontConfig.heading,
  },
  
  nodeContainer: {
    marginBottom: spacing.sm, // Reduce margin from lg to sm
    paddingHorizontal: spacing.lg, // Increase from md to lg
    marginHorizontal: spacing.lg, // Increase from md to lg for bigger edge margin
    position: 'relative',
  },
  
  glowEffect: {
    position: 'absolute',
    top: -8,
    left: 8,
    right: 8,
    bottom: -8,
    borderRadius: borderRadius.xl + 8,
    zIndex: 0,
  },
  
  nodeCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.ai.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    flexShrink: 1, // Allows card to shrink if needed
  },
  
  lockedCard: {
    opacity: 0.8,
  },
  
  nodeGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.progress.mastered,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.text.onPrimary,
    zIndex: 10,
  },
  
  currentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.text.onPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
    zIndex: 10,
  },
  
  nodeContent: {
    alignItems: 'center',
  },
  
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.ai.glass,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  currentIconContainer: {
    backgroundColor: colors.ai.glass + '4D', // 30% opacity
    transform: [{ scale: 1.1 }],
  },
  
  nodeInfo: {
    alignItems: 'center',
    width: '100%',
  },
  
  nodeTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontFamily: fontConfig.heading,
    lineHeight: fontSize.md * 1.3,
  },
  
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
  },
  
  levelText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    fontFamily: fontConfig.body,
  },
  
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
  },
  
  scoreText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    fontFamily: fontConfig.body,
  },
  
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: colors.ai.glass + '4D', // 30% opacity
  },
  
  completedIndicator: {
    backgroundColor: colors.progress.mastered,
  },
  
  currentIndicator: {
    backgroundColor: colors.status.warning + '20',
  },
  
  lockedIndicator: {
    backgroundColor: colors.progress.locked,
  },
  
  pathContainer: {
    width: width,
    alignItems: 'center',
    marginBottom: spacing.xs, // Reduce margin from md to xs
  },
  
  svgPath: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  shinyTextContainer: {
    position: 'relative',
    overflow: 'hidden',
  },

  shinyGradientContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },

  shinyGradient: {
    flex: 1,
  },
}); 