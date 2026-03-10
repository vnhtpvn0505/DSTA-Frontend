import type {
  StatCardData,
  ResultDistributionItem,
  LevelDistributionItem,
  RecentExamRow,
} from '@/types/dashboard';

export const statCardsMock: StatCardData[] = [
  {
    title: 'Tổng sinh viên',
    value: 1250,
    subtitle: '12% so với tháng trước',
  },
  {
    title: 'Bài thi hoàn thành',
    value: 1250,
    subtitle: '12% so với tháng trước',
  },
  {
    title: 'Tổng số học sinh đạt yêu cầu',
    value: 700,
    subtitle: '12% so với tháng trước',
  },
];

export const resultDistributionMock: ResultDistributionItem[] = [
  { name: 'Đạt (>=500)', value: 75, percent: 75, color: '#22c55e' },
  { name: 'Chưa đạt (<500)', value: 25, percent: 25, color: '#ef4444' },
];

export const levelDistributionMock: LevelDistributionItem[] = [
  { level: 'Bậc 1', count: 120 },
  { level: 'Bậc 2', count: 180 },
  { level: 'Bậc 3', count: 220 },
  { level: 'Bậc 4', count: 190 },
  { level: 'Bậc 5', count: 165 },
  { level: 'Bậc 6', count: 140 },
  { level: 'Bậc 7', count: 95 },
  { level: 'Bậc 8', count: 45 },
];

export const recentExamsMock: RecentExamRow[] = [
  {
    id: '1',
    studentName: 'Nguyễn Văn A',
    studentEmail: 'nguyenvana@student.edu.vn',
    studentId: 'SV001',
    completedAt: '28/01/2025 14:32',
    score: 520,
    level: 3,
    result: 'PASS',
  },
  {
    id: '2',
    studentName: 'Trần Thị B',
    studentEmail: 'tranthib@student.edu.vn',
    studentId: 'SV002',
    completedAt: '28/01/2025 13:15',
    score: 480,
    level: 2,
    result: 'FAIL',
  },
  {
    id: '3',
    studentName: 'Lê Văn C',
    studentEmail: 'levanc@student.edu.vn',
    studentId: 'SV003',
    completedAt: '28/01/2025 12:45',
    score: 0,
    level: 0,
    result: 'PENDING',
  },
  {
    id: '4',
    studentName: 'Phạm Thị D',
    studentEmail: 'phamthid@student.edu.vn',
    studentId: 'SV004',
    completedAt: '27/01/2025 16:20',
    score: 610,
    level: 4,
    result: 'PASS',
  },
  {
    id: '5',
    studentName: 'Hoàng Văn E',
    studentEmail: 'hoangvane@student.edu.vn',
    studentId: 'SV005',
    completedAt: '27/01/2025 11:00',
    score: 450,
    level: 2,
    result: 'FAIL',
  },
];
