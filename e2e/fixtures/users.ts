import type { User, UserProfile } from '@/types/user'

/** Backend-shaped profiles (as returned by GET /user/profile). */
export const profiles: Record<'student' | 'admin' | 'teacher' | 'reviewer', UserProfile> = {
  student: {
    id: 101,
    username: 'student01',
    firstName: 'Nguyen Van A',
    email: 'student01@edu.vn',
    className: 'CNTT-K65',
    avatar: '',
    dateOfBirth: '2003-01-01',
    school: 'Truong A',
    faculty: 'CNTT',
    universityName: 'Truong A',
    facultyName: 'CNTT',
    phoneNumber: '0900000001',
    role: 'user' as unknown as UserProfile['role'],
    adminType: null,
  },
  admin: {
    id: 201,
    username: 'admin01',
    firstName: 'Quan Tri Vien',
    email: 'admin01@edu.vn',
    className: '',
    avatar: '',
    dateOfBirth: '1990-01-01',
    school: '',
    faculty: '',
    universityName: '',
    facultyName: '',
    phoneNumber: '0900000002',
    role: 'admin' as unknown as UserProfile['role'],
    adminType: 'admin',
  },
  teacher: {
    id: 202,
    username: 'teacher01',
    firstName: 'Giang Vien',
    email: 'teacher01@edu.vn',
    className: '',
    avatar: '',
    dateOfBirth: '1985-01-01',
    school: '',
    faculty: '',
    universityName: '',
    facultyName: '',
    phoneNumber: '0900000003',
    role: 'admin' as unknown as UserProfile['role'],
    adminType: 'teacher',
  },
  reviewer: {
    id: 203,
    username: 'reviewer01',
    firstName: 'Can Bo Khao Thi',
    email: 'reviewer01@edu.vn',
    className: '',
    avatar: '',
    dateOfBirth: '1985-01-01',
    school: '',
    faculty: '',
    universityName: '',
    facultyName: '',
    phoneNumber: '0900000004',
    role: 'admin' as unknown as UserProfile['role'],
    adminType: 'reviewer',
  },
}

function mapRole(backendRole: string | undefined): User['role'] {
  return String(backendRole || '').trim().toLowerCase() === 'admin' ? 'admin' : 'student'
}

/** Mirrors src/features/auth/auth.service.ts#profileToUser without importing app code into the test bundle. */
export function profileToUser(p: UserProfile): User {
  return {
    id: String(p.id),
    email: p.email || p.username,
    role: mapRole(p.role as unknown as string),
    schoolId: p.school || '',
    classId: p.className || undefined,
    firstName: p.firstName,
    avatar: p.avatar,
    universityName: p.universityName,
    facultyName: p.facultyName,
    studentId: p.username,
    adminType: p.adminType ?? null,
  }
}

export const users: Record<keyof typeof profiles, User> = {
  student: profileToUser(profiles.student),
  admin: profileToUser(profiles.admin),
  teacher: profileToUser(profiles.teacher),
  reviewer: profileToUser(profiles.reviewer),
}

export const FAKE_TOKEN = 'e2e-fake-access-token'
