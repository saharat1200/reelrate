'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
              <LogIn className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('loginRequired')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดเนื้อหานี้
            </p>
            <div className="space-y-3">
              <Link href={`/${locale}/auth`} className="w-full">
                <Button className="w-full" size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('loginButton')}
                </Button>
              </Link>
              <Link href={`/${locale}/auth?mode=signup`} className="w-full">
                <Button variant="outline" className="w-full" size="lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('signupButton')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}