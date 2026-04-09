export interface ExamOption {
  id: number
  optionText: string
  questionId: number
}

export interface ExamQuestion {
  id: number
  content: string
  createdAt: string
  type?: 'mc' | 'sa'
  options?: ExamOption[]
}

export interface SaQuestion {
  id: number
  content: string
}

export interface ExamSession {
  id: number
  userId: number
  questions: ExamQuestion[]
  answerIds: number[] | null
  saQuestions?: SaQuestion[]
  saAnswers?: Record<number, string> | null
  status: 'IN_PROGRESS' | 'COMPLETED' | 'SUBMITTED'
  remainingTime: number
  startedAt: string
  createdAt: string
}

export interface ExamGenerateResponse {
  code: number
  message: string
  data: {
    examSession: ExamSession
  }
  time: string
}

export interface QuestionTableRow {
  id: string
  displayId: string
  questionText: string
  competencyDomain: string
  competencyDomainColor: string
  competencyLevel: string
  score: number
}
