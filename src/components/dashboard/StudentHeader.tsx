'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { queryClient } from '@/lib/queryClient'
import { authService } from '@/features/auth/auth.service'
import { useMutation } from '@tanstack/react-query'

export default function StudentHeader() {
  const { user } = useAuth()
  const router = useRouter()
  const { clearUser } = useAuthStore()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = user?.email?.split('@')[0] ?? 'Student'
  const displayEmail = user?.email ?? ''

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearUser()
      queryClient.invalidateQueries({ queryKey: ['me'] })
      router.replace('/')
    },
  })

  const handleLogout = () => {
    setOpen(false)
    logoutMutation.mutate()
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-end border-b border-gray-100 bg-white px-6">
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-main to-semantic-info text-sm font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{displayEmail}</p>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
