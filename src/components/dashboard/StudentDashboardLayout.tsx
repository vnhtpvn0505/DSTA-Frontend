'use client'

import { usePathname } from 'next/navigation'
import StudentSidebar from './StudentSidebar'
import StudentHeader from './StudentHeader'

const SIDEBAR_WIDTH = 231

/** Trang làm bài thi: /exam/:id/take — ẩn sidebar và header để full màn hình */
function isTakeExamPage(pathname: string): boolean {
  return /^\/exam\/[^/]+\/take\/?$/.test(pathname)
}

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const hideSidebar = isTakeExamPage(pathname ?? '')

  if (hideSidebar) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] font-sans antialiased">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#E8F4FF] font-sans antialiased">
      <StudentSidebar />
      <main
        className="flex min-h-screen flex-col transition-[margin]"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <StudentHeader />
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
