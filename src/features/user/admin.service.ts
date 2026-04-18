/**
 * adminService — CRUD for Classes, Cohorts, and ExamPeriods
 * All endpoints are `/api/v1/user/...` (within the UserController).
 */
import axiosInstance from '@/lib/axios'
import type {
  ClassItem,
  CohortItem,
  CreateClassPayload,
  CreateCohortPayload,
  CreateExamPeriodPayload,
  ExamPeriodItem,
  PaginationMeta,
  UpdateClassPayload,
  UpdateCohortPayload,
  UpdateExamPeriodPayload,
} from './user.service'

function unwrap<T>(response: unknown): T {
  const obj = response as Record<string, unknown>
  return (obj?.data ?? obj) as T
}

export const adminService = {
  // ── Classes ─────────────────────────────────────────────────────────────────

  getClasses: async (
    page = 1,
    limit = 20,
  ): Promise<{ items: ClassItem[]; pagination: PaginationMeta }> => {
    const res = await axiosInstance.get<unknown>(`/user/classes?page=${page}&limit=${limit}`)
    const data = unwrap<{ items: ClassItem[]; pagination: PaginationMeta }>(res.data)
    return {
      items: data?.items ?? [],
      pagination: data?.pagination ?? { total: 0, page, limit, totalPages: 1 },
    }
  },

  createClass: async (payload: CreateClassPayload): Promise<ClassItem> => {
    const res = await axiosInstance.post<unknown>('/user/classes', payload)
    return unwrap<ClassItem>(res.data)
  },

  updateClass: async (id: number, payload: UpdateClassPayload): Promise<ClassItem> => {
    const res = await axiosInstance.patch<unknown>(`/user/classes/${id}`, payload)
    return unwrap<ClassItem>(res.data)
  },

  deleteClass: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/user/classes/${id}`)
  },

  // ── Cohorts ──────────────────────────────────────────────────────────────────

  getCohorts: async (
    page = 1,
    limit = 20,
  ): Promise<{ items: CohortItem[]; pagination: PaginationMeta }> => {
    const res = await axiosInstance.get<unknown>(`/user/cohorts?page=${page}&limit=${limit}`)
    const data = unwrap<{ items: CohortItem[]; pagination: PaginationMeta }>(res.data)
    return {
      items: data?.items ?? [],
      pagination: data?.pagination ?? { total: 0, page, limit, totalPages: 1 },
    }
  },

  createCohort: async (payload: CreateCohortPayload): Promise<CohortItem> => {
    const res = await axiosInstance.post<unknown>('/user/cohorts', payload)
    return unwrap<CohortItem>(res.data)
  },

  updateCohort: async (id: number, payload: UpdateCohortPayload): Promise<CohortItem> => {
    const res = await axiosInstance.patch<unknown>(`/user/cohorts/${id}`, payload)
    return unwrap<CohortItem>(res.data)
  },

  deleteCohort: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/user/cohorts/${id}`)
  },

  // ── Exam Periods ─────────────────────────────────────────────────────────────

  getExamPeriods: async (
    page = 1,
    limit = 20,
  ): Promise<{ items: ExamPeriodItem[]; pagination: PaginationMeta }> => {
    const res = await axiosInstance.get<unknown>(`/user/exam-periods?page=${page}&limit=${limit}`)
    const data = unwrap<{ items: ExamPeriodItem[]; pagination: PaginationMeta }>(res.data)
    return {
      items: data?.items ?? [],
      pagination: data?.pagination ?? { total: 0, page, limit, totalPages: 1 },
    }
  },

  createExamPeriod: async (payload: CreateExamPeriodPayload): Promise<ExamPeriodItem> => {
    const res = await axiosInstance.post<unknown>('/user/exam-periods', payload)
    return unwrap<ExamPeriodItem>(res.data)
  },

  updateExamPeriod: async (
    id: number,
    payload: UpdateExamPeriodPayload,
  ): Promise<ExamPeriodItem> => {
    const res = await axiosInstance.patch<unknown>(`/user/exam-periods/${id}`, payload)
    return unwrap<ExamPeriodItem>(res.data)
  },

  deleteExamPeriod: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/user/exam-periods/${id}`)
  },
}
