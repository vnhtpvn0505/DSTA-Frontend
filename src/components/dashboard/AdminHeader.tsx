'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import { queryClient } from '@/lib/queryClient';

export default function AdminHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { clearUser } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const displayEmail = user?.email ?? 'admin@university.edu.vn';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    router.replace('/');
    setTimeout(() => {
      clearUser();
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }, 0);
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-end border-b border-gray-200 bg-white px-6 shadow-sm">
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-lg px-1 py-2 hover:bg-gray-50 cursor-pointer"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500">{displayEmail}</p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00284D] text-sm font-semibold text-white"
            aria-hidden
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        </button>

        {open && (
          <div
            className="absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
            role="menu"
          >
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              role="menuitem"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
