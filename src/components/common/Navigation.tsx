'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAuthorization } from '@/hooks/useAuthorization';
import { usePathname } from 'next/navigation';
import { authService } from '@/features/auth/auth.service';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';

interface NavLink {
  href: string;
  label: string;
  roles: ('student' | 'admin')[];
}

const navLinks: NavLink[] = [
  { href: '/dashboard', label: 'Trang chủ', roles: ['student', 'admin'] },
  { href: '/exam', label: 'Thi', roles: ['student', 'admin'] },
  { href: '/certificate', label: 'Chứng chỉ', roles: ['student', 'admin'] },
  { href: '/reports', label: 'Báo cáo', roles: ['admin'] },
  { href: '/dashboard', label: 'Quản trị', roles: ['admin'] },
];

export default function Navigation() {
  const { user } = useAuth();
  const { isAdmin, isStudent } = useAuthorization();
  const pathname = usePathname();
  const router = useRouter();
  const { clearUser } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const handleLogout = () => {
    // Navigate first to avoid flash
    router.replace('/');
    // Then clear user after navigation starts
    setTimeout(() => {
      clearUser();
      queryClient.invalidateQueries({ queryKey: ['me'] });
    }, 0);
  };

  const canAccessLink = (link: NavLink) => {
    if (!user) return false;
    return link.roles.includes(user.role);
  };

  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-purple-100 text-purple-800';
    if (isStudent) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Quản trị viên';
    if (isStudent) return 'Học sinh';
    return 'Guest';
  };

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Hệ thống Giáo dục
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => {
                if (!canAccessLink(link)) return null;
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">
                    {user.email}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor()}`}
                  >
                    {getRoleLabel()}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  variant="destructive"
                  size="default"
                >
                  {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="space-y-1 pb-3 pt-2">
          {navLinks.map((link) => {
            if (!canAccessLink(link)) return null;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
