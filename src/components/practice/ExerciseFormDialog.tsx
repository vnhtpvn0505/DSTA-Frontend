'use client'

import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { quizService } from '@/features/quiz/quiz.service'
import { practiceService } from '@/features/practice/practice.service'
import type { PracticeExercise, RevealMode } from '@/types/practice'

const REVEAL_LABELS: Record<RevealMode, string> = {
  after_submit: 'Sau khi nộp bài',
  after_each_question: 'Sau mỗi câu (hiện xử lý như "Sau khi nộp bài")',
  never: 'Không hiển thị',
}

const formSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  description: z.string().optional(),
  categoryId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().optional(),
  ),
  questionCount: z.coerce.number().int().positive('Phải lớn hơn 0'),
  questionTypes: z
    .array(z.enum(['mc', 'sa']))
    .min(1, 'Chọn ít nhất 1 loại câu hỏi'),
  shuffleQuestions: z.boolean(),
  shuffleOptions: z.boolean(),
  timeLimitMinutes: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().positive().optional(),
  ),
  retryLimit: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().positive().optional(),
  ),
  passingScore: z.coerce.number().min(0).max(100),
  revealMode: z.enum(['after_submit', 'after_each_question', 'never']),
})

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  title: '',
  description: '',
  categoryId: undefined,
  questionCount: 10,
  questionTypes: ['mc'],
  shuffleQuestions: true,
  shuffleOptions: true,
  timeLimitMinutes: undefined,
  retryLimit: undefined,
  passingScore: 60,
  revealMode: 'after_submit',
}

interface ExerciseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise?: PracticeExercise | null
  onSuccess?: () => void
}

export default function ExerciseFormDialog({
  open,
  onOpenChange,
  exercise = null,
  onSuccess,
}: ExerciseFormDialogProps) {
  const isEdit = exercise != null
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    queryKey: ['quiz-categories'],
    queryFn: quizService.getCategories,
    enabled: open,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (exercise) {
      form.reset({
        title: exercise.title,
        description: exercise.description ?? '',
        categoryId: exercise.categoryId ?? undefined,
        questionCount: exercise.config.questionCount,
        questionTypes: exercise.config.questionTypes,
        shuffleQuestions: exercise.config.shuffleQuestions,
        shuffleOptions: exercise.config.shuffleOptions,
        timeLimitMinutes: exercise.config.timeLimitMinutes ?? undefined,
        retryLimit: exercise.config.retryLimit ?? undefined,
        passingScore: exercise.config.passingScore,
        revealMode: exercise.config.revealMode,
      })
    } else {
      form.reset(DEFAULT_VALUES)
    }
  }, [open, exercise, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const dto = {
        title: values.title,
        description: values.description || undefined,
        categoryId: values.categoryId,
        config: {
          questionCount: values.questionCount,
          questionTypes: values.questionTypes,
          shuffleQuestions: values.shuffleQuestions,
          shuffleOptions: values.shuffleOptions,
          timeLimitMinutes: values.timeLimitMinutes ?? null,
          retryLimit: values.retryLimit ?? null,
          passingScore: values.passingScore,
          revealMode: values.revealMode,
        },
      }
      return isEdit
        ? practiceService.updateExercise(exercise!.id, dto)
        : practiceService.createExercise(dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-exercises'] })
      onOpenChange(false)
      onSuccess?.()
    },
  })

  const questionTypes = form.watch('questionTypes')

  const toggleType = (type: 'mc' | 'sa') => {
    const next = questionTypes.includes(type)
      ? questionTypes.filter((t) => t !== type)
      : [...questionTypes, type]
    form.setValue('questionTypes', next)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa bài luyện tập' : 'Tạo bài luyện tập mới'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5"
          >
            {mutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                Không thể lưu bài luyện tập. Vui lòng thử lại.
              </div>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nhập tiêu đề bài luyện tập" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Miền năng lực</FormLabel>
                  <FormControl>
                    <select
                      value={field.value == null ? '' : String(field.value)}
                      onChange={(e) =>
                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                    >
                      <option value="">Không gắn miền năng lực</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Cấu hình</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questionCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số câu hỏi *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điểm đạt (%) *</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeLimitMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian (phút)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Không giới hạn"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="retryLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lần làm lại</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Không giới hạn"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-4">
                <FormLabel>Loại câu hỏi *</FormLabel>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={questionTypes.includes('mc')}
                      onChange={() => toggleType('mc')}
                    />
                    Trắc nghiệm (mc)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={questionTypes.includes('sa')}
                      onChange={() => toggleType('sa')}
                    />
                    Tự luận (sa)
                  </label>
                </div>
                <FormMessage>{form.formState.errors.questionTypes?.message}</FormMessage>
              </div>

              <div className="mt-4 flex flex-wrap gap-6">
                <FormField
                  control={form.control}
                  name="shuffleQuestions"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      Trộn thứ tự câu hỏi
                    </label>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shuffleOptions"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      Trộn thứ tự đáp án
                    </label>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="revealMode"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Thời điểm hiển thị đáp án/lời giải</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                      >
                        {(Object.keys(REVEAL_LABELS) as RevealMode[]).map((m) => (
                          <option key={m} value={m}>
                            {REVEAL_LABELS[m]}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-[#00284D] hover:bg-[#001a33]"
              >
                {mutation.isPending ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo (nháp)'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
