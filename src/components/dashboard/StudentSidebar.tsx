'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import logo from '@/asssets/images/logo.png'
import { LayoutDashboard, History, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

const SIDEBAR_WIDTH = 231
const SYSTEM_NAME = 'Hệ thống đánh giá\nnăng lực số'

const navItems = [
  { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/exam', label: 'Lịch sử bài thi', icon: History },
  { href: '/certificate', label: 'Chứng chỉ', icon: Award },
]

export default function StudentSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 z-30 flex h-screen flex-col bg-white shadow-md"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center justify-center">
            <Image
              src={logo}
              alt="Logo"
              width={160}
              height={113}
              className="object-contain"
              priority
            />
          </div>
          <p className="mt-3 text-center text-xs font-medium leading-tight text-gray-500 whitespace-pre-line">
            {SYSTEM_NAME}
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#FFF1E6] text-safety-orange'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn('h-5 w-5 shrink-0', {
                      'text-safety-orange': isActive,
                    })}
                  />
                  {item.label}
                </div>
                {isActive && (
                  <svg
                    className="h-4 w-4 text-safety-orange"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
