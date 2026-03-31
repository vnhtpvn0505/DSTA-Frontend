import axiosInstance, { SKIP_AUTH_REDIRECT } from '@/lib/axios'
import type {
  ExamQuestion,
  ExamOption,
  ExamSession,
  QuestionTableRow,
} from '@/types/exam'
import type {
  QuizQuestion,
  QuizQuestionsResponse,
  QuizQuestionsPaginatedResponse,
  ExamConfig,
  CreateExamConfigDto,
  UpdateExamConfigDto,
} from '@/types/quiz'

const DOMAIN_COLORS: Record<string, string> = {
  'KHAI THÁC DỮ LIỆU VÀ THÔNG TIN': 'bg-green-600',
  'GIAO TIẾP VÀ HỢP TÁC TRONG MÔI TRƯỜNG SỐ': 'bg-blue-600',
  'SÁNG TẠO NỘI DUNG SỐ': 'bg-amber-500',
  'ỨNG DỤNG TRÍ TUỆ NHÂN TẠO (AI)': 'bg-[#00284D]',
}

const DEFAULT_DOMAIN_COLOR = 'bg-gray-600'

function mapToQuestionTableRow(q: QuizQuestion, index: number): QuestionTableRow {
  const domain =
    q.competencyDomain ?? q.category?.name ?? '—'
  const level = q.competencyLevel ?? q.level ?? '—'
  return {
    id: String(q.id),
    displayId: q.displayId ?? String(index + 1).padStart(4, '0'),
    questionText: q.content ?? q.questionText ?? `Câu hỏi ${index + 1}`,
    competencyDomain: domain,
    competencyDomainColor: DOMAIN_COLORS[domain] ?? DEFAULT_DOMAIN_COLOR,
    competencyLevel: level,
    score: q.score ?? 100,
  }
}

function mapToExamQuestion(q: QuizQuestion, index: number): ExamQuestion {
  const options: ExamOption[] = (q.options ?? []).map((opt, i) => ({
    id: opt.id,
    optionText: opt.optionText ?? opt.text ?? `Đáp án ${i + 1}`,
    questionId: q.id,
  }))

  return {
    id: q.id,
    content: q.content ?? q.questionText ?? `Câu hỏi ${index + 1}`,
    createdAt: q.createdAt ?? new Date().toISOString(),
    options,
  }
}

export interface GetRandomQuestionsParams {
  categoryId: number
  limit?: number
}

export interface GetQuestionsParams {
  categoryId?: number
  page?: number
  limit?: number
}

export interface GetQuestionsResult {
  items: QuestionTableRow[]
  total: number
  totalPages: number
  currentPage: number
}

