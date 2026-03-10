'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { ReactNode } from 'react';
import GlobalLoadingWrapper from '@/components/common/GlobalLoadingWrapper';

interface AppProvidersProps {
  children: ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalLoadingWrapper>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </GlobalLoadingWrapper>
    </QueryClientProvider>
  );
}
