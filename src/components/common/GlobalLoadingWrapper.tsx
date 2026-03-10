'use client';

import { useState, useEffect } from 'react';
import SplashLoading from '@/features/auth/Loading';

const GLOBAL_LOADING_DURATION_MS = 1500; // 1.5s – có thể đổi 2000 cho 2s

interface GlobalLoadingWrapperProps {
  children: React.ReactNode;
}

export default function GlobalLoadingWrapper({ children }: GlobalLoadingWrapperProps) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsGlobalLoading(false);
    }, GLOBAL_LOADING_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (isGlobalLoading) {
    return <SplashLoading />;
  }

  return <>{children}</>;
}
