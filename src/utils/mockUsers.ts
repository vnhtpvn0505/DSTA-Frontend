import { User } from '@/types/user';

/**
 * Mock users for testing authorization without API
 * Use these in development to test different role access
 */

export const MOCK_USERS: Record<string, User> = {
  student: {
    id: 'student-001',
    email: 'student@test.com',
    role: 'student',
    schoolId: 'school-001',
    classId: 'class-10a',
  },
  admin: {
    id: 'admin-001',
    email: 'admin@test.com',
    role: 'admin',
    schoolId: 'school-001',
  },
};

/**
 * Helper để get mock user theo role
 */
export function getMockUser(role: 'student' | 'admin'): User {
  return MOCK_USERS[role];
}

/**
 * CÁCH SỬ DỤNG:
 * 
 * Trong useAuth hook hoặc LoginForm component, 
 * thay vì gọi API, bạn có thể dùng:
 * 
 * // Test với Student
 * setUser(getMockUser('student'));
 * 
 * // Test với Admin
 * setUser(getMockUser('admin'));
 * 
 * Ví dụ trong LoginForm:
 * 
 * const handleLogin = (email: string) => {
 *   if (email.includes('student')) {
 *     setUser(getMockUser('student'));
 *   } else if (email.includes('admin')) {
 *     setUser(getMockUser('admin'));
 *   }
 * };
 */
