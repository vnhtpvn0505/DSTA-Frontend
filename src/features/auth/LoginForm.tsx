'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from './auth.schema'
import { authService } from './auth.service'
import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getMockUser } from '@/utils/mockUsers'
import { useAuthStore } from '@/stores/auth.store'
import { getDefaultRouteForRole } from '@/lib/authorization'
import { cn } from '@/lib/utils'

const USE_MOCK_AUTH = true

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onSwitchToForgotPassword?: () => void
}

const loginTitleClass = 'text-center font-bold text-[40px] uppercase text-white'

export default function LoginForm({
  onSwitchToRegister,
  onSwitchToForgotPassword,
}: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAdmin = searchParams.get('isAdmin') === 'true'
  const [errorMessage, setErrorMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { setUser } = useAuthStore()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      setUser({
        id: '',
        email: form.getValues('email') ?? '',
        role: 'student',
        schoolId: '',
      })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/dashboard')
    },
    onError: (error: unknown) => {
      setErrorMessage(
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Đăng nhập thất bại. Vui lòng thử lại.',
      )
    },
  })

  const onSubmit = (data: LoginInput) => {
    setErrorMessage('')

    loginMutation.mutate(data)
    // if (USE_MOCK_AUTH) {
    //   const email = data.email.toLowerCase();
    //   try {
    //     const mockUser = email.includes('admin')
    //       ? getMockUser('admin')
    //       : getMockUser('student');
    //     setUser(mockUser);
    //     router.push(getDefaultRouteForRole(mockUser.role));
    //   } catch {
    //     setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại.');
    //   }
    // } else {
    // }
  }

  return (
    <div className="w-full max-w-md rounded-3xl bg-[#00284D] p-8 shadow-xl">
      <h1 className={loginTitleClass}>{isAdmin ? 'Admin Login' : 'Login'}</h1>

      {USE_MOCK_AUTH && (
        <p className="mt-2 text-center text-xs text-gray-400">
          Test: student@test.com / admin@test.com
        </p>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
          {errorMessage && (
            <div className="rounded-md bg-red-500/20 p-3 text-center text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Email"
                      className="h-12 rounded-xl border-0 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-400"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mật khẩu"
                      className="h-12 rounded-xl border-0 bg-white pl-10 pr-12 text-gray-900 placeholder:text-gray-400"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={!USE_MOCK_AUTH && loginMutation.isPending}
            className="h-12 w-full rounded-xl bg-blue-400 font-medium uppercase text-white hover:bg-blue-500"
          >
            {!USE_MOCK_AUTH && loginMutation.isPending ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          <div
            className={cn('flex items-center justify-between pt-2 text-sm', {
              'justify-center': isAdmin,
            })}
          >
            {!isAdmin && (
              <>
                {onSwitchToRegister ? (
                  <button
                    type="button"
                    onClick={onSwitchToRegister}
                    className="text-gray-300 hover:text-white cursor-pointer"
                  >
                    Đăng ký
                  </button>
                ) : (
                  <Link href="/" className="text-gray-300 hover:text-white">
                    Đăng ký
                  </Link>
                )}
              </>
            )}
            {onSwitchToForgotPassword ? (
              <button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                Quên mật khẩu
              </button>
            ) : (
              <Link
                href="/forgot-password"
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                Quên mật khẩu
              </Link>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
