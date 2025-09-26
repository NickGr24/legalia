import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { RootStackParamList } from '../utils/types';
import { t } from '../i18n';
import { useQuizzesForDiscipline } from '../hooks/useSupabaseData';
import { useUserProgress } from '../hooks/useUserProgress';
import { QuizRoadmap } from '../components/QuizRoadmap';

type DisciplineRoadmapRouteProp = RouteProp<RootStackParamList, 'DisciplineRoadmap'>;
type DisciplineRoadmapNavigationProp = StackNavigationProp<RootStackParamList, 'DisciplineRoadmap'>;

interface QuizWithProgress {
  id: number;
  title: string;
  level: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  score?: number;
}

export const DisciplineRoadmapScreen = () => {
  const navigation = useNavigation<DisciplineRoadmapNavigationProp>();
  const route = useRoute<DisciplineRoadmapRouteProp>();
  const { disciplineId, disciplineName } = route.params;
  
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const { quizzes: quizData, loading, error, refetch: reload } = useQuizzesForDiscipline(disciplineId);
  const { data: userProgressData, refreshUserProgress } = useUserProgress();
  const [quizzes, setQuizzes] = useState<QuizWithProgress[]>([]);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0
  });
  

  // Transform quiz data and load progress when quizData or userProgressData changes
  useEffect(() => {
    if (quizData.length > 0 && userProgressData) {
      transformQuizData();
    }
  }, [quizData, userProgressData]);

  // Refresh progress data when screen is focused (returning from quiz)
  useFocusEffect(
    useCallback(() => {
      refreshUserProgress();
    }, [refreshUserProgress])
  );

  const transformQuizData = () => {
    try {
      
      if (quizData.length === 0) {
        setQuizzes([]);
        setProgress({ completed: 0, total: 0, percentage: 0 });
        return;
      }

      if (!userProgressData) {
        return;
      }

      
      const quizzesWithProgress: QuizWithProgress[] = [];
      let completedCount = 0;
      
      for (let i = 0; i < quizData.length; i++) {
        const quiz = quizData[i];
        
        // Find progress for this quiz from Supabase data
        const quizProgress = userProgressData.find(p => p.quiz_id === quiz.id);
        
        let isCompleted = false;
        let isLocked = true;
        let isCurrent = false;
        
        if (i === 0) {
          // First quiz is always available
          isCompleted = quizProgress?.completed || false;
          isLocked = false;
          isCurrent = !isCompleted;
        } else {
          // Check previous quiz
          const prevQuiz = quizData[i - 1];
          const prevProgress = userProgressData.find(p => p.quiz_id === prevQuiz.id);
          
          if (prevProgress?.completed) {
            isCompleted = quizProgress?.completed || false;
            isLocked = false;
            isCurrent = !isCompleted;
          } else {
            // Previous quiz not completed, this quiz stays locked
            isCompleted = false;
            isLocked = true;
            isCurrent = false;
          }
        }
        
        if (isCompleted) {
          completedCount++;
        }
        
        const quizWithProgress = {
          id: quiz.id,
          title: quiz.title,
          level: i + 1,
          isCompleted,
          isLocked,
          isCurrent,
          score: quizProgress?.score
        };
        
        quizzesWithProgress.push(quizWithProgress);
      }
      
      setQuizzes(quizzesWithProgress);
      setProgress({
        completed: completedCount,
        total: quizData.length,
        percentage: quizData.length > 0 ? Math.round((completedCount / quizData.length) * 100) : 0
      });
      
    } catch (error) {
      console.error('❌ Error transforming quiz data:', error);
      setQuizzes([]);
      setProgress({ completed: 0, total: 0, percentage: 0 });
    }
  };

  const handleQuizPress = (quizId: number, quizTitle: string) => {
    
    try {
      navigation.navigate('QuizGame', { quizId, quizTitle });
    } catch (error) {
      console.error('❌ Quiz navigation error:', error);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleRestartCourse = () => {
    // TODO: Implement restart course functionality
  };



  if (loading) {
    return (
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <LinearGradient
                colors={colors.gradients.primary}
                style={styles.loadingIcon}
              >
                <Ionicons name="school" size={32} color={colors.text.onPrimary} />
              </LinearGradient>
              <Text style={styles.loadingText}>{t('loading_course')}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Ionicons name="warning" size={32} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={reload}
              >
                <Text style={styles.retryButtonText}>Încearcă din nou</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={colors.gradients.primary}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.titleContainer}>
                <Text style={styles.disciplineTitle}>{disciplineName}</Text>
                <Text style={styles.progressText}>
                  {progress.completed} din {progress.total} finalizate
                </Text>
              </View>
              
              <TouchableOpacity onPress={handleRestartCourse} style={styles.restartButton}>
                <Ionicons name="refresh" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarTrack}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${progress.percentage}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>{progress.percentage}%</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Roadmap Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          alwaysBounceVertical={true}
          scrollEventThrottle={16}
          decelerationRate="normal"
          snapToAlignment="start"
          keyboardShouldPersistTaps="handled"
        >
          <QuizRoadmap
            quizzes={quizzes}
            onQuizPress={handleQuizPress}
            disciplineName={disciplineName}
          />
        </ScrollView>
      </SafeAreaView>
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
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  
  loadingCard: {
    backgroundColor: colors.background.glassCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
    ...shadows.medium,
  },
  
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.text.onPrimary,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
    fontFamily: fontConfig.body,
  },
  
  content: {
    flex: 1,
  },
  
  scrollContent: {
    paddingBottom: spacing.xxxl * 2,
    flexGrow: 1,
  },
  
  header: {
    marginBottom: spacing.lg, // Уменьшаем отступ
  },
  
  headerGradient: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    marginBottom: spacing.md, // Добавляем отступ снизу
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  disciplineTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: 'white',
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  
  progressText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.2,
  },
  
  restartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.xs,
    marginRight: spacing.md,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: borderRadius.xs,
  },
  
  progressPercentage: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: 'white',
    minWidth: 40,
    textAlign: 'center',
  },

  errorText: {
    fontSize: fontSize.md,
    color: colors.status.error,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },

  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },

  retryButtonText: {
    color: 'white',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
}); 