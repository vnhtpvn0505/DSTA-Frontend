'use client'

import { useAuth } from '@/hooks/useAuth'
import Loading from '@/components/common/Loading'
import AdminDashboardLayout from '@/components/dashboard/AdminDashboardLayout'
import StudentDashboardLayout from '@/components/dashboard/StudentDashboardLayout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return null
  }

  if (user?.role === 'admin') {
    return <AdminDashboardLayout>{children}</AdminDashboardLayout>
  }

  return <StudentDashboardLayout>{children}</StudentDashboardLayout>
}
