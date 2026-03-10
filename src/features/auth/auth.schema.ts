import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Email không hợp lệ')
    .max(100, 'Email không được quá 100 ký tự'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Email phải có đuôi .edu (domain giáo dục)
export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Email không hợp lệ')
      .refine(
        (email) => {
          return email.endsWith('.edu') || email.includes('.edu.');
        },
        {
          message: 'Email phải là email giáo dục (có đuôi .edu)',
        }
      ),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được quá 50 ký tự'),
    confirmPassword: z.string(),
    fullName: z
      .string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ tên không được quá 100 ký tự'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

/** Simplified register: only username + password (for UI) */
export const registerSimpleSchema = z.object({
  username: z
    .string()
    .email('Email không hợp lệ')
    .max(100, 'Email không được quá 100 ký tự'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự'),
});

export type RegisterSimpleInput = z.infer<typeof registerSimpleSchema>;

/** Quên mật khẩu - Bước 1: gửi OTP */
export const forgetPasswordEmailSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});
export type ForgetPasswordEmailInput = z.infer<typeof forgetPasswordEmailSchema>;

/** Quên mật khẩu - Bước 2: xác nhận OTP */
export const forgetPasswordOtpSchema = z.object({
  otp: z.string().min(4, 'OTP không hợp lệ').max(8, 'OTP không hợp lệ'),
});
export type ForgetPasswordOtpInput = z.infer<typeof forgetPasswordOtpSchema>;

/** Quên mật khẩu - Bước 3: mật khẩu mới */
export const forgetPasswordNewSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được quá 50 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
export type ForgetPasswordNewInput = z.infer<typeof forgetPasswordNewSchema>;
