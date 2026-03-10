'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import logo from '@/asssets/images/logo.png';

const TITLE = 'Hệ thống đánh giá năng lực số trường đại học Nguyễn Trãi';

const Loading = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 bg-main">
      {/* Chữ xuất hiện dần từ trái sang phải */}
      <div className="max-w-[932px] w-full overflow-hidden">
        <motion.h1
          className="text-center font-medium text-white max-w-[932px] text-5xl"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {TITLE}
        </motion.h1>
      </div>

      {/* Logo với hiệu ứng loé sáng từ trái sang phải */}
      <div className="relative mt-[169px] h-[330px] w-[465px] shrink-0 overflow-hidden">
        <Image
          src={logo}
          alt="Đại học Nguyễn Trãi"
          fill
          sizes="(max-width: 768px) 100vw, 465px"
          className="object-contain pointer-events-none"
          priority
        />
        <div
          className="animate-logo-shine absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(105deg, transparent 0%, transparent 35%, rgba(255,255,255,0.25) 50%, transparent 65%, transparent 100%)',
            width: '60%',
          }}
        />
      </div>
    </div>
  );
};

export default Loading;
