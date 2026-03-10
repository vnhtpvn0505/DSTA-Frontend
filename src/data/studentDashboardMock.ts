import type { CompetencyDomain } from '@/components/dashboard/StudentRadarChart'

export const studentProfileMock = {
  name: 'Trần Văn Bảo',
  studentId: '21501234',
  faculty: 'Công nghệ thông tin',
}

export const studentStatsMock = {
  highestScore: 500,
  maxScore: 1000,
  currentLevel: 'Cơ bản',
  totalAttempts: 3,
}

export const competencyDomainsMock: CompetencyDomain[] = [
  {
    domain: 'Khai thác dữ liệu và thông tin',
    shortLabel: 'Miền 1',
    score: 7,
    maxScore: 10,
    color: '#003562',
  },
  {
    domain: 'Giao tiếp và hợp tác trong môi trường số',
    shortLabel: 'Miền 2',
    score: 9,
    maxScore: 10,
    color: '#0EA5E9',
  },
  {
    domain: 'Sáng tạo nội dung số',
    shortLabel: 'Miền 3',
    score: 3,
    maxScore: 10,
    color: '#A855F7',
  },
  {
    domain: 'An toàn trong môi trường số',
    shortLabel: 'Miền 4',
    score: 8,
    maxScore: 10,
    color: '#F59E0B',
  },
  {
    domain: 'Giải quyết vấn đề và phát triển kỹ năng số',
    shortLabel: 'Miền 5',
    score: 6,
    maxScore: 10,
    color: '#EF4444',
  },
  {
    domain: 'Ứng dụng trí tuệ nhân tạo (AI)',
    shortLabel: 'Miền 6',
    score: 8,
    maxScore: 10,
    color: '#1E3A5F',
  },
]
