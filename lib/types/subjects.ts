// =====================================================
// UIL ACADEMY - MULTI-SUBJECT TYPE DEFINITIONS
// =====================================================

export interface Subject {
  id: string
  name: string
  display_name: string
  description: string | null
  icon_name: string | null
  color_theme: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SubjectResource {
  id: string
  subject_id: string
  title: string
  description: string | null
  resource_type: 'glossary' | 'formula_sheet' | 'reference_guide' | 'practice_guide'
  content: string | null
  file_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EnhancedLearningPath {
  id: string
  subject_id: string
  name: string
  description: string | null
  estimated_hours: number
  difficulty_level: number
  prerequisites: string[] | null
  learning_objectives: string[] | null
  tags: string[] | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  subject?: Subject
}

export interface EnhancedQuestion {
  id: string
  module_id: string
  question_text: string
  question_type: QuestionType
  correct_answer: string | null
  explanation: string | null
  order_index: number
  points: number
  media_type: MediaType | null
  media_url: string | null
  media_metadata: Record<string, any> | null
  time_limit_seconds: number | null
  difficulty_level: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type QuestionType = 
  | 'multiple_choice'
  | 'written_response'
  | 'code_completion'
  | 'short_answer'
  | 'essay'
  | 'dictation'
  | 'calculation'
  | 'formula_derivation'
  | 'text_analysis'
  | 'matching'
  | 'true_false'
  | 'fill_in_blank'

export type MediaType = 'text' | 'image' | 'audio' | 'video' | 'latex'

export interface PracticeTest {
  id: string
  subject_id: string
  title: string
  description: string | null
  test_type: 'practice' | 'mock_exam' | 'diagnostic' | 'review'
  time_limit_minutes: number | null
  total_points: number
  difficulty_level: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Relations
  subject?: Subject
  questions?: PracticeTestQuestion[]
}

export interface PracticeTestQuestion {
  id: string
  practice_test_id: string
  question_id: string
  order_index: number
  points: number
  created_at: string
  // Relations
  question?: EnhancedQuestion
}

export interface UserPracticeTestAttempt {
  id: string
  user_id: string
  practice_test_id: string
  started_at: string
  completed_at: string | null
  total_score: number
  max_possible_score: number
  time_taken_seconds: number | null
  is_completed: boolean
  created_at: string
  // Relations
  practice_test?: PracticeTest
}

export interface UserSubjectProgress {
  id: string
  user_id: string
  subject_id: string
  total_learning_paths: number
  completed_learning_paths: number
  total_practice_tests: number
  completed_practice_tests: number
  average_score: number
  time_spent_minutes: number
  last_accessed: string
  created_at: string
  updated_at: string
  // Relations
  subject?: Subject
}

// Dashboard statistics interface
export interface SubjectStats {
  subject: Subject
  progress: UserSubjectProgress
  recentActivity: {
    learning_paths: number
    practice_tests: number
    questions_answered: number
  }
  achievements: {
    completed_paths: number
    perfect_scores: number
    streak_days: number
  }
}

// Subject-specific configuration
export interface SubjectConfig {
  subject: Subject
  features: {
    hasCodeEditor: boolean
    hasAudioSupport: boolean
    hasLatexSupport: boolean
    hasTimedTests: boolean
    hasEssayQuestions: boolean
  }
  tools: {
    calculator?: boolean
    formulaSheet?: boolean
    dictionary?: boolean
    thesaurus?: boolean
  }
}

// Navigation and UI types
export interface SubjectNavigation {
  subject: Subject
  sections: {
    learning_paths: number
    practice_tests: number
    resources: number
  }
  userProgress: UserSubjectProgress | null
}

export interface DashboardData {
  subjects: Subject[]
  userProgress: UserSubjectProgress[]
  recentActivity: {
    subject_id: string
    activity_type: 'learning_path' | 'practice_test' | 'question'
    title: string
    timestamp: string
    score?: number
  }[]
  achievements: {
    subject_id: string
    achievement_type: string
    title: string
    description: string
    earned_at: string
  }[]
}

// Filter and search types
export interface SubjectFilters {
  subjects: string[]
  difficulty_levels: number[]
  question_types: QuestionType[]
  media_types: MediaType[]
  tags: string[]
}

export interface SearchResults {
  learning_paths: EnhancedLearningPath[]
  practice_tests: PracticeTest[]
  questions: EnhancedQuestion[]
  resources: SubjectResource[]
}
