'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface StudentProfileCardProps {
  name: string
  studentId: string
  faculty: string
  avatarUrl?: string
}

export default function StudentProfileCard({
  name,
  studentId,
  faculty,
  avatarUrl,
}: StudentProfileCardProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(-2)
    .toUpperCase()

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
      <div className="flex items-center gap-5">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-100"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-main to-semantic-info text-lg font-bold text-white ring-2 ring-gray-100">
            {initials}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-main">
            Xin chào, {name}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            MSSV: {studentId} | Khoa: {faculty}
          </p>
        </div>
      </div>

      <Link href="/exam">
        <Button className="bg-main text-white hover:bg-[#002244] rounded-xl px-6 h-11">
          Làm bài thi đánh giá năng lực số
        </Button>
      </Link>
    </div>
  )
}
