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
