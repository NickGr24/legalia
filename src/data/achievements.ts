import { Achievement } from '../utils/types';

export const ACHIEVEMENTS: Achievement[] = [
  // Quiz Progress Achievements
  {
    id: 'first_quiz',
    title: 'Primii Pași',
    description: 'Completează primul tău quiz în aplicație',
    category: 'quiz_progress',
    icon: '🎯',
    criteria: {
      type: 'quizzes_completed',
      target: 1
    },
    rarity: 'common',
    points: 10,
    hidden: false
  },
  {
    id: 'quiz_explorer',
    title: 'Explorator Legal',
    description: 'Completează 10 quiz-uri diferite',
    category: 'quiz_progress',
    icon: '📚',
    criteria: {
      type: 'quizzes_completed',
      target: 10
    },
    rarity: 'common',
    points: 50,
    hidden: false
  },
  {
    id: 'quiz_enthusiast',
    title: 'Entuziast Juridic',
    description: 'Completează 25 de quiz-uri',
    category: 'quiz_progress',
    icon: '⚖️',
    criteria: {
      type: 'quizzes_completed',
      target: 25
    },
    rarity: 'rare',
    points: 100,
    hidden: false
  },
  {
    id: 'quiz_expert',
    title: 'Expert în Drept',
    description: 'Completează 50 de quiz-uri',
    category: 'quiz_progress',
    icon: '🏛️',
    criteria: {
      type: 'quizzes_completed',
      target: 50
    },
    rarity: 'epic',
    points: 200,
    hidden: false
  },
  {
    id: 'quiz_master',
    title: 'Maestru Juridic',
    description: 'Completează 100 de quiz-uri',
    category: 'quiz_progress',
    icon: '👨‍⚖️',
    criteria: {
      type: 'quizzes_completed',
      target: 100
    },
    rarity: 'legendary',
    points: 500,
    hidden: false
  },

  // Perfect Scores Achievements
  {
    id: 'first_perfect',
    title: 'Scor Perfect',
    description: 'Obține primul tău scor de 100% la un quiz',
    category: 'perfect_scores',
    icon: '💯',
    criteria: {
      type: 'perfect_scores',
      target: 1
    },
    rarity: 'rare',
    points: 25,
    hidden: false
  },
  {
    id: 'perfectionist',
    title: 'Perfecționist',
    description: 'Obține 5 scoruri perfecte (100%)',
    category: 'perfect_scores',
    icon: '✨',
    criteria: {
      type: 'perfect_scores',
      target: 5
    },
    rarity: 'epic',
    points: 100,
    hidden: false
  },
  {
    id: 'flawless_master',
    title: 'Maestru Impecabil',
    description: 'Obține 10 scoruri perfecte (100%)',
    category: 'perfect_scores',
    icon: '💎',
    criteria: {
      type: 'perfect_scores',
      target: 10
    },
    rarity: 'legendary',
    points: 250,
    hidden: false
  },

  // Speed Bonus Achievements
  {
    id: 'speed_demon',
    title: 'Demon al Vitezei',
    description: 'Completează un quiz în mai puțin de 2 minute cu peste 80%',
    category: 'speed_bonuses',
    icon: '⚡',
    criteria: {
      type: 'speed_completion',
      target: 120, // seconds
      conditions: [
        { field: 'score', operator: 'gt', value: 80 }
      ]
    },
    rarity: 'epic',
    points: 150,
    hidden: false
  },
  {
    id: 'lightning_fast',
    title: 'Rapid ca Fulgerul',
    description: 'Completează un quiz în mai puțin de 1 minut cu peste 90%',
    category: 'speed_bonuses',
    icon: '⚡⚡',
    criteria: {
      type: 'speed_completion',
      target: 60, // seconds
      conditions: [
        { field: 'score', operator: 'gt', value: 90 }
      ]
    },
    rarity: 'legendary',
    points: 300,
    hidden: false
  },

  // Streak Achievements
  {
    id: 'daily_habit',
    title: 'Obicei Zilnic',
    description: 'Menține un streak de 3 zile consecutive',
    category: 'streaks',
    icon: '🔥',
    criteria: {
      type: 'consecutive_days',
      target: 3
    },
    rarity: 'common',
    points: 30,
    hidden: false
  },
  {
    id: 'week_warrior',
    title: 'Războinic Săptămânal',
    description: 'Menține un streak de 7 zile consecutive',
    category: 'streaks',
    icon: '🔥🔥',
    criteria: {
      type: 'consecutive_days',
      target: 7
    },
    rarity: 'rare',
    points: 75,
    hidden: false
  },
  {
    id: 'month_master',
    title: 'Maestru Lunar',
    description: 'Menține un streak de 30 de zile consecutive',
    category: 'streaks',
    icon: '🔥🔥🔥',
    criteria: {
      type: 'consecutive_days',
      target: 30
    },
    rarity: 'epic',
    points: 300,
    hidden: false
  },
  {
    id: 'unstoppable',
    title: 'Imparabil',
    description: 'Menține un streak de 100 de zile consecutive',
    category: 'streaks',
    icon: '🏆',
    criteria: {
      type: 'consecutive_days',
      target: 100
    },
    rarity: 'legendary',
    points: 1000,
    hidden: false
  },

  // Scoring Milestones
  {
    id: 'high_achiever',
    title: 'Performant',
    description: 'Obține un scor mediu de peste 75%',
    category: 'scoring_milestones',
    icon: '📈',
    criteria: {
      type: 'average_score',
      target: 75
    },
    rarity: 'rare',
    points: 100,
    hidden: false
  },
  {
    id: 'excellence_seeker',
    title: 'Căutător de Excelență',
    description: 'Obține un scor mediu de peste 90%',
    category: 'scoring_milestones',
    icon: '🌟',
    criteria: {
      type: 'average_score',
      target: 90
    },
    rarity: 'epic',
    points: 200,
    hidden: false
  },
  {
    id: 'score_collector',
    title: 'Colecționar de Puncte',
    description: 'Acumulează 10.000 de puncte în total',
    category: 'scoring_milestones',
    icon: '💰',
    criteria: {
      type: 'total_score',
      target: 10000
    },
    rarity: 'epic',
    points: 250,
    hidden: false
  },

  // Leaderboard Achievements
  {
    id: 'top_100',
    title: 'Top 100',
    description: 'Intră în top 100 all-time în clasament',
    category: 'leaderboard',
    icon: '🥉',
    criteria: {
      type: 'leaderboard_position',
      target: 100
    },
    rarity: 'rare',
    points: 150,
    hidden: false
  },
  {
    id: 'top_10',
    title: 'Elite Top 10',
    description: 'Intră în top 10 all-time în clasament',
    category: 'leaderboard',
    icon: '🥈',
    criteria: {
      type: 'leaderboard_position',
      target: 10
    },
    rarity: 'epic',
    points: 400,
    hidden: false
  },
  {
    id: 'champion',
    title: 'Campion',
    description: 'Ajunge pe locul 1 în clasamentul all-time',
    category: 'leaderboard',
    icon: '🥇',
    criteria: {
      type: 'leaderboard_position',
      target: 1
    },
    rarity: 'legendary',
    points: 1000,
    hidden: false
  },
  {
    id: 'weekly_winner',
    title: 'Câștigător Săptămânal',
    description: 'Câștigă clasamentul săptămânal',
    category: 'leaderboard',
    icon: '👑',
    criteria: {
      type: 'weekly_rank',
      target: 1
    },
    rarity: 'epic',
    points: 200,
    hidden: false
  }
];

// Romanian category labels for UI
export const ACHIEVEMENT_CATEGORY_LABELS: Record<string, string> = {
  quiz_progress: 'Progres Quiz',
  perfect_scores: 'Scoruri Perfecte',
  speed_bonuses: 'Bonusuri Viteză',
  streaks: 'Streak-uri',
  scoring_milestones: 'Milestone-uri Scor',
  leaderboard: 'Clasament'
};

// Romanian rarity labels for UI
export const ACHIEVEMENT_RARITY_LABELS: Record<string, string> = {
  common: 'Comun',
  rare: 'Rar',
  epic: 'Epic',
  legendary: 'Legendar'
};

// Helper function to get achievements by category
export const getAchievementsByCategory = (category: string): Achievement[] => {
  return ACHIEVEMENTS.filter(achievement => achievement.category === category);
};

// Helper function to get achievement by ID
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(achievement => achievement.id === id);
};