'use client'

import StudentSidebar from './StudentSidebar'
import StudentHeader from './StudentHeader'

const SIDEBAR_WIDTH = 231

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
