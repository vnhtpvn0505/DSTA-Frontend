import axiosInstance from '@/lib/axios'
import type { ExamGenerateResponse } from '@/types/exam'

interface GenerateExamParams {
  categoryId: number
  numberOfQuestions: number
}

export const examService = {
  generate: async (params: GenerateExamParams): Promise<ExamGenerateResponse> => {
    const response = await axiosInstance.post<ExamGenerateResponse>(
      '/exam/generate',
      params,
    )
    return response.data
  },
}
