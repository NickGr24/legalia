import { useState, useEffect, useCallback } from 'react'
import { supabaseService } from '@/services/supabaseService'
import {
  Discipline,
  Quiz,
  QuizWithDetails,
  DisciplineWithQuizzes,
  QuizForTaking,
  UserProgress,
  UserStats,
  QuizResult,
} from '@/utils/supabaseTypes'

// Hook for fetching all disciplines
export function useDisciplines() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDisciplines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getAllDisciplines()
      setDisciplines(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disciplines')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisciplines()
  }, [fetchDisciplines])

  return { disciplines, loading, error, refetch: fetchDisciplines }
}

// Hook for fetching disciplines with their quizzes
export function useDisciplinesWithQuizzes() {
  const [disciplines, setDisciplines] = useState<DisciplineWithQuizzes[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDisciplines = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getDisciplinesWithQuizzes()
      setDisciplines(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch disciplines with quizzes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDisciplines()
  }, [fetchDisciplines])

  return { disciplines, loading, error, refetch: fetchDisciplines }
}

// Hook for fetching quizzes for a specific discipline
export function useQuizzesForDiscipline(disciplineId: number | null) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuizzes = useCallback(async () => {
    if (!disciplineId) return

    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getQuizzesForDiscipline(disciplineId)
      setQuizzes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes')
    } finally {
      setLoading(false)
    }
  }, [disciplineId])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  return { quizzes, loading, error, refetch: fetchQuizzes }
}

// Hook for fetching a quiz for taking (without correct answers)
export function useQuizForTaking(quizId: number | null) {
  const [quiz, setQuiz] = useState<QuizForTaking | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuiz = useCallback(async () => {
    if (!quizId) return

    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getQuizForTaking(quizId)
      setQuiz(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz')
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  return { quiz, loading, error, refetch: fetchQuiz }
}

// Hook for fetching a quiz with all details (including correct answers)
export function useQuizWithDetails(quizId: number | null) {
  const [quiz, setQuiz] = useState<QuizWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuiz = useCallback(async () => {
    if (!quizId) return

    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getQuizWithDetails(quizId)
      setQuiz(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz details')
    } finally {
      setLoading(false)
    }
  }, [quizId])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  return { quiz, loading, error, refetch: fetchQuiz }
}

// Note: useUserProgress is now in useUserProgress.ts to avoid duplication

// Hook for user statistics
export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getUserStats()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

// Hook for all quiz data (for development/testing)
export function useAllQuizData() {
  const [quizzes, setQuizzes] = useState<QuizWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await supabaseService.getAllQuizData()
      setQuizzes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all quiz data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuizzes()
  }, [fetchQuizzes])

  return { quizzes, loading, error, refetch: fetchQuizzes }
}

// Hook for testing Supabase connection
export function useSupabaseConnection() {
  const [connected, setConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  const testConnection = useCallback(async () => {
    try {
      setLoading(true)
      const isConnected = await supabaseService.testConnection()
      setConnected(isConnected)
    } catch (err) {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    testConnection()
  }, [testConnection])

  return { connected, loading, testConnection }
}