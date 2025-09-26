export interface Database {
  public: {
    Tables: {
      home_discipline: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
      }
      home_quiz: {
        Row: {
          id: number
          title: string
          discipline_id: number
        }
        Insert: {
          id?: number
          title: string
          discipline_id: number
        }
        Update: {
          id?: number
          title?: string
          discipline_id?: number
        }
      }
      home_question: {
        Row: {
          id: number
          content: string
          quiz_id: number
        }
        Insert: {
          id?: number
          content: string
          quiz_id: number
        }
        Update: {
          id?: number
          content?: string
          quiz_id?: number
        }
      }
      home_answer: {
        Row: {
          id: number
          correct: boolean
          question_id: number
          content: string
        }
        Insert: {
          id?: number
          correct: boolean
          question_id: number
          content: string
        }
        Update: {
          id?: number
          correct?: boolean
          question_id?: number
          content?: string
        }
      }
      home_marks_of_user: {
        Row: {
          id: number
          score: number
          quiz_id: number
          user_id: string
          completed: boolean
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: number
          score: number
          quiz_id: number
          user_id: string
          completed?: boolean
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: number
          score?: number
          quiz_id?: number
          user_id?: string
          completed?: boolean
          updated_at?: string
          completed_at?: string | null
        }
      }
      home_userprofile: {
        Row: {
          id: number
          timezone: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: number
          timezone: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: number
          timezone?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      home_userstreak: {
        Row: {
          id: number
          current_streak: number
          longest_streak: number
          last_active_date: string
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: number
          current_streak?: number
          longest_streak?: number
          last_active_date: string
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: number
          current_streak?: number
          longest_streak?: number
          last_active_date?: string
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      home_university: {
        Row: {
          id: number
          name: string
          slug: string
          logo_path: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          logo_path?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          logo_path?: string | null
          logo_url?: string | null
          created_at?: string
        }
      }
      home_user_xp_events: {
        Row: {
          id: number
          user_id: string
          delta: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          delta: number
          reason: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          delta?: number
          reason?: string
          created_at?: string
        }
      }
    }
    Views: {
      leaderboard_users_all_time: {
        Row: {
          rank_position: number
          user_id: string
          user_name: string
          university_name: string | null
          total_xp: number
          avatar_url: string | null
        }
      }
      leaderboard_universities_all_time: {
        Row: {
          rank_position: number
          university_name: string
          total_xp: number
          students_count: number
          logo_url: string | null
        }
      }
      leaderboard_universities_week: {
        Row: {
          rank_position: number
          university_name: string
          total_xp: number
          students_count: number
          logo_url: string | null
        }
      }
      home_universities_totals: {
        Row: {
          university_name: string
          total_xp: number
          students_count: number
        }
      }
    }
    Functions: {
      set_user_university: {
        Args: {
          p_user_id: string
          p_name: string
          p_graduated?: boolean
          p_workplace?: string | null
          p_logo_path?: string | null
          p_logo_url?: string | null
        }
        Returns: void
      }
      award_xp: {
        Args: {
          p_user_id: string
          p_delta: number
          p_reason: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier use
export type Discipline = Database['public']['Tables']['home_discipline']['Row']
export type Quiz = Database['public']['Tables']['home_quiz']['Row']
export type Question = Database['public']['Tables']['home_question']['Row']
export type Answer = Database['public']['Tables']['home_answer']['Row']
export type UserProgress = Database['public']['Tables']['home_marks_of_user']['Row']
export type UserProfile = Database['public']['Tables']['home_userprofile']['Row']
export type UserStreak = Database['public']['Tables']['home_userstreak']['Row']
export type University = Database['public']['Tables']['home_university']['Row']
export type UserXpEvent = Database['public']['Tables']['home_user_xp_events']['Row']

// Leaderboard view types
export type LeaderboardUsersAllTime = Database['public']['Views']['leaderboard_users_all_time']['Row']
export type LeaderboardUniversitiesAllTime = Database['public']['Views']['leaderboard_universities_all_time']['Row']
export type LeaderboardUniversitiesWeek = Database['public']['Views']['leaderboard_universities_week']['Row']
export type UniversitiesTotals = Database['public']['Views']['home_universities_totals']['Row']

// Extended types for frontend use
export interface DisciplineWithQuizzes extends Discipline {
  quizzes: Quiz[]
}

export interface QuizWithDetails extends Quiz {
  discipline: Discipline
  questions: QuestionWithAnswers[]
}

export interface QuestionWithAnswers extends Question {
  answers: Answer[]
}

export interface QuizForTaking {
  id: number
  title: string
  discipline: Discipline
  questions: {
    id: number
    content: string
    answers: {
      id: number
      content: string
      correct: boolean
    }[]
  }[]
}

export interface QuizResult {
  id: number
  score: number
  quiz_id: number
  user_id: string
  completed: boolean
  completed_at: string | null
  correct_answers: number
  total_questions: number
  percentage: number
  wasImprovement?: boolean
  previousScore?: number
}

export interface UserStats {
  profile: UserProfile
  streak: UserStreak
  totalQuizzes: number
  completedQuizzes: number
  averageScore: number
  totalQuestions: number
  correctAnswers: number
}