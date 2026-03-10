'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/features/auth/LoginForm';
import RegisterForm from '@/features/auth/RegisterForm';
import FormForgetPassword from '@/features/auth/FormForgetPassword';
import { AnimatePresence, motion } from 'framer-motion';

import bgMain from '@/asssets/images/bg_main.png';

const BG_WIDTH = 1323.3382568359375;
const BG_HEIGHT = 602;

const formVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98,
    filter: 'blur(4px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { getDefaultRoute } = useAuthorization();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');

  useEffect(() => {
    const q = searchParams.get('mode');
    if (q === 'forgot-password') setMode('forgot-password');
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(getDefaultRoute());
    }
  }, [isAuthenticated, isLoading, getDefaultRoute, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="relative max-w-full shrink-0">
        <Image
          src={bgMain}
          width={BG_WIDTH}
          height={BG_HEIGHT}
          alt=""
          className="object-contain pointer-events-none"
          style={{ width: '100%', height: 'auto' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-md px-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {mode === 'login' && (
                  <LoginForm
                    onSwitchToRegister={() => setMode('register')}
                    onSwitchToForgotPassword={() => setMode('forgot-password')}
                  />
                )}
                {mode === 'register' && (
                  <RegisterForm onSwitchToLogin={() => setMode('login')} embedded />
                )}
                {mode === 'forgot-password' && (
                  <FormForgetPassword
                    onBack={() => setMode('login')}
                    onSuccess={() => setMode('login')}
                    embedded
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
