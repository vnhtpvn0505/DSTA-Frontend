'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSimpleSchema, RegisterSimpleInput } from './auth.schema';
import { authService } from './auth.service';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  /** When true, only render the card (no full-screen wrapper). Use on home page. */
  embedded?: boolean;
}

export default function RegisterForm({ onSwitchToLogin, embedded }: RegisterFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterSimpleInput>({
    resolver: zodResolver(registerSimpleSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      setSuccessMessage(
        onSwitchToLogin
          ? 'Đăng ký thành công! Chuyển sang đăng nhập...'
          : 'Đăng ký thành công! Đang chuyển hướng...'
      );
      if (onSwitchToLogin) {
        setTimeout(() => {
          onSwitchToLogin();
        }, 1500);
      } else {
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message;
      if (
        message?.includes('already exists') ||
        message?.includes('đã tồn tại')
      ) {
        setErrorMessage('Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.');
      } else {
        setErrorMessage(message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    },
  });

  const onSubmit = (data: RegisterSimpleInput) => {
    setErrorMessage('');
    setSuccessMessage('');
    // Backend v1: send defaults "" for missing fields (as requested)
    const email = data.username ?? '';
    let firstName = '';
    if (email) {
      const emailPrefix = email.split('@')[0];
      // Ex: if email is admin-01@tgp.com -> emailPrefix is "admin-01"
      firstName = emailPrefix;
    }

    registerMutation.mutate({
      username: email,
      password: data.password ?? '',
      firstName: firstName,
      email,
      className: '',
      avatar: '',
      dateOfBirth: '',
      school: '',
      faculty: '',
      universityName: '',
      facultyName: '',
      phoneNumber: '',
    });
  };

  const cardClasses = embedded
    ? 'w-full max-w-md space-y-6 rounded-3xl bg-[#00284D] p-8 shadow-xl'
    : 'w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg';
  const titleClasses = embedded
    ? 'text-center font-medium uppercase text-white'
    : 'text-center text-3xl font-bold text-gray-900';
  const subtitleClasses = embedded
    ? 'mt-2 text-center text-sm text-gray-400'
    : 'mt-2 text-center text-sm text-gray-600';
  const errorClasses = embedded
    ? 'rounded-md bg-red-500/20 p-3 text-center text-sm text-red-200'
    : 'rounded-md bg-red-50 p-4';
  const successClasses = embedded
    ? 'rounded-md bg-green-500/20 p-3 text-center text-sm text-green-200'
    : 'rounded-md bg-green-50 p-4';
  const inputBaseClasses = embedded
    ? 'h-12 rounded-xl border-0 bg-white pl-10 text-gray-900 placeholder:text-gray-400'
    : '';

  const card = (
    <div className={cardClasses}>
      <div>
        <h2
          className={titleClasses}
          style={embedded ? { fontSize: '48px' } : undefined}
        >
          {embedded ? 'Register' : 'Đăng ký tài khoản'}
        </h2>
        {!embedded && (
          <p className={subtitleClasses}>Dành cho sinh viên</p>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={embedded ? 'mt-8 space-y-5' : 'space-y-6'}>
          {errorMessage && (
            <div className={errorClasses}>
              <p className={!embedded ? 'text-sm text-red-800' : undefined}>{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className={successClasses}>
              <p className={!embedded ? 'text-sm text-green-800' : undefined}>{successMessage}</p>
            </div>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
               
                <FormControl>
                  {embedded ? (
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Email"
                        className={`${inputBaseClasses} pr-4`}
                        {...field}
                      />
                    </div>
                  ) : (
                    <Input placeholder="Email" {...field} />
                  )}
                </FormControl>
                <FormMessage className={embedded ? 'text-red-300' : ''} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
               
                <FormControl>
                  {embedded ? (
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        className={`${inputBaseClasses} pr-12`}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <Input type="password" placeholder="Tối thiểu 6 ký tự" {...field} />
                  )}
                </FormControl>
                <FormMessage className={embedded ? 'text-red-300' : ''} />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className={
              embedded
                ? 'h-12 w-full rounded-xl bg-blue-400 font-medium uppercase text-white hover:bg-blue-500'
                : 'w-full'
            }
          >
            {registerMutation.isPending ? 'Đang đăng ký...' : 'Đăng ký'}
          </Button>

          <div className={embedded ? 'pt-2 text-center text-sm' : 'text-center text-sm'}>
            {onSwitchToLogin ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                Đăng nhập
              </button>
            ) : (
              <Link href="/" className="text-gray-300 hover:text-white">
                Đăng nhập
              </Link>
            )}
          </div>
        </form>
      </Form>
    </div>
  );

  if (embedded) {
    return card;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 lg:px-0">
      {card}
    </div>
  );
}
