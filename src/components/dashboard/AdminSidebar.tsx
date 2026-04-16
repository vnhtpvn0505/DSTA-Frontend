'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/asssets/images/logo.png';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  FileBarChart,
  Settings,
  ClipboardCheck,
  GraduationCap,
  School,
  BookOpen,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SIDEBAR_WIDTH = 231;
const SYSTEM_NAME = 'Hệ thống đánh giá năng lực số';
const FOOTER_TEXT = 'Admin Portal v1.0';

const navItems = [
  { href: '/dashboard', label: 'Bảng thống kê', icon: LayoutDashboard },
  { href: '/student', label: 'Quản lý sinh viên', icon: Users },
  { href: '/exams', label: 'Quản lý bài thi', icon: FileQuestion },
  { href: '/grading', label: 'Chấm điểm tự luận', icon: ClipboardCheck },
  { href: '/reports', label: 'Báo cáo', icon: FileBarChart },
  { href: '/teachers', label: 'Quản lý giảng viên', icon: GraduationCap },
  { href: '/classes', label: 'Quản lý lớp học', icon: School },
  { href: '/cohorts', label: 'Khoá đào tạo', icon: BookOpen },
  { href: '/exam-periods', label: 'Kỳ thi', icon: CalendarDays },
  { href: '/settings', label: 'Cài đặt', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen w-[280px] flex-col bg-[#00284D] text-white"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="shrink-0 p-6">
          <div className="flex items-center justify-center">
            <Image
              src={logo}
              alt="Logo"
              width={200}
              height={141.94}
              className="object-contain"
            />
          </div>
          <p className="mt-4 text-center text-sm font-medium leading-tight text-white max-w-[149px] mx-auto">
            {SYSTEM_NAME}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-safety-orange'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={
                  cn("h-5 w-5 shrink-0", {
                    "text-safety-orange": isActive
                  })
                } />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 px-6 py-4">
          <p className="text-center text-xs text-gray-400">{FOOTER_TEXT}</p>
        </div>
      </div>
    </aside>
  );
}
