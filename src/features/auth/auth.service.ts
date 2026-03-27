import axiosInstance, { SKIP_AUTH_REDIRECT } from '@/lib/axios'
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

/**
 * Map backend role to frontend role.
 * Backend: "user" | "admin" → Frontend: "student" | "admin"
 * - admin → admin (Admin dashboard)
 * - user / student / other → student (Student dashboard)
 */
function mapRole(backendRole: string | undefined): import('@/types/user').UserRole {
  const role = String(backendRole || '').trim().toLowerCase()
  return role === 'admin' ? 'admin' : 'student'
}

function rawToUser(raw: Record<string, unknown>): User | null {
  const id =
    raw.id ??
    raw.userId ??
    raw._id ??
    raw.uid ??
    raw.sub ??
    raw.user ??
    undefined

  const email = raw.email ?? raw.username ?? raw.userEmail ?? raw.mail
  const backendRole = raw.role ?? raw.userRole ?? raw.accountRole

  // If we can't identify the user at all, don't return a fake user.
  if (id == null && email == null) return null

  return {
    id: id != null ? String(id) : '0',
    email: email != null ? String(email) : '',
    role: mapRole(typeof backendRole === 'string' ? backendRole : backendRole == null ? undefined : String(backendRole)),
    schoolId: (raw.school ?? raw.schoolId ?? '') as string,
    classId: (raw.className ?? raw.classId) != null ? String(raw.className ?? raw.classId) : undefined,
    firstName:
      raw.firstName != null
        ? String(raw.firstName)
        : raw.fullName != null
          ? String(raw.fullName)
          : raw.name != null
            ? String(raw.name)
            : undefined,
    avatar: raw.avatar != null ? String(raw.avatar) : undefined,
    universityName: raw.universityName != null ? String(raw.universityName) : undefined,
    facultyName: raw.facultyName != null ? String(raw.facultyName) : undefined,
    studentId:
      raw.studentId != null
        ? String(raw.studentId)
        : raw.username != null
          ? String(raw.username)
          : undefined,
  }
}

export function profileToUser(p: UserProfile): User {
  return {
    id: String(p.id),
    email: p.email || p.username,
    role: mapRole(p.role),
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
    const getProfileOnce = async (): Promise<User> => {
      const response = await axiosInstance.get<{ data: UserProfile }>(
        '/user/profile',
        {
          // Prevent global 401 redirect so we can handle refresh/retry here
          [SKIP_AUTH_REDIRECT]: true,
        } as Parameters<typeof axiosInstance.get>[1],
      )
      const profile = response.data.data ?? response.data
      return profileToUser(profile as UserProfile)
    }

    try {
      return await getProfileOnce()
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      // If access session is expired, try refresh cookie/token then retry once.
      if (status === 401) {
        await axiosInstance.post('/auth/refresh', undefined, {
          [SKIP_AUTH_REDIRECT]: true,
        } as Parameters<typeof axiosInstance.post>[2])
        return await getProfileOnce()
      }
      throw err
    }
  },

  // Alias for useAuth hook compatibility
  getMe: async (): Promise<User> => {
    return authService.getProfile()
  },

  // Login — POST /auth/login with { email, password }
  // Returns full response; may include user in data/user
  login: async (data: LoginInput) => {
    const response = await axiosInstance.post<Record<string, unknown>>('/auth/login', {
      email: data.email,
      password: data.password,
    })
    // If backend returns access token in body (JWT/Bearer), persist it for axios interceptor.
    if (typeof window !== 'undefined') {
      const raw = response.data as Record<string, unknown>
      const candidate =
        raw?.accessToken ??
        raw?.access_token ??
        raw?.token ??
        raw?.jwt ??
        (raw?.data as Record<string, unknown> | undefined)?.accessToken ??
        (raw?.data as Record<string, unknown> | undefined)?.access_token ??
        (raw?.data as Record<string, unknown> | undefined)?.token ??
        (raw?.data as Record<string, unknown> | undefined)?.jwt
      if (candidate != null) {
        window.localStorage.setItem('vnt-access-token', String(candidate))
      }
    }
    return response.data
  },

  // Extract user from login response (data.user, data, user, or root)
  getUserFromLoginResponse: (loginData: Record<string, unknown> | null | undefined): User | null => {
    if (!loginData) return null
    const data = loginData.data as Record<string, unknown> | undefined
    const raw = data?.user ?? data ?? loginData.user ?? loginData
    if (!raw || typeof raw !== 'object') return null
    return rawToUser(raw as Record<string, unknown>)
  },

  // Refresh token (cookie-based, no body needed)
  refresh: async (): Promise<void> => {
    await axiosInstance.post('/auth/refresh', undefined, {
      [SKIP_AUTH_REDIRECT]: true,
    } as Parameters<typeof axiosInstance.post>[2])
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
