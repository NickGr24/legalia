import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { RootStackParamList, Achievement, AchievementUnlock } from '../utils/types';
import { achievementsService } from '../services/achievementsService';
import { AchievementPopup } from '../components/AchievementPopup';
import { supabaseService } from '../services/supabaseService';
import { t } from '../i18n';

const { width } = Dimensions.get('window');

type QuizResultRouteProp = RouteProp<RootStackParamList, 'QuizResult'>;

interface CircularProgressProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, size, strokeWidth, color }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [percentage, animatedValue]);

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Background Circle */}
      <View 
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'rgba(255, 255, 255, 0.15)',
        }}
      />
      
      {/* Animated Progress Indicator */}
      <Animated.View
        style={[
          {
            width: size - strokeWidth * 2,
            height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2,
            borderWidth: strokeWidth / 2,
            borderColor: color,
          },
          {
            opacity: animatedValue.interpolate({
              inputRange: [0, 100],
              outputRange: [0.3, 1],
              extrapolate: 'clamp',
            })
          }
        ]}
      />
    </View>
  );
};

export const QuizResultScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<QuizResultRouteProp>();
  const { score, totalQuestions, quizTitle, correctAnswers, incorrectAnswers, answeredQuestions, streakInfo } = route.params;
  
  const [animatedScore, setAnimatedScore] = useState(0);
  const [achievementUnlocks, setAchievementUnlocks] = useState<AchievementUnlock[]>([]);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const scoreAnimation = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate score counting
    Animated.timing(scoreAnimation, {
      toValue: score,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      setAnimatedScore(score);
    });

    // Celebration animation for high scores
    if (score >= 80) {
      setTimeout(() => {
        Animated.sequence([
          Animated.spring(celebrationScale, {
            toValue: 1.2,
            useNativeDriver: true,
          }),
          Animated.spring(celebrationScale, {
            toValue: 1,
            useNativeDriver: true,
          })
        ]).start();
      }, 1000);
    }

    // Check for achievement unlocks
    checkAchievements();
  }, [score, scoreAnimation, celebrationScale]);

  const checkAchievements = async () => {
    try {
      const userStats = await supabaseService.getUserStats();
      const estimatedCompletionTime = totalQuestions * 30;
      
      const quizData = {
        score,
        totalQuestions,
        correctAnswers,
        completionTime: estimatedCompletionTime
      };

      const newUnlocks = await achievementsService.checkAchievements(userStats, quizData);
      
      if (newUnlocks.length > 0) {
        setAchievementUnlocks(newUnlocks);
        setTimeout(() => {
          setCurrentAchievementIndex(0);
          setShowAchievementPopup(true);
        }, 2500);
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };

  const getScoreColor = () => {
    if (score >= 90) return colors.status.success;
    if (score >= 80) return '#10B981';
    if (score >= 70) return '#F59E0B';
    if (score >= 60) return '#EF4444';
    return colors.status.error;
  };

  const getScoreGrade = () => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    return 'F';
  };

  const getMotivationalMessage = () => {
    if (score >= 90) {
      return {
        title: t('quiz_result_exceptional'),
        subtitle: t('quiz_result_exceptional_subtitle'),
        emoji: '🏆'
      };
    }
    if (score >= 80) {
      return {
        title: t('quiz_result_excellent'),
        subtitle: t('quiz_result_excellent_subtitle'),
        emoji: '⭐'
      };
    }
    if (score >= 70) {
      return {
        title: t('quiz_result_good'),
        subtitle: t('quiz_result_good_subtitle'),
        emoji: '👍'
      };
    }
    if (score >= 60) {
      return {
        title: t('quiz_result_needs_improvement'),
        subtitle: t('quiz_result_needs_improvement_subtitle'),
        emoji: '💪'
      };
    }
    return {
      title: t('quiz_result_try_again_title'),
      subtitle: t('quiz_result_try_again_subtitle'),
      emoji: '🎯'
    };
  };

  const getScoreIcon = () => {
    if (score >= 90) return 'trophy';
    if (score >= 80) return 'medal';
    if (score >= 70) return 'ribbon';
    if (score >= 60) return 'thumbs-up';
    return 'refresh-circle';
  };

  // Fix: Ensure we're using the correct count for calculations
  const actualTotalQuestions = correctAnswers + (incorrectAnswers || (totalQuestions - correctAnswers));
  const accuracy = actualTotalQuestions > 0 ? Math.round((correctAnswers / actualTotalQuestions) * 100) : 0;
  
  // Get motivational message based on score
  const motivationalMsg = getMotivationalMessage();

  const handleBackToHome = () => {
    if (route.params.shouldRefreshHome) {
      (navigation as any).navigate('Main', { refresh: true });
    } else {
      (navigation as any).navigate('Main');
    }
  };

  const handleRetryQuiz = () => {
    navigation.goBack();
  };

  const handleViewReview = () => {
    // TODO: Navigate to detailed review screen
  };

  const handleAchievementPopupClose = () => {
    setShowAchievementPopup(false);
    
    if (achievementUnlocks[currentAchievementIndex]) {
      achievementsService.markAsNotified(achievementUnlocks[currentAchievementIndex].achievement.id);
    }
    
    const nextIndex = currentAchievementIndex + 1;
    if (nextIndex < achievementUnlocks.length) {
      setTimeout(() => {
        setCurrentAchievementIndex(nextIndex);
        setShowAchievementPopup(true);
      }, 300);
    }
  };

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity 
                onPress={handleBackToHome}
                style={styles.backButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>{t('quiz_result_title')}</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>{quizTitle}</Text>
              </View>
              
              <View style={styles.gradeContainer}>
                <Text style={styles.gradeText}>{getScoreGrade()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >

          {/* Motivational Message */}
          <View style={styles.motivationCard}>
            <View style={styles.motivationSection}>
              <Text style={styles.motivationEmoji}>{motivationalMsg.emoji}</Text>
              <Text style={styles.motivationTitle}>
                {motivationalMsg.title}
              </Text>
              <Text style={styles.motivationSubtitle}>
                {motivationalMsg.subtitle}
              </Text>
            </View>
          </View>

          {/* Detailed Statistics */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>{t('quiz_result_detailed_stats')}</Text>
            
            <View style={styles.statsGrid}>
              {/* Primary Stats */}
              <View style={styles.statsRow}>
                <View style={[styles.statCard, styles.correctCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
                  </View>
                  <Text style={styles.statNumber}>{correctAnswers}</Text>
                  <Text style={styles.statLabel}>{t('quiz_result_correct')}</Text>
                  <View style={[styles.statProgress, { backgroundColor: `${colors.status.success}20` }]}>
                    <View 
                      style={[
                        styles.statProgressFill, 
                        { 
                          width: `${(correctAnswers / actualTotalQuestions) * 100}%`,
                          backgroundColor: colors.status.success 
                        }
                      ]} 
                    />
                  </View>
                </View>

                <View style={[styles.statCard, styles.incorrectCard]}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="close-circle" size={24} color={colors.status.error} />
                  </View>
                  <Text style={styles.statNumber}>{incorrectAnswers || (actualTotalQuestions - correctAnswers)}</Text>
                  <Text style={styles.statLabel}>{t('quiz_result_incorrect')}</Text>
                  <View style={[styles.statProgress, { backgroundColor: `${colors.status.error}20` }]}>
                    <View 
                      style={[
                        styles.statProgressFill, 
                        { 
                          width: `${((incorrectAnswers || (actualTotalQuestions - correctAnswers)) / actualTotalQuestions) * 100}%`,
                          backgroundColor: colors.status.error 
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {/* Secondary Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="analytics" size={24} color={colors.primary.main} />
                  </View>
                  <Text style={styles.statNumber}>{accuracy}%</Text>
                  <Text style={styles.statLabel}>{t('quiz_result_accuracy')}</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Ionicons name="list" size={24} color={colors.ai.accent} />
                  </View>
                  <Text style={styles.statNumber}>{actualTotalQuestions}</Text>
                  <Text style={styles.statLabel}>{t('quiz_result_total_questions')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Streak Information */}
          {streakInfo && streakInfo.current_streak > 0 && (
            <View style={styles.streakSection}>
              <LinearGradient
                colors={['#FF6B35', '#F7931E']}
                style={styles.streakCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.streakContent}>
                  <View style={styles.streakIcon}>
                    <Ionicons name="flame" size={32} color="white" />
                  </View>
                  <View style={styles.streakInfo}>
                    <Text style={styles.streakTitle}>{t('quiz_result_streak_title')}</Text>
                    <Text style={styles.streakDays}>{streakInfo.current_streak} zile</Text>
                    <Text style={styles.streakSubtitle}>{t('quiz_result_streak_subtitle')}</Text>
                  </View>
                  {streakInfo.current_streak >= 7 && (
                    <View style={styles.streakBadge}>
                      <Ionicons name="trophy" size={20} color="#FFD700" />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToHome}
            >
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.buttonGradient}
              >
                <Ionicons name="home" size={20} color="white" />
                <Text style={styles.primaryButtonText}>{t('quiz_result_back_home')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRetryQuiz}
              >
                <Ionicons name="refresh" size={18} color={colors.primary.main} />
                <Text style={styles.secondaryButtonText}>{t('try_again')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleViewReview}
              >
                <Ionicons name="eye" size={18} color={colors.primary.main} />
                <Text style={styles.secondaryButtonText}>{t('quiz_result_review')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AchievementPopup
        visible={showAchievementPopup}
        achievement={achievementUnlocks[currentAchievementIndex]?.achievement || null}
        onClose={handleAchievementPopupClose}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  safeArea: {
    flex: 1,
  },
  
  header: {
    marginBottom: 0,
  },
  
  headerGradient: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  titleContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: 'white',
    fontFamily: fontConfig.heading,
    textAlign: 'center',
  },
  
  headerSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: fontConfig.body,
    textAlign: 'center',
    marginTop: 2,
  },
  
  gradeContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  gradeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: 'white',
    fontFamily: fontConfig.heading,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  scoreSection: {
    marginBottom: spacing.md,
  },
  
  scoreContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  
  scoreBackground: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  
  progressContainer: {
    marginBottom: 0,
  },
  
  circularProgress: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scoreCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scorePercentage: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.heavy,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.xs,
  },
  
  scoreIconWrapper: {
    opacity: 0.8,
  },
  
  motivationCard: {
    marginBottom: spacing.md,
    backgroundColor: colors.background.glassCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
    ...shadows.medium,
  },
  
  motivationSection: {
    alignItems: 'center',
  },
  
  motivationEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  
  motivationTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.xs,
    textAlign: 'center',
    lineHeight: 28,
  },
  
  motivationSubtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  
  statsSection: {
    marginBottom: spacing.md,
  },
  
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  
  statsGrid: {
    gap: spacing.md,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: colors.background.glassCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
    ...shadows.small,
  },
  
  correctCard: {
    borderColor: `${colors.status.success}40`,
  },
  
  incorrectCard: {
    borderColor: `${colors.status.error}40`,
  },
  
  statIconContainer: {
    marginBottom: spacing.sm,
  },
  
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.xs,
  },
  
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontFamily: fontConfig.body,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  
  statProgress: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  
  statProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  
  streakSection: {
    marginBottom: spacing.md,
  },
  
  streakCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  
  streakIcon: {
    marginRight: spacing.md,
  },
  
  streakInfo: {
    flex: 1,
  },
  
  streakTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: 'white',
    fontFamily: fontConfig.heading,
  },
  
  streakDays: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.heavy,
    color: 'white',
    fontFamily: fontConfig.heading,
    marginVertical: spacing.xs,
  },
  
  streakSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: fontConfig.body,
  },
  
  streakBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  actionsSection: {
    gap: spacing.lg,
  },
  
  primaryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  
  primaryButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: 'white',
    fontFamily: fontConfig.body,
    marginLeft: spacing.sm,
  },
  
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.glassCard,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
    ...shadows.small,
  },
  
  secondaryButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary.main,
    fontFamily: fontConfig.body,
    marginLeft: spacing.xs,
  },
});