'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { quizService } from '@/features/quiz/quiz.service'

const formSchema = z.object({
  name: z.string().min(1, 'Tên miền là bắt buộc'),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Category {
  id: number
  name: string
  description?: string
}

interface EditCategoryDialogProps {
  open: boolean
  category: Category | null
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function EditCategoryDialog({
  open,
  category,
  onOpenChange,
  onSuccess,
}: EditCategoryDialogProps) {
  const [submitError, setSubmitError] = useState('')
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', description: '' },
  })

  useEffect(() => {
    if (open && category) {
      form.reset({
        name: category.name,
        description: category.description ?? '',
      })
      setSubmitError('')
    }
  }, [open, category, form])

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      quizService.updateCategory(category!.id, {
        name: values.name,
        description: values.description || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-categories'] })
      setSubmitError('')
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message
      setSubmitError(
        typeof msg === 'string' ? msg : 'Không thể cập nhật miền năng lực. Vui lòng thử lại.',
      )
    },
  })

  const onSubmit = (values: FormValues) => {
    setSubmitError('')
    updateMutation.mutate(values)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa miền năng lực</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {submitError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên miền *</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                      placeholder="Nhập tên miền năng lực..."
                    />
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
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#00284D] focus:outline-none focus:ring-1 focus:ring-[#00284D]"
                      placeholder="Nhập mô tả (tùy chọn)..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
      </DialogContent>
    </Dialog>
  )
}
