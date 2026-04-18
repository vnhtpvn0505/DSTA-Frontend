'use client'

import { useState, useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

const optionSchema = z.object({
  optionText: z.string().min(1, 'Không được để trống'),
  isCorrect: z.boolean(),
})

const formSchema = z
  .object({
    content: z.string().min(1, 'Nội dung là bắt buộc'),
    categoryId: z.preprocess(
      (v) => (v === '' || v === undefined ? undefined : Number(v)),
      z.number({ message: 'Miền năng lực là bắt buộc' }).min(1),
    ),
    level: z.enum(['Easy', 'Medium', 'Hard'], {
      message: 'Độ khó là bắt buộc',
    }),
    options: z
      .array(optionSchema)
      .min(4, 'MCQ phải có tối thiểu 4 đáp án')
      .refine(
        (opts) => opts.some((o) => o.isCorrect),
        'Phải có ít nhất 1 đáp án đúng',
      )
      .refine(
        (opts) => opts.filter((o) => o.isCorrect).length === 1,
        'Chỉ được có 1 đáp án đúng (single-choice)',
      ),
  })
  .strict()

type FormValues = Omit<z.infer<typeof formSchema>, 'categoryId'> & {
  categoryId: number
}

interface EditQuestionDialogProps {
  open: boolean
  questionId: number | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const LEVEL_LABELS: Record<string, string> = {
  Easy: 'Dễ',
  Medium: 'Trung bình',
  Hard: 'Khó',
}

export default function EditQuestionDialog({
  open,
  questionId,
  onOpenChange,
  onSuccess,
}: EditQuestionDialogProps) {
  const [submitError, setSubmitError] = useState('')
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['quiz-categories'],
    queryFn: quizService.getCategories,
    enabled: open,
    staleTime: 0,
  })

  const { data: question, isLoading: questionLoading } = useQuery({
    queryKey: ['quiz-question', questionId],
    queryFn: () => quizService.getQuestionById(questionId!),
    enabled: open && questionId != null,
    staleTime: 0,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      content: '',
      categoryId: 1,
      level: 'Medium',
      options: [],
    },
  })

  useEffect(() => {
    if (!open) return
    if (!question) return
    form.reset({
      content: question.content,
      categoryId: question.category?.id ?? 1,
      level: question.level as 'Easy' | 'Medium' | 'Hard',
      options: question.options.map((o) => ({
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })),
    })
  }, [open, question, form])

  const options = form.watch('options')

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      quizService.updateQuestion(questionId!, {
        content: values.content,
        level: values.level,
        categoryId: values.categoryId,
        options: values.options.map((o) => ({
          optionText: String(o?.optionText ?? '').trim(),
          isCorrect: Boolean(o?.isCorrect),
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions'] })
      queryClient.invalidateQueries({ queryKey: ['quiz-question', questionId] })
      setSubmitError('')
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err: { response?: { data?: unknown }; message?: string }) => {
      const data = err?.response?.data
      let msg = 'Không thể cập nhật câu hỏi. Vui lòng thử lại.'
      if (data && typeof data === 'object') {
        const d = data as Record<string, unknown>
        msg =
          (d.message as string) ??
          (Array.isArray(d.errors) ? (d.errors as string[]).join(', ') : null) ??
          JSON.stringify(d)
      } else if (typeof data === 'string') msg = data
      setSubmitError(msg)
    },
  })

  const addOption = () => {
    form.setValue('options', [...options, { optionText: '', isCorrect: false }])
  }

  const removeOption = (index: number) => {
    if (options.length <= 4) return
    form.setValue('options', options.filter((_, i) => i !== index))
  }

  const setCorrectOption = (index: number) => {
    form.setValue(
      'options',
      options.map((o, i) => ({ ...o, isCorrect: i === index })),
    )
  }

  const onSubmit = (values: FormValues) => {
    setSubmitError('')
    updateMutation.mutate(values)
  }

  const isLoading = questionLoading || categoriesLoading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa câu hỏi</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00284D] border-t-transparent" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {submitError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung câu hỏi *</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                        placeholder="Nhập nội dung câu hỏi..."
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
                    <FormLabel>Miền năng lực *</FormLabel>
                    <FormControl>
                      <select
                        value={field.value == null ? '' : String(field.value)}
                        onChange={(e) => {
                          const v = e.target.value
                          field.onChange(v === '' ? undefined : Number(v))
                        }}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                      >
                        <option value="">Chọn miền năng lực</option>
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

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ khó *</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                      >
                        {(['Easy', 'Medium', 'Hard'] as const).map((l) => (
                          <option key={l} value={l}>
                            {LEVEL_LABELS[l] ?? l}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <FormLabel>Đáp án (MCQ – tối thiểu 4, chọn 1 đúng) *</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm đáp án
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="options"
                  render={() => (
                    <FormItem>
                      <div className="space-y-2">
                        {options.map((_, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 p-2"
                          >
                            <button
                              type="button"
                              onClick={() => setCorrectOption(i)}
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                                options[i]?.isCorrect
                                  ? 'border-green-500 bg-green-50 text-green-600'
                                  : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-green-400',
                              )}
                              title="Chọn làm đáp án đúng"
                            >
                              {i + 1}
                            </button>
                            <FormField
                              control={form.control}
                              name={`options.${i}.optionText`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      value={field.value ?? ''}
                                      placeholder={`Đáp án ${i + 1}`}
                                      className="border-0 bg-transparent focus-visible:ring-0"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(i)}
                              disabled={options.length <= 4}
                              className="text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <FormMessage>
                        {form.formState.errors.options?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="bg-[#00284D] hover:bg-[#001a33]"
                >
                  {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
