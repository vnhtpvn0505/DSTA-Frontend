export type UserRole = 'student' | 'admin'

/** Sub-classification of an Admin-role account. Null/undefined = plain admin. */
export type AdminType = 'admin' | 'teacher' | 'reviewer'

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
  adminType?: AdminType | null
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
  /** Teacher = soạn bài luyện tập; Reviewer = thẩm định. Only set when role is admin. */
  adminType?: AdminType | null
}
