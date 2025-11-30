import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { newTheme } from '../utils/newDesignSystem';
import { t } from '../i18n';
import { useAuth } from '../contexts/AuthContext';
import { useUserProgress } from '../hooks/useUserProgress';
import { supabaseService } from '../services/supabaseService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // Two cards per row with spacing

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  backgroundColor: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  backgroundColor,
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statCardContent}>
        <Text style={styles.statCardTitle}>{title}</Text>
        <Text style={styles.statCardValue}>{value}</Text>
        <Text style={styles.statCardSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.statCardIcon}>
        <Ionicons name={icon as any} size={48} color={newTheme.colors.text.primary} style={{ opacity: 0.3 }} />
      </View>
    </TouchableOpacity>
  );
};

interface DisciplineCardProps {
  id: number;
  name: string;
  progress: number;
  completedQuizzes: number;
  totalQuizzes: number;
  backgroundColor: string;
  icon: string;
  onPress: () => void;
}

const DisciplineCard: React.FC<DisciplineCardProps> = ({ 
  name, 
  progress, 
  completedQuizzes, 
  totalQuizzes,
  backgroundColor,
  icon,
  onPress 
}) => {
  return (
    <TouchableOpacity 
      style={styles.disciplineCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.disciplineIcon, { backgroundColor }]}>
        <Ionicons name={icon as any} size={32} color={newTheme.colors.text.primary} />
      </View>
      <View style={styles.disciplineContent}>
        <Text style={styles.disciplineName}>{name}</Text>
        <Text style={styles.disciplineProgress}>Progres: {progress}%</Text>
        <Text style={styles.disciplineStats}>{completedQuizzes}/{totalQuizzes}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const HomeScreenNew = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { data: userProgress, loading: progressLoading } = useUserProgress();
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDisciplines: 0,
    availableQuizzes: 0,
    streak: 0,
    completedQuizzes: 0,
    averageScore: 0
  });

  useEffect(() => {
    loadDisciplines();
  }, []);

  useEffect(() => {
    if (user && disciplines.length > 0 && !progressLoading) {
      loadUserData();
    }
  }, [user, disciplines, progressLoading]);

  const loadDisciplines = async () => {
    try {
      const data = await supabaseService.getAllDisciplines();
      setDisciplines(data);
    } catch (error) {
      console.error('Error loading disciplines:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load user stats
      const userStats = await supabaseService.getUserStats();
      
      // Calculate stats
      const totalQuizzes = disciplines.reduce((sum: number, d: any) => sum + (d.quizzes?.length || 0), 0);
      const completedCount = userProgress.filter((p: any) => p.completed).length;
      const avgScore = userProgress.length > 0 
        ? Math.round(userProgress.reduce((sum: number, p: any) => sum + p.score, 0) / userProgress.length)
        : 0;
      
      setStats({
        totalDisciplines: disciplines.length,
        availableQuizzes: totalQuizzes,
        streak: userStats.streak?.current_streak || 0,
        completedQuizzes: completedCount,
        averageScore: avgScore
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getDisciplineProgress = (disciplineId: number) => {
    const discipline = disciplines.find((d: any) => d.id === disciplineId);
    if (!discipline || !discipline.quizzes) return { progress: 0, completed: 0, total: 0 };
    
    const disciplineQuizIds = discipline.quizzes.map((q: any) => q.id);
    const completedQuizzes = userProgress.filter(
      (p: any) => disciplineQuizIds.includes(p.quiz_id) && p.completed
    ).length;
    
    const progress = discipline.quizzes.length > 0 
      ? Math.round((completedQuizzes / discipline.quizzes.length) * 100)
      : 0;
    
    return { 
      progress, 
      completed: completedQuizzes, 
      total: discipline.quizzes.length 
    };
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bună dimineața';
    if (hour < 18) return 'Bună ziua';
    return 'Bună seara';
  };

  const disciplineColors = [
    newTheme.colors.accents.sage,
    newTheme.colors.accents.peach,
    newTheme.colors.accents.mint,
    newTheme.colors.accents.lavender,
    newTheme.colors.accents.coral,
  ];

  const disciplineIcons = ['book', 'hammer', 'briefcase', 'document-text'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={newTheme.colors.accents.sage} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.appName}>Legalia</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Settings')}>
              <Ionicons name="settings-outline" size={24} color={newTheme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>
              {getGreeting()}! 😊
            </Text>
            {user && (
              <Text style={styles.userName}>
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'}
              </Text>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <StatCard
            title="Discipline juridice"
            value={stats.totalDisciplines}
            subtitle="Explorează diverse domenii ale dreptului"
            icon="book-outline"
            backgroundColor={newTheme.colors.background.card}
          />
          
          <StatCard
            title="Quiz-uri disponibile"
            value={stats.availableQuizzes}
            subtitle="Testează-ți cunoștințele cu noi provocări"
            icon="document-text-outline"
            backgroundColor={newTheme.colors.background.card}
            onPress={() => {}}
          />
          
          <StatCard
            title="Zile consecutive"
            value={stats.streak}
            subtitle="Menține-ți ritmul de învățare zilnic"
            icon="flame-outline"
            backgroundColor={newTheme.colors.background.card}
          />
          
          <StatCard
            title="Quiz-uri completate"
            value={`${stats.completedQuizzes}`}
            subtitle="Vezi progresul tău în timp"
            icon="checkmark-circle-outline"
            backgroundColor={newTheme.colors.background.card}
          />
        </View>

        {/* Average Score Card */}
        <View style={styles.scoreCard}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
            style={styles.scoreCardGradient}
          >
            <View style={styles.scoreCardContent}>
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreTitle}>Scor mediu (%)</Text>
                <Text style={styles.scoreValue}>{stats.averageScore}%</Text>
                <Text style={styles.scoreSubtitle}>Analizează-ți performanța generală</Text>
              </View>
              <View style={styles.scoreChart}>
                {/* Simple bar chart visualization */}
                <View style={styles.chartBars}>
                  {[65, 80, 70, 85, 75, 90, stats.averageScore].map((height, index) => (
                    <View 
                      key={index}
                      style={[
                        styles.chartBar, 
                        { 
                          height: `${height}%`,
                          backgroundColor: index === 6 ? newTheme.colors.accents.sage : newTheme.colors.text.tertiary
                        }
                      ]} 
                    />
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Disciplines Section */}
        <View style={styles.disciplinesSection}>
          <Text style={styles.sectionTitle}>Alege o disciplină</Text>
          
          {disciplines.map((discipline: any, index: number) => {
            const { progress, completed, total } = getDisciplineProgress(discipline.id);
            return (
              <DisciplineCard
                key={discipline.id}
                id={discipline.id}
                name={discipline.name}
                progress={progress}
                completedQuizzes={completed}
                totalQuizzes={total}
                backgroundColor={disciplineColors[index % disciplineColors.length]}
                icon={disciplineIcons[index % disciplineIcons.length] as any}
                onPress={() => (navigation as any).navigate('DisciplineRoadmap', { 
                  disciplineId: discipline.id,
                  disciplineName: discipline.name 
                })}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: newTheme.colors.background.primary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: newTheme.colors.background.primary,
  },
  
  scrollContent: {
    paddingBottom: 100,
  },
  
  header: {
    padding: newTheme.spacing.lg,
    paddingTop: newTheme.spacing.xs,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: newTheme.spacing.lg,
  },
  
  appName: {
    fontSize: newTheme.typography.fontSize.xl,
    fontWeight: newTheme.typography.fontWeight.bold,
    color: newTheme.colors.text.primary,
  },
  
  greeting: {
    marginBottom: newTheme.spacing.md,
  },
  
  greetingText: {
    fontSize: newTheme.typography.fontSize.xxl,
    fontWeight: newTheme.typography.fontWeight.bold,
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.xs,
  },
  
  userName: {
    fontSize: newTheme.typography.fontSize.lg,
    color: newTheme.colors.text.secondary,
  },
  
  statsSection: {
    paddingHorizontal: newTheme.spacing.lg,
    marginBottom: newTheme.spacing.lg,
  },
  
  statCard: {
    borderRadius: newTheme.borderRadius.card,
    padding: newTheme.spacing.lg,
    marginBottom: newTheme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 110,
  },
  
  statCardContent: {
    flex: 1,
  },
  
  statCardTitle: {
    fontSize: newTheme.typography.fontSize.sm,
    color: newTheme.colors.text.secondary,
    marginBottom: newTheme.spacing.xs,
  },
  
  statCardValue: {
    fontSize: newTheme.typography.fontSize.xxxl,
    fontWeight: newTheme.typography.fontWeight.bold,
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.xs,
  },
  
  statCardSubtitle: {
    fontSize: newTheme.typography.fontSize.xs,
    color: newTheme.colors.text.tertiary,
    lineHeight: 16,
  },
  
  statCardIcon: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  scoreCard: {
    paddingHorizontal: newTheme.spacing.lg,
    marginBottom: newTheme.spacing.xl,
  },
  
  scoreCardGradient: {
    borderRadius: newTheme.borderRadius.card,
    padding: newTheme.spacing.lg,
    borderWidth: 1,
    borderColor: newTheme.colors.ui.border,
  },
  
  scoreCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  scoreInfo: {
    flex: 1,
  },
  
  scoreTitle: {
    fontSize: newTheme.typography.fontSize.md,
    color: newTheme.colors.text.primary,
    fontWeight: newTheme.typography.fontWeight.semibold,
    marginBottom: newTheme.spacing.xs,
  },
  
  scoreValue: {
    fontSize: newTheme.typography.fontSize.xxxl,
    fontWeight: newTheme.typography.fontWeight.bold,
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.xs,
  },
  
  scoreSubtitle: {
    fontSize: newTheme.typography.fontSize.sm,
    color: newTheme.colors.text.secondary,
  },
  
  scoreChart: {
    width: 120,
    height: 80,
  },
  
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    gap: 4,
  },
  
  chartBar: {
    flex: 1,
    borderRadius: 2,
  },
  
  disciplinesSection: {
    paddingHorizontal: newTheme.spacing.lg,
  },
  
  sectionTitle: {
    fontSize: newTheme.typography.fontSize.xl,
    fontWeight: newTheme.typography.fontWeight.bold,
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.lg,
  },
  
  disciplineCard: {
    backgroundColor: newTheme.colors.background.card,
    borderRadius: newTheme.borderRadius.card,
    padding: newTheme.spacing.lg,
    marginBottom: newTheme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  disciplineIcon: {
    width: 64,
    height: 64,
    borderRadius: newTheme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: newTheme.spacing.md,
  },
  
  disciplineContent: {
    flex: 1,
  },
  
  disciplineName: {
    fontSize: newTheme.typography.fontSize.lg,
    fontWeight: newTheme.typography.fontWeight.semibold,
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.xxs,
  },
  
  disciplineProgress: {
    fontSize: newTheme.typography.fontSize.md,
    fontWeight: newTheme.typography.fontWeight.medium,
    color: newTheme.colors.text.primary,
    marginBottom: newTheme.spacing.xxs,
  },
  
  disciplineStats: {
    fontSize: newTheme.typography.fontSize.sm,
    color: newTheme.colors.text.tertiary,
  },
});