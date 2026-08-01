'use client'

import { useEffect } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { practiceService } from '@/features/practice/practice.service'
import type { PracticeQuestion } from '@/types/practice'
import { cn } from '@/lib/utils'

const DEFAULT_OPTIONS = [
  { optionText: '', isCorrect: false },
  { optionText: '', isCorrect: false },
]

const formSchema = z
  .object({
    type: z.enum(['mc', 'sa']),
    content: z.string().min(1, 'Nội dung là bắt buộc'),
    hint: z.string().optional(),
    commonMistakes: z.string().optional(),
    solution: z.string().optional(),
    knowledgeToReview: z.string().optional(),
    explanationCorrect: z.string().optional(),
    explanationIncorrect: z.string().optional(),
    sampleAnswer: z.string().optional(),
    options: z.array(
      z.object({ optionText: z.string(), isCorrect: z.boolean() }),
    ),
  })
  .superRefine((val, ctx) => {
    if (val.type !== 'mc') return
    const filled = val.options.filter((o) => o.optionText.trim().length > 0)
    if (filled.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Câu trắc nghiệm cần tối thiểu 2 đáp án',
      })
    }
    if (!val.options.some((o) => o.isCorrect)) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'Phải đánh dấu ít nhất 1 đáp án đúng',
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  type: 'mc',
  content: '',
  hint: '',
  commonMistakes: '',
  solution: '',
  knowledgeToReview: '',
  explanationCorrect: '',
  explanationIncorrect: '',
  sampleAnswer: '',
  options: DEFAULT_OPTIONS,
}

interface PracticeQuestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exerciseId: number
  question?: PracticeQuestion | null
  onSuccess?: () => void
}

export default function PracticeQuestionDialog({
  open,
  onOpenChange,
  exerciseId,
  question = null,
  onSuccess,
}: PracticeQuestionDialogProps) {
  const isEdit = question != null
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (question) {
      form.reset({
        type: question.type,
        content: question.content,
        hint: question.hint ?? '',
        commonMistakes: question.commonMistakes ?? '',
        solution: question.solution ?? '',
        knowledgeToReview: question.knowledgeToReview ?? '',
        explanationCorrect: question.explanationCorrect ?? '',
        explanationIncorrect: question.explanationIncorrect ?? '',
        sampleAnswer: question.sampleAnswer ?? '',
        options:
          question.options && question.options.length > 0
            ? question.options.map((o) => ({
                optionText: o.optionText,
                isCorrect: Boolean(o.isCorrect),
              }))
            : DEFAULT_OPTIONS,
      })
    } else {
      form.reset(DEFAULT_VALUES)
    }
  }, [open, question, form])

  const type = form.watch('type')
  const options = form.watch('options')

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const dto = {
        type: values.type,
        content: values.content,
        hint: values.hint || undefined,
        commonMistakes: values.commonMistakes || undefined,
        solution: values.solution || undefined,
        knowledgeToReview: values.knowledgeToReview || undefined,
        explanationCorrect: values.type === 'mc' ? values.explanationCorrect || undefined : undefined,
        explanationIncorrect: values.type === 'mc' ? values.explanationIncorrect || undefined : undefined,
        sampleAnswer: values.type === 'sa' ? values.sampleAnswer || undefined : undefined,
        options:
          values.type === 'mc'
            ? values.options
                .filter((o) => o.optionText.trim().length > 0)
                .map((o) => ({ optionText: o.optionText.trim(), isCorrect: o.isCorrect }))
            : undefined,
      }
      return isEdit
        ? practiceService.updateQuestion(exerciseId, question!.id, dto)
        : practiceService.createQuestion(exerciseId, dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-questions', exerciseId] })
      onOpenChange(false)
      onSuccess?.()
    },
  })

  const addOption = () => {
    if (options.length >= 6) return
    form.setValue('options', [...options, { optionText: '', isCorrect: false }])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) return
    form.setValue(
      'options',
      options.filter((_, i) => i !== index),
    )
  }

  const setCorrectOption = (index: number) => {
    form.setValue(
      'options',
      options.map((o, i) => ({ ...o, isCorrect: i === index })),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa câu hỏi luyện tập' : 'Thêm câu hỏi luyện tập'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5"
          >
            {mutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                Không thể lưu câu hỏi. Vui lòng thử lại.
              </div>
            )}

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại câu hỏi *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                    >
                      <option value="mc">Trắc nghiệm (mc)</option>
                      <option value="sa">Tự luận (sa)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung câu hỏi *</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gợi ý</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Gợi ý hiển thị khi sinh viên yêu cầu" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === 'mc' ? (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <FormLabel>Đáp án (2–6, đánh dấu đúng 1 đáp án) *</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
                    <Plus className="h-4 w-4" />
                    Thêm đáp án
                  </Button>
                </div>
                <p className="mb-2 text-xs text-gray-500">
                  Bấm vào ô tròn ✓ bên trái mỗi đáp án để đánh dấu đó là đáp án đúng.
                </p>
                <div className="space-y-2">
                  {options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-gray-200 p-2">
                      <button
                        type="button"
                        onClick={() => setCorrectOption(i)}
                        className={cn(
                          'flex h-8 shrink-0 items-center gap-1 rounded-full border-2 px-3 text-xs font-medium transition-colors',
                          opt.isCorrect
                            ? 'border-green-500 bg-green-50 text-green-600'
                            : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-green-400',
                        )}
                        title="Đánh dấu là đáp án đúng"
                      >
                        {opt.isCorrect ? '✓ Đúng' : 'Đúng?'}
                      </button>
                      <Input
                        value={opt.optionText}
                        onChange={(e) => {
                          const next = [...options]
                          next[i] = { ...next[i], optionText: e.target.value }
                          form.setValue('options', next)
                        }}
                        placeholder={`Đáp án ${i + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(i)}
                        disabled={options.length <= 2}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <FormMessage>{form.formState.errors.options?.message}</FormMessage>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="explanationCorrect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lý do đúng</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={2}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="explanationIncorrect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lý do sai</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            rows={2}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="sampleAnswer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đáp án mẫu</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                        placeholder="Câu tự luận không được hệ thống chấm điểm — đáp án mẫu chỉ để sinh viên tự đối chiếu."
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="commonMistakes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lỗi thường gặp</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="knowledgeToReview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiến thức cần ôn</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="solution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lời giải chi tiết</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={2}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-[#00284D] hover:bg-[#001a33]"
              >
                {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
