'use client'

import { useEffect, useState } from 'react'
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
import { practiceService } from '@/features/practice/practice.service'
import { quizService } from '@/features/quiz/quiz.service'
import type { Skill } from '@/types/practice'

const formSchema = z.object({
  name: z.string().min(1, 'Tên kỹ năng là bắt buộc'),
  description: z.string().optional(),
  categoryId: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : Number(v)),
    z.number().optional(),
  ),
})

type FormValues = z.infer<typeof formSchema>

interface SkillFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill?: Skill | null
}

export default function SkillFormDialog({ open, onOpenChange, skill = null }: SkillFormDialogProps) {
  const isEdit = skill != null
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['quiz-categories'],
    queryFn: quizService.getCategories,
    enabled: open,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: { name: '', description: '', categoryId: undefined },
  })

  useEffect(() => {
    if (!open) return
    if (skill) {
      form.reset({
        name: skill.name,
        description: skill.description ?? '',
        categoryId: skill.categoryId ?? undefined,
      })
    } else {
      form.reset({ name: '', description: '', categoryId: undefined })
    }
    setSubmitError('')
  }, [open, skill, form])

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const dto = {
        name: values.name,
        description: values.description || undefined,
        categoryId: values.categoryId,
      }
      return isEdit ? practiceService.updateSkill(skill!.id, dto) : practiceService.createSkill(dto)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-skills'] })
      onOpenChange(false)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message
      setSubmitError(typeof msg === 'string' ? msg : 'Không thể lưu kỹ năng. Vui lòng thử lại.')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa kỹ năng' : 'Tạo kỹ năng'}</DialogTitle>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên kỹ năng *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Vd: Tìm kiếm nâng cao" />
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
                      <option value="">Không gắn</option>
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
