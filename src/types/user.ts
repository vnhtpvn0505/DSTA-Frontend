export type UserRole = 'student' | 'admin'

export interface UserProfile {
  id: number
  username: string
  firstName: string
  email: string
  className: string
  avatar: string
  dateOfBirth: string
  school: string
  faculty: string
  universityName: string
  facultyName: string
  phoneNumber: string
  role?: UserRole
}

export interface User {
  id: string
  email: string
  role: UserRole
  schoolId: string
  classId?: string
  firstName?: string
  avatar?: string
  universityName?: string
  facultyName?: string
  studentId?: string
}
