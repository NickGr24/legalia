import { supabase } from './supabaseClient'
import {
  Database,
  Discipline,
  Quiz,
  Question,
  Answer,
  UserProgress,
  UserProfile,
  UserStreak,
  DisciplineWithQuizzes,
  QuizWithDetails,
  QuestionWithAnswers,
  QuizForTaking,
  QuizResult,
  UserStats,
} from '../utils/supabaseTypes'
import { calculateQuizScore, calculateLevel } from './scoringService'
import { 
  calculateStreakInfo, 
  getChisinauDateString,
  getChisinauWeekStart,
  getChisinauWeekEnd
} from './timezoneService'
import { idempotencyService } from './idempotencyService'
import { logger } from '../utils/logger'

class SupabaseService {
  // ==========================================
  // Authentication Helper
  // ==========================================
  
  private async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }

  private async requireAuth() {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('User not authenticated')
    return user
  }

  // ==========================================
  // Public Quiz Data (No Auth Required)
  // ==========================================

  async getAllDisciplines(): Promise<Discipline[]> {
    const { data, error } = await supabase
      .from('home_discipline')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }

  async getDisciplineWithQuizzes(disciplineId: number): Promise<DisciplineWithQuizzes | null> {
    const { data: discipline, error: disciplineError } = await supabase
      .from('home_discipline')
      .select(`
        *,
        quizzes:home_quiz(*)
      `)
      .eq('id', disciplineId)
      .single()

    if (disciplineError) throw disciplineError
    return discipline as DisciplineWithQuizzes
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('home_quiz')
      .select('*')
      .order('id')

    if (error) throw error
    return data
  }

  async getQuizzesForDiscipline(disciplineId: number): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('home_quiz')
      .select('*')
      .eq('discipline_id', disciplineId)
      .order('id')

    if (error) throw error
    return data
  }

  async getQuizForTaking(quizId: number): Promise<QuizForTaking> {
    const { data: quiz, error: quizError } = await supabase
      .from('home_quiz')
      .select(`
        *,
        discipline:home_discipline(*),
        questions:home_question(
          *,
          answers:home_answer(id, content, correct)
        )
      `)
      .eq('id', quizId)
      .single()

    if (quizError) throw quizError

    // Transform to QuizForTaking format (with correct answers for instant feedback)
    return {
      id: (quiz as any).id,
      title: (quiz as any).title,
      discipline: (quiz as any).discipline,
      questions: (quiz as any).questions.map((q: any) => ({
        id: q.id,
        content: q.content,
        answers: q.answers.map((a: any) => ({
          id: a.id,
          content: a.content,
          correct: a.correct,
        })),
      })),
    }
  }

  async getQuizWithDetails(quizId: number): Promise<QuizWithDetails | null> {
    const { data: quiz, error } = await supabase
      .from('home_quiz')
      .select(`
        *,
        discipline:home_discipline(*),
        questions:home_question(
          *,
          answers:home_answer(*)
        )
      `)
      .eq('id', quizId)
      .single()

    if (error) throw error
    return quiz as QuizWithDetails
  }

  // ==========================================
  // User Progress & Results (Auth Required)
  // ==========================================

  async submitQuizResult(
    quizId: number,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpentSeconds: number = 0
  ): Promise<QuizResult> {
    const user = await this.requireAuth()
    
    // Create idempotency key for this submission
    const idempotencyKey = idempotencyService.generateKey(
      user.id,
      'quiz_submit',
      quizId,
      correctAnswers,
      totalQuestions
    )
    
    // Execute with idempotency protection
    return idempotencyService.executeWithIdempotency(idempotencyKey, async () => {
      return this._submitQuizResultInternal(
        user.id,
        quizId,
        score,
        correctAnswers,
        totalQuestions,
        timeSpentSeconds
      )
    })
  }
  
  private async _submitQuizResultInternal(
    userId: string,
    quizId: number,
    score: number,
    correctAnswers: number,
    totalQuestions: number,
    timeSpentSeconds: number = 0
  ): Promise<QuizResult> {
    
    // Anti-cheating validations
    if (correctAnswers < 0 || correctAnswers > totalQuestions) {
      logger.error('Invalid quiz submission', { correctAnswers, totalQuestions, userId })
      throw new Error('Invalid number of correct answers')
    }
    
    if (totalQuestions <= 0 || totalQuestions > 50) { // Reasonable max questions per quiz
      logger.error('Invalid questions count', { totalQuestions, userId })
      throw new Error('Invalid total questions count')
    }
    
    // Verify the quiz actually exists and get its question count
    const quizData = await this.getQuizWithDetails(quizId)
    if (!quizData) {
      throw new Error('Quiz not found')
    }
    
    // Verify question count matches
    const actualQuestionCount = quizData.questions?.length || 0
    if (totalQuestions !== actualQuestionCount) {
      console.warn(`⚠️ Question count mismatch: submitted ${totalQuestions}, actual ${actualQuestionCount}`)
      // Use actual count to prevent manipulation
      totalQuestions = actualQuestionCount
      correctAnswers = Math.min(correctAnswers, totalQuestions)
    }
    
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    const currentlyPassed = percentage >= 70 // 70% threshold for completion
    
    // First, check if user has already taken this quiz
    const existingAttempt = await this.getUserProgressForQuiz(quizId, userId)
    
    // Determine if this is a better attempt
    let shouldUpdate = true
    let isImprovement = false
    
    if (existingAttempt) {
      // Only update if the new score is better
      if (percentage <= existingAttempt.score) {
        shouldUpdate = false
        
        // Return the existing result instead of updating
        return {
          ...existingAttempt,
          correct_answers: Math.round((existingAttempt.score / 100) * totalQuestions),
          total_questions: totalQuestions,
          percentage: existingAttempt.score,
          wasImprovement: false,
          previousScore: existingAttempt.score,
        }
      } else {
        isImprovement = true
      }
    } else {
    }

    if (!shouldUpdate) {
      // This should not happen due to the logic above, but keeping for safety
      throw new Error('No improvement in score')
    }

    // Rate limiting check - prevent too frequent submissions
    if (existingAttempt) {
      const lastAttempt = new Date(existingAttempt.updated_at || existingAttempt.completed_at || '2000-01-01')
      const now = new Date()
      const timeDiff = now.getTime() - lastAttempt.getTime()
      const minDelay = 30 * 1000 // 30 seconds minimum between attempts
      
      if (timeDiff < minDelay) {
        throw new Error('Please wait before taking the quiz again')
      }
    }

    // Determine final completed status
    // Once a quiz is completed (passed with ≥70%), it should stay completed
    // even if user later gets a worse score
    const finalCompleted = existingAttempt ? 
      (existingAttempt.completed || currentlyPassed) : 
      currentlyPassed
    
    // Update only if score is better (or first attempt)
    const { data, error } = await supabase
      .from('home_marks_of_user')
      .upsert({
        user_id: userId,
        quiz_id: quizId,
        score: percentage,
        completed: finalCompleted,
        completed_at: finalCompleted ? (existingAttempt?.completed_at || new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) throw error

    // Update user streak only if quiz was completed AND this is an improvement (or first attempt)
    if (currentlyPassed && (isImprovement || !existingAttempt)) {
      // Need to update streak for specific user
      const currentStreak = await this.getUserStreak(userId)
      const streakInfo = calculateStreakInfo(
        currentStreak?.last_active_date || null,
        currentStreak?.current_streak || 0
      )
      
      if (streakInfo.shouldIncrementStreak || streakInfo.shouldResetStreak) {
        await this._updateUserStreakForUser(userId, streakInfo)
      }
    }

    return {
      ...(data as any),
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      percentage,
      wasImprovement: isImprovement,
      previousScore: existingAttempt?.score || 0,
    }
  }

  async getUserProgress(userId?: string): Promise<UserProgress[]> {
    const user = userId ? { id: userId } : await this.requireAuth()
    
    const { data, error } = await supabase
      .from('home_marks_of_user')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getUserProgressForQuiz(quizId: number, userId?: string): Promise<UserProgress | null> {
    const user = userId ? { id: userId } : await this.requireAuth()
    
    const { data, error } = await supabase
      .from('home_marks_of_user')
      .select('*')
      .eq('user_id', user.id)
      .eq('quiz_id', quizId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
  }

  // ==========================================
  // User Profile Management
  // ==========================================

  async createUserProfile(timezone: string = 'UTC'): Promise<UserProfile> {
    const user = await this.requireAuth()
    
    const { data, error } = await supabase
      .from('home_userprofile')
      .upsert({
        user_id: user.id,
        timezone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    const user = userId ? { id: userId } : await this.requireAuth()
    
    const { data, error } = await supabase
      .from('home_userprofile')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const user = await this.requireAuth()
    
    const { data, error } = await (supabase as any)
      .from('home_userprofile')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // ==========================================
  // User Streaks Management
  // ==========================================

  async getUserStreak(userId?: string): Promise<UserStreak | null> {
    const user = userId ? { id: userId } : await this.requireAuth()
    
    const { data, error } = await supabase
      .from('home_userstreak')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateUserStreak(): Promise<UserStreak> {
    const user = await this.requireAuth()
    
    // Get current streak data
    const currentStreak = await this.getUserStreak()
    
    // Use timezone-aware streak calculation
    const streakInfo = calculateStreakInfo(
      currentStreak?.last_active_date || null,
      currentStreak?.current_streak || 0
    )
    
    if (!currentStreak) {
      // Create new streak record with Europe/Chisinau timezone
      const { data, error } = await supabase
        .from('home_userstreak')
        .insert({
          user_id: user.id,
          current_streak: streakInfo.currentStreak,
          longest_streak: streakInfo.currentStreak,
          last_active_date: streakInfo.todayDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single()

      if (error) {
        logger.error('Failed to create user streak', { error, userId: user.id })
        throw error
      }
      
      logger.info('Created new streak record', { userId: user.id, streak: streakInfo.currentStreak })
      return data
    }

    // Check if we need to update the streak
    if (!streakInfo.shouldIncrementStreak && !streakInfo.shouldResetStreak) {
      // Same day activity - no change to streak
      logger.debug('Streak unchanged - same day activity', { userId: user.id })
      return currentStreak
    }

    let newCurrentStreak = streakInfo.currentStreak
    let newLongestStreak = Math.max(currentStreak.longest_streak, newCurrentStreak)

    const { data, error } = await (supabase as any)
      .from('home_userstreak')
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_active_date: streakInfo.todayDate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update user streak', { error, userId: user.id })
      throw error
    }
    
    logger.info('Updated user streak', { 
      userId: user.id, 
      previousStreak: currentStreak.current_streak,
      newStreak: newCurrentStreak,
      wasReset: streakInfo.shouldResetStreak 
    })
    
    return data
  }
  
  // Helper method for updating streak for a specific user
  private async _updateUserStreakForUser(userId: string, streakInfo: any): Promise<void> {
    const { data, error } = await (supabase as any)
      .from('home_userstreak')
      .upsert({
        user_id: userId,
        current_streak: streakInfo.currentStreak,
        longest_streak: streakInfo.currentStreak,
        last_active_date: streakInfo.todayDate,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
    
    if (error) {
      logger.error('Failed to update user streak', { error, userId })
    }
  }

  // ==========================================
  // User Statistics
  // ==========================================

  async getUserStats(userId?: string): Promise<UserStats> {
    const user = userId ? { id: userId } : await this.requireAuth()
    
    // Get profile and streak
    const [profile, streak, progress] = await Promise.all([
      this.getUserProfile(user.id),
      this.getUserStreak(user.id),
      this.getUserProgress(user.id),
    ])

    // Calculate statistics
    const completedQuizzes = progress.filter(p => p.completed).length
    const totalQuizzes = progress.length
    const averageScore = totalQuizzes > 0 
      ? progress.reduce((sum, p) => sum + p.score, 0) / totalQuizzes 
      : 0

    // Get question counts (approximate from quiz progress)
    const totalQuestions = progress.length * 10 // Approximate 10 questions per quiz
    const correctAnswers = Math.round(progress.reduce((sum, p) => sum + (p.score * 10 / 100), 0))

    return {
      profile: profile || {
        id: 0,
        timezone: 'UTC',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      },
      streak: streak || {
        id: 0,
        current_streak: 0,
        longest_streak: 0,
        last_active_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id,
      },
      totalQuizzes,
      completedQuizzes,
      averageScore,
      totalQuestions,
      correctAnswers,
    }
  }

  // ==========================================
  // Combined Data Fetchers
  // ==========================================

  async getAllQuizData(): Promise<QuizWithDetails[]> {
    const { data: quizzes, error } = await supabase
      .from('home_quiz')
      .select(`
        *,
        discipline:home_discipline(*),
        questions:home_question(
          *,
          answers:home_answer(*)
        )
      `)
      .order('id')

    if (error) throw error
    return quizzes as QuizWithDetails[]
  }

  async getDisciplinesWithQuizzes(): Promise<DisciplineWithQuizzes[]> {
    const { data: disciplines, error } = await supabase
      .from('home_discipline')
      .select(`
        *,
        quizzes:home_quiz(*)
      `)
      .order('name')

    if (error) throw error
    return disciplines as DisciplineWithQuizzes[]
  }

  // ==========================================
  // Authentication Methods
  // ==========================================

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    
    // Create user profile after successful signup
    if (data.user) {
      await this.createUserProfile()
    }
    
    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    
    // Ensure user profile exists
    if (data.user) {
      const profile = await this.getUserProfile(data.user.id)
      if (!profile) {
        await this.createUserProfile()
      }
    }
    
    return data
  }

  async signInWithGoogle(idToken: string, nonce?: string) {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
      nonce: nonce,
    })
    
    if (error) throw error
    
    // Ensure user profile exists
    if (data.user) {
      const profile = await this.getUserProfile(data.user.id)
      if (!profile) {
        await this.createUserProfile()
      }
    }
    
    return data
  }

  async signInWithOAuth(provider: 'google', redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectTo, // Use the provided redirect URI or let Supabase handle it
      }
    })
    
    if (error) throw error
    
    // signInWithOAuth just initiates the flow, doesn't return user data
    // The actual authentication happens via callback and auth state changes
    return { data, error: null }
  }

  async getOAuthUrl(provider: 'google', redirectTo: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: redirectTo,
      }
    })
    
    if (error) throw error
    return { data, error: null }
  }

  async setSessionFromTokens(accessToken: string, refreshToken?: string | null) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || '',
    })
    
    if (error) throw error
    
    // Ensure user profile exists
    if (data.user) {
      const profile = await this.getUserProfile(data.user.id)
      if (!profile) {
        await this.createUserProfile()
      }
    }
    
    return data
  }

  async exchangeCodeForSession(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) throw error
    
    // Ensure user profile exists
    if (data.user) {
      const profile = await this.getUserProfile(data.user.id)
      if (!profile) {
        await this.createUserProfile()
      }
    }
    
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  // ==========================================
  // Utility Methods
  // ==========================================

  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('home_discipline')
        .select('id')
        .limit(1)
      
      return !error
    } catch {
      return false
    }
  }
}

export const supabaseService = new SupabaseService()
export default supabaseService