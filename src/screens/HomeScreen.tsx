import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { HomeScreenNavigationProp, RootStackParamList } from '../utils/types';
import { useCallback } from 'react';
import { DisciplineWithQuizzes } from '../utils/supabaseTypes';
import { useDisciplinesWithQuizzes, useSupabaseConnection } from '../hooks/useSupabaseData';
import { useAuth } from '../contexts/AuthContext';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { DisciplineCard } from '../components/DisciplineCard';
import { useUserProgressSummary, useUserProgress } from '../hooks/useUserProgress';
import { AuthDebugPanel } from '../components/AuthDebugPanel';
import { BurgerButton } from '../components/BurgerButton';

// Get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Bună dimineața! 🌅',
      icon: 'sunny',
      iconColor: '#FFD700'
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Bună ziua! ☀️',
      icon: 'sunny',
      iconColor: '#FFA500'
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: 'Bună seara! 🌆',
      icon: 'moon',
      iconColor: '#FF6B35'
    };
  } else {
    return {
      greeting: 'Noapte bună! 🌙',
      icon: 'moon',
      iconColor: colors.text.secondary
    };
  }
};

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const { user } = useAuth();
  const { handleApiError } = useErrorHandler();
  const [refreshing, setRefreshing] = useState(false);
  
  // Use the new Supabase hooks
  const { disciplines, loading, error, refetch: refetchDisciplines } = useDisciplinesWithQuizzes();
  const { connected, testConnection } = useSupabaseConnection();
  
  // Use the user progress and streak data
  const { 
    loading: progressLoading, 
    error: progressError, 
    data: userStats, 
    refreshProgressSummary: refreshProgressData 
  } = useUserProgressSummary();

  // Get individual progress data for discipline calculations
  const { 
    data: userProgressData, 
    refreshUserProgress 
  } = useUserProgress();
  
  const { greeting, icon, iconColor } = getTimeBasedGreeting();

  useEffect(() => {
    // Test Supabase connection on mount
    testConnection();
  }, [testConnection]);

  // Listen for refresh parameter and refresh data
  useFocusEffect(
    useCallback(() => {
      if (route.params?.refresh) {
        Promise.all([refetchDisciplines(), refreshProgressData(), refreshUserProgress()])
          .then(() => {
          })
          .catch((error) => {
            console.error('❌ Error refreshing home screen data:', error);
          });
        // Clear the refresh parameter to prevent continuous refreshing
        navigation.setParams({} as any);
      }
    }, [route.params?.refresh, refetchDisciplines, refreshProgressData, refreshUserProgress, navigation])
  );

  // Auto-refresh when screen is focused (returning from other screens)
  useFocusEffect(
    useCallback(() => {
      // Always refresh progress data when returning to home
      refreshUserProgress();
    }, [refreshUserProgress])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchDisciplines(), refreshProgressData(), refreshUserProgress()]);
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate completed quizzes for a discipline - memoized to prevent recalculation
  const getCompletedQuizzesForDiscipline = useCallback((discipline: DisciplineWithQuizzes) => {
    // Early return if no progress data
    if (!userProgressData) {
      return 0;
    }
    
    if (userProgressData.length === 0) {
      return 0;
    }
    
    const disciplineQuizIds = discipline.quizzes.map(q => q.id);
    const completedQuizzes = userProgressData.filter(progress => {
      const isInDiscipline = disciplineQuizIds.includes(progress.quiz_id);
      const isCompleted = progress.completed;
      
      if (isInDiscipline && isCompleted) {
      }
      
      return isInDiscipline && isCompleted;
    });
    
    
    return completedQuizzes.length;
  }, [userProgressData]);

  const handleDisciplinePress = (disciplineId: number, disciplineName: string) => {
    navigation.navigate('DisciplineRoadmap', { 
      disciplineId: disciplineId, 
      disciplineName: disciplineName 
    });
  };

  // Get statistics from the new hooks
  const totalDisciplines = disciplines.length;
  const totalQuizzes = disciplines.reduce((sum, d) => sum + d.quizzes.length, 0);
  const completedQuizzes = userStats?.completedQuizzes || 0;
  const currentStreak = userStats?.streak.current_streak || 0;
  const averageScore = userStats?.averageScore || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Burger Button */}
      <View style={styles.header}>
        <BurgerButton />
      </View>
      
      {/* Courses List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        <LinearGradient
          colors={colors.gradients.background}
          style={styles.mainGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
            <View style={styles.headerTop}>
              <Image 
                source={require('../../assets/icon.png')} 
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>{greeting}</Text>
              </View>
            </View>
            
            {user && (
              <Text style={styles.welcomeText}>
                Bine ai venit, {user.user_metadata?.full_name || 'Student'}!
              </Text>
            )}
          </Animated.View>

          {/* Stats Cards */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="school" size={24} color={colors.gold} />
                <Text style={styles.statNumber}>{totalDisciplines}</Text>
                <Text style={styles.statLabel}>Discipline juridice</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="library" size={24} color={colors.status.success} />
                <Text style={styles.statNumber}>{totalQuizzes}</Text>
                <Text style={styles.statLabel}>Quiz-uri disponibile</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="flame" size={24} color={colors.status.warning} />
                <Text style={styles.statNumber}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Zile consecutive</Text>
              </View>
              
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={24} color={colors.ai.secondary} />
                <Text style={styles.statNumber}>{completedQuizzes}</Text>
                <Text style={styles.statLabel}>Quiz-uri completate</Text>
              </View>
              
              {userStats && (
                <View style={styles.statCard}>
                  <Ionicons name="trending-up" size={24} color={colors.ai.accent} />
                  <Text style={styles.statNumber}>{Math.round(averageScore)}</Text>
                  <Text style={styles.statLabel}>Scor mediu (%)</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Content Section */}
          <Animated.View entering={FadeInDown.delay(300).duration(600)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alege o disciplină</Text>
              <Text style={styles.sectionSubtitle}>
                Continuă învățarea sau începe ceva nou
              </Text>
            </View>

            <View style={styles.coursesGrid}>
              {disciplines.map((discipline, index) => {
                const completedCount = getCompletedQuizzesForDiscipline(discipline);
                
                return (
                  <Animated.View
                    key={`${discipline.id}-${completedCount}`} // Key includes completedCount to force re-render
                    entering={FadeInDown.delay(400 + index * 100).duration(600)}
                    style={styles.courseCardWrapper}
                  >
                    <DisciplineCard
                      id={discipline.id}
                      title={discipline.name}
                      completed={completedCount}
                      total={discipline.quizzes.length}
                      onPress={handleDisciplinePress}
                      index={index}
                      isNew={index === 0} // First discipline is "new"
                      isUnlocked={true} // All disciplines are unlocked
                    />
                  </Animated.View>
                );
              })}
            </View>

            {disciplines.length === 0 && !loading && (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={64} color={colors.text.onPrimary + 'CC'} />
                <Text style={styles.emptyStateTitle}>No disciplines available</Text>
                <Text style={styles.emptyStateText}>
                  Pull down to refresh and check for available legal disciplines
                </Text>
              </View>
            )}
          </Animated.View>
          
          {/* Auth Debug Panel (disabled in production) */}
          {__DEV__ && <AuthDebugPanel />}
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'transparent',
  },
  mainGradient: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.sm,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: spacing.md,
  },
  greetingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
  },
  welcomeText: {
    fontSize: fontSize.lg,
    color: colors.text.onPrimary + 'E6', // 90% opacity
    fontFamily: fontConfig.body,
    paddingHorizontal: spacing.xl,
  },
  statsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.ai.glass,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.text.onPrimary + 'CC', // 80% opacity
    fontFamily: fontConfig.body,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    // Remove padding to allow gradient to extend full width
    paddingBottom: Platform.OS === 'android' ? 100 : 80, // Extra padding for Android gesture navigation
  },
  sectionHeader: {
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: fontSize.md,
    color: colors.text.onPrimary + 'CC',
    fontFamily: fontConfig.body,
  },
  coursesGrid: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  courseCardWrapper: {
    marginHorizontal: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyStateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.onPrimary,
    fontFamily: fontConfig.heading,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.text.onPrimary + 'CC',
    fontFamily: fontConfig.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});