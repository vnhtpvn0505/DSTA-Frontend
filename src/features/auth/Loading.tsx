'use client';

import Image from 'next/image';
import logo from '@/asssets/images/logo-white.svg';

const TITLE = 'HỆ THỐNG ĐÁNH GIÁ\nNĂNG LỰC SỐ';

const Loading = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center px-6 bg-main">
      <div className="max-w-[932px] w-full">
        <h1 className="text-center font-medium text-white max-w-[932px] text-5xl">{TITLE}</h1>
      </div>

      <div className="relative mt-28 h-[min(48vh,480px)] w-[min(96vw,680px)] shrink-0 sm:mt-32 sm:h-[500px] sm:w-[720px]">
        <Image
          src={logo}
          alt="Đại học UMT"
          fill
          sizes="(max-width: 768px) 96vw, 720px"
          className="object-contain pointer-events-none"
          priority
        />
      </div>
    </div>
  );
};

export default Loading;
