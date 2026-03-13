'use client'

import RoleGuard from '@/components/common/RoleGuard'
import { useAuth } from '@/hooks/useAuth'

const certificates = [
  {
    id: 1,
    title: 'CHỨNG NHẬN NĂNG LỰC SỐ',
    level: 'KHÁ',
    issuedAt: '01/01/2026',
    status: 'Đã cấp chứng nhận',
    isPrimary: true,
  },
  {
    id: 2,
    title: 'CHỨNG NHẬN NĂNG LỰC SỐ',
    level: 'KHÁ',
    issuedAt: '01/01/2026',
    status: 'Đã cấp chứng nhận',
    isPrimary: false,
  },
  {
    id: 3,
    title: 'CHỨNG NHẬN NĂNG LỰC SỐ',
    level: 'KHÁ',
    issuedAt: '01/01/2026',
    status: 'Đã cấp chứng nhận',
    isPrimary: false,
  },
]

export default function CertificatePage() {
  const { user } = useAuth()

  return (
    <RoleGuard allowedRoles={['student', 'admin']}>
      <main className="min-h-screen bg-[#E8F4FF]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-main sm:text-3xl">
              Chứng chỉ của tôi
            </h1>
            {user && (
              <p className="mt-1 text-sm text-gray-500">
                {user.fullName ?? user.email}
              </p>
            )}
          </header>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <article
                key={cert.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="relative flex items-center justify-center bg-main px-6 py-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-safety-orange">
                    <span className="text-3xl text-safety-orange">🏆</span>
                  </div>
                  {cert.isPrimary && (
                    <span className="absolute right-4 top-4 inline-flex items-center rounded-full bg-safety-orange px-2 py-0.5 text-xs font-medium text-white">
                      Mới nhất
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col px-6 pb-6 pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {cert.status}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-safety-orange">
                    {cert.title}
                  </h2>

                  <dl className="mt-4 space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <dt className="font-medium">Cấp độ:</dt>
                      <dd>{cert.level}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Ngày cấp:</dt>
                      <dd>{cert.issuedAt}</dd>
                    </div>
                  </dl>

                  <div className="mt-6">
                    <button
                      type="button"
                      className="flex h-10 w-full items-center justify-center rounded-full border border-main text-sm font-medium text-main transition-colors hover:bg-main hover:text-white"
                    >
                      Tải PDF
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </RoleGuard>
  )
}

