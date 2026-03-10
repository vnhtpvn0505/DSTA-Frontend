'use client';

import RoleGuard from '@/components/common/RoleGuard';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import AdminHeader from '@/components/dashboard/AdminHeader';

const SIDEBAR_WIDTH = 231;

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#f0f4f8] font-sans antialiased">
        <AdminSidebar />
        <main
          className="flex min-h-screen flex-col transition-[margin]"
          style={{ marginLeft: SIDEBAR_WIDTH }}
        >
          <AdminHeader />
          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