export const quizService = {
  /**
   * GET /api/v1/quiz/questions
   * Lấy danh sách câu hỏi theo category với phân trang
   */
  getQuestions: async (
    params: GetQuestionsParams = {},
  ): Promise<GetQuestionsResult> => {
    const { categoryId, page = 1, limit = 10 } = params
    const queryParams: Record<string, number> = { page, limit }
    if (categoryId != null) queryParams.categoryId = categoryId

    const response =
      await axiosInstance.get<QuizQuestionsPaginatedResponse>(
        '/quiz/questions',
        { params: queryParams },
      )

    const data = response.data as Record<string, unknown>
    let items: QuizQuestion[] = []
    let total = 0
    let totalPages = 1

    const dataObj = data?.data as Record<string, unknown> | undefined
    const rawContent =
      (Array.isArray(data) ? data : null) ??
      (Array.isArray(data?.data) ? data.data : null) ??
      dataObj?.content ??
      dataObj?.items ??
      dataObj?.questions ??
      (data as { content?: QuizQuestion[] }).content
    const rawItems = Array.isArray(rawContent) ? rawContent : []
    const pagination = dataObj?.pagination as Record<string, unknown> | undefined

    if (rawItems.length > 0 || dataObj) {
      items = rawItems as QuizQuestion[]
      const rawTotal =
        pagination?.total ??
        dataObj?.total ??
        dataObj?.totalElements ??
        (data as { total?: number }).total ??
        items.length
      total = Math.max(0, Number(rawTotal) || 0)
      const rawTotalPages =
        pagination?.totalPages ??
        dataObj?.totalPages ??
        (data as { totalPages?: number }).totalPages ??
        (limit > 0 ? Math.ceil(total / limit) : 1)
      totalPages = Math.max(1, Number(rawTotalPages) || 1)
    }

    const rows = items.map(mapToQuestionTableRow)

    return {
      items: rows,
      total,
      totalPages,
      currentPage: page,
    }
  },

  /**
   * GET /api/v1/quiz/questions/random
   * Lấy danh sách câu hỏi ngẫu nhiên theo category
   */
  getRandomQuestions: async (
    params: GetRandomQuestionsParams,
  ): Promise<ExamQuestion[]> => {
    const { categoryId, limit = 60 } = params
    const response = await axiosInstance.get<QuizQuestionsResponse>(
      '/quiz/questions/random',
      {
        params: { categoryId, limit },
        [SKIP_AUTH_REDIRECT]: true,
      } as Parameters<typeof axiosInstance.get>[1],
    )

    const data = response.data as QuizQuestionsResponse | QuizQuestion[]
    let questions: QuizQuestion[] = []

    if (Array.isArray(data)) {
      questions = data
    } else if (data && typeof data === 'object' && 'data' in data) {
      const inner = (data as QuizQuestionsResponse).data
      questions = Array.isArray(inner) ? inner : inner != null ? [inner] : []
    }

    return questions.map(mapToExamQuestion)
  },

  /**
   * GET /api/v1/quiz/categories
   * Lấy danh sách danh mục (miền năng lực)
   */
  getCategories: async () => {
    const response = await axiosInstance.get<unknown>('/quiz/categories')
    const data = response.data
    // Hỗ trợ format: { data: { categories: [...] } }, array, { content }, { items }, ...
    let list: unknown[] = []
    if (Array.isArray(data)) {
      list = data
    } else if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>
      const dataObj = obj.data as Record<string, unknown> | undefined
      const raw =
        (Array.isArray(obj.data) ? obj.data : null) ??
        (Array.isArray(dataObj?.categories) ? dataObj!.categories : null) ??
        obj.content ??
        obj.items ??
        obj.result ??
        obj.body ??
        (obj._embedded as Record<string, unknown>)?.categories
      if (Array.isArray(raw)) {
        list = raw
      } else if (raw && typeof raw === 'object') {
        const inner = raw as Record<string, unknown>
        if (Array.isArray(inner.categories)) list = inner.categories
        else if (Array.isArray(inner.content)) list = inner.content
        else if (Array.isArray(inner.data)) list = inner.data
      }
    }
    const normalize = (item: unknown): { id: number; name: string; description?: string } | null => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const id = (o.id ?? o.categoryId) as number | undefined
      const name = (o.name ?? o.categoryName ?? o.title) as string | undefined
      if (id == null || !name) return null
      return { id: Number(id), name: String(name), description: o.description as string | undefined }
    }
    return list.map(normalize).filter(Boolean) as {
      id: number
      name: string
      description?: string
    }[]
  },

  /**
   * POST /api/v1/quiz/categories
   * Tạo miền năng lực mới
   */
  createCategory: async (payload: {
    name: string
    description?: string
  }) => {
    const response = await axiosInstance.post('/quiz/categories', payload)
    return response.data
  },

  /**
   * POST /api/v1/quiz/questions
   * Tạo câu hỏi mới (UC22)
   */
  createQuestion: async (payload: {
    content: string
    level: 'Easy' | 'Medium' | 'Hard'
    categoryId: number
    options: { optionText: string; isCorrect: boolean }[]
  }) => {
    // CreateQuestionDto: options phải là array, mỗi item { optionText, isCorrect }
    const options = payload.options.map((o) => ({
      optionText: String(o?.optionText ?? '').trim(),
      isCorrect: Boolean(o?.isCorrect),
    }))
    const body = {
      content: payload.content,
      level: payload.level,
      categoryId: Number(payload.categoryId),
      options,
    }
    const response = await axiosInstance.post('/quiz/questions', body)
    return response.data
  },

  /**
   * Tạo ExamSession từ danh sách câu hỏi (cho flow bắt đầu bài thi)
   */
  buildExamSession(questions: ExamQuestion[], durationMinutes = 45): ExamSession {
    const id = Date.now()
    const startedAt = new Date().toISOString()
    const remainingTime = durationMinutes * 60

    return {
      id,
      userId: 0,
      questions,
      answerIds: null,
      status: 'IN_PROGRESS',
      remainingTime,
      startedAt,
      createdAt: startedAt,
    }
  },

  // ─── Exam Config API ────────────────────────────────────────────────────────

  /**
   * GET /api/v1/quiz/exam-configs
   * Lấy tất cả cấu hình đề thi
   */
  getExamConfigs: async (): Promise<ExamConfig[]> => {
    const response = await axiosInstance.get<unknown>('/quiz/exam-configs', {
      [SKIP_AUTH_REDIRECT]: true,
    } as Record<string, unknown>)
    const body = response.data as Record<string, unknown>
    const inner = (body?.data as Record<string, unknown>)?.configs ?? body?.data
    return Array.isArray(inner) ? (inner as ExamConfig[]) : []
  },

  /**
   * POST /api/v1/quiz/exam-configs
   * Tạo cấu hình đề thi mới
   */
  createExamConfig: async (dto: CreateExamConfigDto): Promise<ExamConfig> => {
    const response = await axiosInstance.post<unknown>('/quiz/exam-configs', dto, {
      [SKIP_AUTH_REDIRECT]: true,
    } as Record<string, unknown>)
    const body = response.data as Record<string, unknown>
    const config = (body?.data as Record<string, unknown>)?.config ?? body?.data
    return config as ExamConfig
  },

  /**
   * PATCH /api/v1/quiz/exam-configs/:id
   * Cập nhật cấu hình đề thi
   */
  updateExamConfig: async (id: number, dto: UpdateExamConfigDto): Promise<ExamConfig> => {
    const response = await axiosInstance.patch<unknown>(`/quiz/exam-configs/${id}`, dto, {
      [SKIP_AUTH_REDIRECT]: true,
    } as Record<string, unknown>)
    const body = response.data as Record<string, unknown>
    const config = (body?.data as Record<string, unknown>)?.config ?? body?.data
    return config as ExamConfig
  },

  /**
   * DELETE /api/v1/quiz/exam-configs/:id
   * Xóa cấu hình đề thi (soft delete)
   */
  deleteExamConfig: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/quiz/exam-configs/${id}`, {
      [SKIP_AUTH_REDIRECT]: true,
    } as Record<string, unknown>)
  },
}
