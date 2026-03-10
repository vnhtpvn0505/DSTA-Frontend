'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  forgetPasswordEmailSchema,
  forgetPasswordOtpSchema,
  forgetPasswordNewSchema,
  type ForgetPasswordEmailInput,
  type ForgetPasswordOtpInput,
  type ForgetPasswordNewInput,
} from './auth.schema';
import { Mail, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const RESEND_COUNTDOWN_SECONDS = 60;

interface FormForgetPasswordProps {
  onBack?: () => void;
  onSuccess?: () => void;
  embedded?: boolean;
}

export default function FormForgetPassword({
  onBack,
  onSuccess,
  embedded = false,
}: FormForgetPasswordProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [emailSent, setEmailSent] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formEmail = useForm<ForgetPasswordEmailInput>({
    resolver: zodResolver(forgetPasswordEmailSchema),
    defaultValues: { email: '' },
  });

  const formOtp = useForm<ForgetPasswordOtpInput>({
    resolver: zodResolver(forgetPasswordOtpSchema),
    defaultValues: { otp: '' },
  });

  const formNewPassword = useForm<ForgetPasswordNewInput>({
    resolver: zodResolver(forgetPasswordNewSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  // Countdown cho "Gửi lại" ở bước 2
  useEffect(() => {
    if (step !== 2 || resendCountdown <= 0) return;
    const timer = setInterval(() => setResendCountdown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  const handleSendOtp = (data: ForgetPasswordEmailInput) => {
    setErrorMessage('');
    setEmailSent(data.email);
    setStep(2);
    setResendCountdown(RESEND_COUNTDOWN_SECONDS);
  };

  const handleVerifyOtp = (data: ForgetPasswordOtpInput) => {
    setErrorMessage('');
    setStep(3);
  };

  const handleSubmitNewPassword = (data: ForgetPasswordNewInput) => {
    setErrorMessage('');
    onSuccess?.();
    // TODO: gọi API đổi mật khẩu
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(RESEND_COUNTDOWN_SECONDS);
    setErrorMessage('');
    // TODO: gọi API gửi lại OTP
  };

  const cardClass =
    'w-full max-w-md min-w-[454px] rounded-3xl bg-[#00284D] p-8 py-14 shadow-xl';
  const titleClass =
    'text-center font-bold text-[40px] uppercase text-white';
  const inputClass =
    'h-12 rounded-xl border-0 bg-white pl-10 pr-4 text-gray-900 placeholder:text-gray-400';
  const inputPasswordClass =
    'h-12 rounded-xl border-0 bg-white pl-10 pr-12 text-gray-900 placeholder:text-gray-400';
  const buttonClass =
    'h-12 w-full rounded-xl bg-blue-400 font-medium text-white hover:bg-blue-500';
  const linkClass = 'text-gray-300 hover:text-white cursor-pointer';

  return (
    <div className={cardClass}>
      {step === 1 && (
        <>
          <h1 className={titleClass}
          >
            Quên mật khẩu
          </h1>
          <Form {...formEmail}>
            <form
              onSubmit={formEmail.handleSubmit(handleSendOtp)}
              className="mt-8 space-y-5"
            >
              {errorMessage && (
                <div className="rounded-md bg-red-500/20 p-3 text-center  text-sm text-red-200">
                  {errorMessage}
                </div>
              )}
              <FormField
                control={formEmail.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Nhập email của bạn"
                          className={inputClass}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <Button type="submit" className={buttonClass}>
                Gửi OTP
              </Button>
              <div className="pt-2 text-center text-sm">
                {onBack ? (
                  <button type="button" onClick={onBack} className={linkClass}>
                    Quay lại
                  </button>
                ) : (
                  <Link href="/" className={linkClass}>
                    Quay lại
                  </Link>
                )}
              </div>
            </form>
          </Form>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className={titleClass} >
            Quên mật khẩu
          </h1>
          <p className="mt-2 text-center text-sm text-gray-400">
            Mã OTP đã gửi đến {emailSent}
          </p>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-400">Chưa nhận được OTP. </span>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0}
              className={
                resendCountdown > 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-blue-400 hover:text-blue-300 cursor-pointer'
              }
            >
              Gửi lại ({resendCountdown}s)
            </button>
          </div>
          <Form {...formOtp}>
            <form
              onSubmit={formOtp.handleSubmit(handleVerifyOtp)}
              className="mt-4 space-y-5"
            >
              {errorMessage && (
                <div className="rounded-md bg-red-500/20 p-3 text-center text-sm text-red-200">
                  {errorMessage}
                </div>
              )}
              <FormField
                control={formOtp.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Nhập OTP"
                          className={inputClass}
                          maxLength={8}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <Button type="submit" className={buttonClass}>
                Gửi
              </Button>
              <div className="pt-2 text-center text-sm">
                {onBack ? (
                  <button type="button" onClick={onBack} className={linkClass}>
                    Đăng nhập
                  </button>
                ) : (
                  <Link href="/" className={linkClass}>
                    Đăng nhập
                  </Link>
                )}
              </div>
            </form>
          </Form>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className={titleClass} >
            Nhập mật khẩu mới
          </h1>
          <Form {...formNewPassword}>
            <form
              onSubmit={formNewPassword.handleSubmit(handleSubmitNewPassword)}
              className="mt-8 space-y-5"
            >
              {errorMessage && (
                <div className="rounded-md bg-red-500/20 p-3 text-center text-sm text-red-200">
                  {errorMessage}
                </div>
              )}
              <FormField
                control={formNewPassword.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Nhập mật khẩu mới"
                          className={inputPasswordClass}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <FormField
                control={formNewPassword.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Xác nhận mật khẩu mới"
                          className={inputPasswordClass}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label={
                            showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-300" />
                  </FormItem>
                )}
              />
              <Button type="submit" className={buttonClass}>
                Hoàn thành
              </Button>
              <div className="pt-2 text-center text-sm">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={linkClass}
                >
                  Quay lại
                </button>
              </div>
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
