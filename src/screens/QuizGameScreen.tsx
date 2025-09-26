import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../utils/colors';
import { spacing, borderRadius, fontSize, fontWeight, shadows, fontConfig } from '../utils/styles';
import { RootStackParamList, UserQuizAnswer } from '../utils/types';
import { t } from '../i18n';
import { QuizForTaking, Answer as SupabaseAnswer } from '../utils/supabaseTypes';
import { useQuizForTaking } from '../hooks/useSupabaseData';
import { useUserProgress } from '../hooks/useUserProgress';
import { soundManager, playSound } from '../services/soundManager';
import { AnswerOption } from '../components/AnswerOption';

type QuizGameRouteProp = RouteProp<RootStackParamList, 'QuizGame'>;
type QuizGameNavigationProp = StackNavigationProp<RootStackParamList, 'QuizGame'>;

interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface UserAnswer {
  questionId: number;
  answerId: number;
  isCorrect: boolean;
}

interface QuizResult {
  quizId: number;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  completedAt: Date;
  userAnswers: UserQuizAnswer[];
}

export const QuizGameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<QuizGameRouteProp>();
  const { quizId, quizTitle } = route.params;
  
  
  // Use the new quiz taking hook (authenticated endpoint) for gameplay
  const { quiz: quizGameData, loading, error } = useQuizForTaking(quizId);
  const { saveQuizProgress } = useUserProgress();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [streakInfo, setStreakInfo] = useState<any | null>(null);
  
  // Animation refs
  const questionFadeAnim = useRef(new Animated.Value(1)).current;
  const questionSlideAnim = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  
  const backHandlerRef = useRef<any>(null);

  useEffect(() => {
    setupBackHandler();
    initializeSounds();
    
    return () => {
      if (backHandlerRef.current) {
        backHandlerRef.current.remove();
      }
      soundManager.cleanup();
    };
  }, []);

  // Transform quiz data when available
  useEffect(() => {
    if (quizGameData) {
      if (quizGameData.questions && quizGameData.questions.length > 0) {
        transformQuizData();
      } else {
        setQuestions([]);
      }
    }
  }, [quizGameData]);

  const initializeSounds = async () => {
    try {
      await soundManager.initialize();
    } catch (error) {
      console.error('❌ Failed to initialize sounds:', error);
    }
  };

  useEffect(() => {
    // Only animate when questions are loaded
    if (questions.length > 0 && !loading) {
      animateQuestionTransition();
    }
  }, [currentQuestionIndex]);

  const animateQuestionTransition = () => {
    // Reset animations
    questionFadeAnim.setValue(0);
    questionSlideAnim.setValue(50);
    
    // Animate in new question
    Animated.parallel([
      Animated.timing(questionFadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(questionSlideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Remove the problematic back handler useEffect since setupBackHandler is called in first useEffect

  const setupBackHandler = () => {
    // Removed BackHandler implementation
  };


  const transformQuizData = () => {
    try {
      if (!quizGameData || !quizGameData.questions || !Array.isArray(quizGameData.questions) || quizGameData.questions.length === 0) {
        return;
      }
      
      
      const formattedQuestions: Question[] = quizGameData.questions
        .filter((q: any) => q && q.id && (q.content || q.text || q.question)) // Filter out invalid questions
        .map((q: any, index: number) => {
          // Handle both formats: q.content (from /take/) and q.text (from other endpoints)
          const questionText = q.content || q.text || q.question || 'Question text not available';
          
          if (!q.answers || !Array.isArray(q.answers)) {
            console.warn(`⚠️ Question ${q.id} has no valid answers array`);
            return null;
          }
          
          
          return {
            id: q.id,
            text: questionText,
            answers: q.answers
              .filter((a: any) => a && a.id) // Filter out invalid answers
              .map((a: any) => {
                // Handle both formats: a.content (from /take/) and a.text (from other endpoints)
                const answerText = a.content || a.text || a.answer || a.option || 'Answer text not available';
                
                // Include correct answers for instant feedback
                return {
                  id: a.id,
                  text: answerText,
                  isCorrect: a.correct || false // Now we have correct answers from Supabase
                };
              })
          };
        })
        .filter((q: any) => q !== null) as Question[]; // Remove null entries
      
      setQuestions(formattedQuestions);
      
    } catch (error) {
      console.error('❌ Error transforming quiz data:', error);
      Alert.alert('Eroare', 'Nu s-au putut procesa întrebările.');
    }
  };

  const handleAnswer = (answerId: number) => {
    
    // Prevent multiple simultaneous answers
    if (isAnswering) {
      return;
    }
    
    // Mandatory answering - answerId must be provided
    if (!answerId) {
      return;
    }
    
    setIsAnswering(true);

    const currentQuestion = questions[currentQuestionIndex];
    
    const selectedAnswer = currentQuestion.answers.find(a => a.id === answerId);
    
    
    // Now we can determine if it's correct immediately for instant feedback
    const isCorrect = selectedAnswer?.isCorrect || false;
    
    
    // Play appropriate sound for feedback
    if (isCorrect) {
      playSound('win'); // Play win sound for correct answers
    } else {
      playSound('select'); // Play select sound for incorrect answers
    }
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      answerId: answerId,
      isCorrect
    };
    
    setUserAnswers(prev => {
      const updated = [...prev, newAnswer];
      return updated;
    });
    
    setSelectedAnswerId(answerId);
    setShowAnswerFeedback(true); // Enable immediate visual feedback
    
    // Longer delay to show feedback (correct/incorrect), then proceed
    setTimeout(() => {
      
      if (currentQuestionIndex < questions.length - 1) {
        // Play transition sound and animate out
        playSound('transition');
        animateQuestionOut(() => {
          setSelectedAnswerId(null);
          setShowAnswerFeedback(false); // Reset feedback for next question
          setIsAnswering(false);
          setCurrentQuestionIndex(prev => prev + 1);
        });
      } else {
        playSound('win');
        animateCelebration();
        setTimeout(() => {
          handleQuizComplete();
        }, 1500);
      }
    }, 2000); // Increased to 2 seconds for better feedback visibility
  };

  const animateQuestionOut = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(questionFadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(questionSlideAnim, {
        toValue: -50,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
    });
  };

  const animateCelebration = () => {
    celebrationScale.setValue(0);
    Animated.sequence([
      Animated.timing(celebrationScale, {
        toValue: 1.2,
        duration: 300,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
      Animated.timing(celebrationScale, {
        toValue: 1,
        duration: 200,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleQuizComplete = async () => {
    try {
      
      // Convert answers to the format expected by the API: {"question_id": answer_id}
      const answersDict: { [key: string]: number } = {};
      userAnswers.forEach(a => {
        answersDict[a.questionId.toString()] = a.answerId;
      });
      
      
      // Calculate score locally first
      const correctAnswersCount = userAnswers.filter(answer => answer.isCorrect).length;
      const incorrectAnswersCount = userAnswers.filter(answer => !answer.isCorrect).length;
      const answeredQuestionsCount = userAnswers.length; // Only questions that were actually answered
      // Use actual questions count for scoring calculation
      const totalQuestionsCount = questions.length;
      const finalScore = Math.round((correctAnswersCount / totalQuestionsCount) * 100);
      let backendResult = null;
      
      try {
        
        
        backendResult = await saveQuizProgress(quizId, finalScore, correctAnswersCount, totalQuestionsCount);
        
        
        // Check if this was an improvement or not
        // Removed popup for non-improvement results
        
      } catch (supabaseError: any) {
        console.error('❌ Supabase submission failed:', supabaseError);
        
        // Handle specific error cases
        if (supabaseError.message?.includes('Please wait before taking')) {
          Alert.alert(
            'Prea repede!',
            'Te rugăm să aștepți cel puțin 30 de secunde între încercări.',
            [{ text: 'OK' }]
          );
          return; // Don't navigate to results
        } else if (supabaseError.message?.includes('Invalid')) {
          Alert.alert(
            'Eroare de validare',
            'Datele trimise nu sunt valide. Te rugăm să încerci din nou.',
            [{ text: 'OK' }]
          );
          return; // Don't navigate to results
        }
        
        // Keep the locally calculated score for other errors
        
        // Show user a message that submission failed
        Alert.alert(
          'Eroare la transmitere',
          'Nu s-au putut transmite răspunsurile. Încearcă din nou mai târziu.',
          [{ text: 'OK' }]
        );
      }
      
      setScore(finalScore);
      
      // Progress and streaks are automatically handled by submitQuizResult
      
      (navigation as any).navigate('QuizResult', {
        score: finalScore,
        totalQuestions: totalQuestionsCount,
        quizTitle,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: incorrectAnswersCount,
        answeredQuestions: answeredQuestionsCount,
        streakInfo: streakInfo,
        shouldRefreshHome: true, // Add flag to refresh home screen
        wasImprovement: backendResult?.wasImprovement,
        previousScore: backendResult?.previousScore,
      });
    } catch (error) {
      console.error('❌ Error in handleQuizComplete:', error);
      
      // Fallback: show some result even if submission fails
      const fallbackScore = 50;
      const fallbackCorrect = Math.round(questions.length * 0.5);
      const fallbackIncorrect = Math.round(questions.length * 0.5);
      (navigation as any).navigate('QuizResult', {
        score: fallbackScore,
        totalQuestions: questions.length,
        quizTitle,
        correctAnswers: fallbackCorrect,
        incorrectAnswers: fallbackIncorrect,
        answeredQuestions: questions.length,
      });
    }
  };

  const getCurrentQuestion = () => {
    return questions[currentQuestionIndex];
  };

  const isAnswerCorrect = (answerId: number): boolean => {
    // Find the correct answer for instant feedback
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return false;
    
    const answer = currentQuestion.answers.find(a => a.id === answerId);
    return answer?.isCorrect || false;
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
                <Ionicons name="bulb-outline" size={32} color={colors.text.onPrimary} />
              </LinearGradient>
              <Text style={styles.loadingText}>{t('loading_questions')}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error || !quizGameData) {
    return (
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Ionicons name="warning" size={32} color={colors.status.error} />
              <Text style={styles.errorText}>
                {error || 'Quiz nu a fost găsit'}
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.retryButtonText}>{t('btn_back')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Check if quiz has no questions
  if (questions.length === 0) {
    return (
      <LinearGradient
        colors={colors.gradients.background}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCard}>
              <Ionicons name="help-circle" size={32} color={colors.status.warning} />
              <Text style={styles.errorText}>
                Acest quiz nu conține încă întrebări
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.retryButtonText}>{t('btn_back')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentQuestion = getCurrentQuestion();

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
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBarTrack}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }
                    ]}
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Question Content */}
        <View style={styles.content}>
          <Animated.View 
            style={[
              styles.questionContainer,
              {
                opacity: questionFadeAnim,
                transform: [{ translateY: questionSlideAnim }],
              },
            ]}
          >
            <View style={styles.questionCard}>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
            </View>
          </Animated.View>

          {/* Answers */}
          <Animated.View 
            style={[
              styles.answersContainer,
              {
                opacity: questionFadeAnim,
                transform: [{ translateY: questionSlideAnim }],
              },
            ]}
          >
            <ScrollView 
              style={styles.answersScrollView}
              contentContainerStyle={styles.answersScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {currentQuestion.answers.map((answer, index) => (
                <AnswerOption
                  key={answer.id}
                  id={answer.id}
                  text={answer.text}
                  isSelected={selectedAnswerId === answer.id}
                  isCorrect={isAnswerCorrect(answer.id)}
                  showResult={showAnswerFeedback} // Show feedback immediately after selection
                  onPress={isAnswering ? () => {} : () => handleAnswer(answer.id)}
                />
              ))}
            </ScrollView>
          </Animated.View>

          {/* Celebration Animation Overlay - Removed */}
        </View>
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
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
    letterSpacing: 0.3,
    fontFamily: fontConfig.body,
  },
  
  header: {
    marginBottom: spacing.md, // Уменьшаем отступ
  },
  
  headerGradient: {
    paddingTop: spacing.md,
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
  
  progressContainer: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginLeft: spacing.lg,
  },
  
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
  },
  
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: borderRadius.xs,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  
  questionContainer: {
    marginBottom: spacing.lg, // Уменьшаем отступ
  },
  
  questionCard: {
    backgroundColor: colors.background.glassCard,
    borderRadius: borderRadius.xl,
    padding: spacing.lg, // Уменьшаем padding
    borderWidth: 1,
    borderColor: colors.ai.glassBorder,
    ...shadows.medium,
  },
  
  questionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    lineHeight: fontSize.lg * 1.3, // Уменьшаем line height
    letterSpacing: 0.1,
    fontFamily: fontConfig.body,
  },
  
  answersContainer: {
    flex: 1, // Занимает оставшееся пространство
  },
  
  answersScrollView: {
    flex: 1,
  },
  
  answersScrollContent: {
    paddingBottom: spacing.lg,
    gap: spacing.sm, // Gap between answer options
  },
  
  celebrationOverlay: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    marginLeft: -100,
    marginTop: -75,
    zIndex: 1000,
  },
  
  celebrationCard: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
  
  celebrationText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: 'white',
    marginTop: spacing.sm,
    fontFamily: fontConfig.heading,
    textAlign: 'center',
  },

  errorText: {
    fontSize: fontSize.md,
    color: colors.status.error,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    fontFamily: fontConfig.body,
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
    fontFamily: fontConfig.body,
  },
}); 