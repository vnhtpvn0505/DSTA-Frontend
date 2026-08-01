'use client'

import { useEffect, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import type { Level } from '@/types/quiz'

const formSchema = z.object({
  rankName: z.string().min(1, 'Tên mức là bắt buộc'),
  scoreRange: z.string().min(1, 'Khoảng điểm là bắt buộc'),
  description: z.string().optional(),
  minScore: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional(),
  ),
  maxScore: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().min(0).optional(),
  ),
  rangeTotal: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().int().min(1).optional(),
  ),
})

type FormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: FormValues = {
  rankName: '',
  scoreRange: '',
  description: '',
  minScore: undefined,
  maxScore: undefined,
  rangeTotal: undefined,
}

interface LevelFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  level?: Level | null
}

export default function LevelFormDialog({ open, onOpenChange, level = null }: LevelFormDialogProps) {
  const isEdit = level != null
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: DEFAULT_VALUES,
  })

  useEffect(() => {
    if (!open) return
    if (level) {
      form.reset({
        rankName: level.rankName,
        scoreRange: level.scoreRange,
        description: level.description ?? '',
        minScore: level.minScore ?? undefined,
        maxScore: level.maxScore ?? undefined,
        rangeTotal: level.rangeTotal ?? undefined,
      })
    } else {
      form.reset(DEFAULT_VALUES)
    }
    setSubmitError('')
  }, [open, level, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const dto = {
        rankName: values.rankName,
        scoreRange: values.scoreRange,
        description: values.description || undefined,
        minScore: values.minScore,
        maxScore: values.maxScore,
        rangeTotal: values.rangeTotal,
      }
      return isEdit ? quizService.updateLevel(level!.id, dto) : quizService.createLevel(dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-levels'] })
      onOpenChange(false)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message
      setSubmitError(typeof msg === 'string' ? msg : 'Không thể lưu mức phân loại. Vui lòng thử lại.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa mức phân loại' : 'Tạo mức phân loại'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5"
          >
            {submitError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</div>
            )}

            <FormField
              control={form.control}
              name="rankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên mức *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vd: Khá / Giỏi" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scoreRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Khoảng điểm *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vd: 41-50/60" />
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
                      placeholder="Vd: Đạt yêu cầu"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="minScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điểm thấp nhất</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Điểm cao nhất</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rangeTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thang điểm</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ''} />
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
                {mutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
