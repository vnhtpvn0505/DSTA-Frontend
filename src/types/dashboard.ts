export interface StatCardData {
  title: string;
  value: number;
  subtitle: string;
}

export interface ResultDistributionItem {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface LevelDistributionItem {
  level: string;
  count: number;
}

export type ExamResultStatus = 'PASS' | 'FAIL' | 'PENDING';

export interface RecentExamRow {
  id: string;
  studentName: string;
  studentEmail: string;
  studentId: string;
  completedAt: string;
  score: number;
  level: number;
  result: ExamResultStatus;
}
