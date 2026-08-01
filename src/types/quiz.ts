/**
 * API response types for quiz endpoints.
 * Backend may use different field names; mapper handles variants.
 */
export interface QuizQuestionOption {
  id: number
  optionText?: string
  text?: string
  questionId?: number
}

export interface QuizQuestion {
  id: number
  content?: string
  questionText?: string
  createdAt?: string
  options?: QuizQuestionOption[]
  competencyDomain?: string
  competencyLevel?: string
  level?: string
  score?: number
  displayId?: string
  category?: { id: number; name: string; description?: string }
}

export interface QuizQuestionsResponse {
  code?: number
  message?: string
  data?: QuizQuestion[] | QuizQuestion
  time?: string
}

/** Paginated response for GET /api/v1/quiz/questions */
export interface QuizQuestionsPaginatedResponse {
  code?: number
  message?: string
  data?: {
    content?: QuizQuestion[]
    items?: QuizQuestion[]
    total?: number
    totalElements?: number
    totalPages?: number
  }
  total?: number
  totalPages?: number
  content?: QuizQuestion[]
}

// ─── Exam Config types ──────────────────────────────────────────────────────

export type ExamMode = 'standard' | 'dynamic'

export interface ExamGeneralConfig {
  totalMultipleChoice: number
  totalEssay: number
  durationMinutes: number
}

export interface ExamWeightConfig {
  level1: number
  level2: number
  level3: number
  level4: number
}

export interface ExamPracticalQuestion {
  id: string
  name: string
  level: string
  ratioPercent: number
  actualScore: number
}

export interface ExamDistributionItem {
  categoryId: number
  skillName: string
  counts: [string, string, string, string]
}

export type ExamConfigStatus = 'draft' | 'published' | 'inactive'

export interface ExamConfig {
  id: number
  name: string
  description: string | null
  examMode: ExamMode
  generalConfig: ExamGeneralConfig
  distribution: ExamDistributionItem[]
  weights: ExamWeightConfig
  practicalQuestions: ExamPracticalQuestion[]
  isActive: boolean
  status: ExamConfigStatus
  createdAt: string
  updatedAt: string
}

export interface CreateExamConfigDto {
  name: string
  description?: string
  examMode: ExamMode
  generalConfig: ExamGeneralConfig
  distribution: ExamDistributionItem[]
  weights: ExamWeightConfig
  practicalQuestions: ExamPracticalQuestion[]
  isActive?: boolean
}

export type UpdateExamConfigDto = Partial<CreateExamConfigDto>

export interface ExamConfigPreview {
  generalConfig: ExamGeneralConfig
  distribution: ExamDistributionItem[]
  sampleQuestions: {
    categoryId: number
    skillName: string
    level: string
    question: { id: number; content: string }
  }[]
}

// ─── Level (thang điểm / mức phân loại) ────────────────────────────────────

export interface Level {
  id: number
  rankName: string
  scoreRange: string
  description?: string | null
  minScore?: number | null
  maxScore?: number | null
  rangeTotal?: number | null
}

export interface CreateLevelDto {
  rankName: string
  scoreRange: string
  description?: string
  minScore?: number
  maxScore?: number
  rangeTotal?: number
}

export type UpdateLevelDto = Partial<CreateLevelDto>
