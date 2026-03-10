import axiosInstance from '@/lib/axios'
import type { User, UserProfile } from '@/types/user'
import type { LoginInput, RegisterInput } from './auth.schema'

export type RegisterV1Payload = {
  username: string;
  password: string;
  firstName: string;
  email: string;
  className: string;
  avatar: string;
  dateOfBirth: string;
  school: string;
  faculty: string;
  universityName: string;
  facultyName: string;
  phoneNumber: string;
};

function profileToUser(p: UserProfile): User {
  return {
    id: String(p.id),
    email: p.email || p.username,
    role: p.role ?? 'student',
    schoolId: p.school || '',
    classId: p.className || undefined,
    firstName: p.firstName,
    avatar: p.avatar,
    universityName: p.universityName,
    facultyName: p.facultyName,
    studentId: p.username,
  }
}

export const authService = {
  // Get user profile (after login, cookie-based)
  getProfile: async (): Promise<User> => {
    const response = await axiosInstance.get<{ data: UserProfile }>('/user/profile')
    const profile = response.data.data ?? response.data
    return profileToUser(profile as UserProfile)
  },

  // Alias for useAuth hook compatibility
  getMe: async (): Promise<User> => {
    return authService.getProfile()
  },

  // Login — backend expects { username, password } where username = email
  login: async (data: LoginInput): Promise<unknown> => {
    const response = await axiosInstance.post('/auth/login', {
      email: data.email,
      password: data.password,
    })
    return response.data
  },

  // Refresh token (cookie-based, no body needed)
  refresh: async (): Promise<void> => {
    await axiosInstance.post('/auth/refresh')
  },

  // Register
  register: async (data: RegisterInput | RegisterV1Payload): Promise<unknown> => {
    // Support both old UI payload (RegisterInput) and backend v1 payload.
    const payload: RegisterV1Payload = 'fullName' in data
      ? {
          username: '',
          password: data.password ?? '',
          firstName: data.fullName ?? '',
          email: data.email ?? '',
          className: '',
          avatar: '',
          dateOfBirth: '',
          school: '',
          faculty: '',
          universityName: '',
          facultyName: '',
          phoneNumber: '',
        }
      : {
          username: data.username ?? '',
          password: data.password ?? '',
          firstName: data.firstName ?? '',
          email: data.email ?? '',
          className: data.className ?? '',
          avatar: data.avatar ?? '',
          dateOfBirth: data.dateOfBirth ?? '',
          school: data.school ?? '',
          faculty: data.faculty ?? '',
          universityName: data.universityName ?? '',
          facultyName: data.facultyName ?? '',
          phoneNumber: data.phoneNumber ?? '',
        };

    const response = await axiosInstance.post('/auth/register', payload);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};
