'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
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

interface CreateCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function CreateCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateCategoryDialogProps) {
  const [submitError, setSubmitError] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: quizService.createCategory,
    onSuccess: () => {
      form.reset({ name: '', description: '' })
      setSubmitError('')
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message
      setSubmitError(
        typeof msg === 'string' ? msg : 'Không thể tạo miền năng lực. Vui lòng thử lại.',
      )
    },
  })

  const onSubmit = (values: FormValues) => {
    setSubmitError('')
    createMutation.mutate({
      name: values.name,
      description: values.description || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo miền năng lực</DialogTitle>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#00284D] hover:bg-[#001a33]"
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
