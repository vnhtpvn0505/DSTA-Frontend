export interface StudentStatCardItem {
  title: string;
  value: number;
  trendPercent: number;
  trendUp: boolean;
  icon: 'users' | 'completed' | 'incomplete';
}

export type StudentResultStatus = 'PASS' | 'PENDING' | 'FAIL';

export interface StudentTableRow {
  id: string;
  studentName: string;
  studentEmail: string;
  mssv: string;
  submittedAt: string; // e.g. "10:20 PM"
  submittedDate: string; // e.g. "12/02/2026"
  score: string; // e.g. "500/1000"
  levelLabel: string; // e.g. "Bậc 3" or "Bảng thống kê"
  result: StudentResultStatus;
}
