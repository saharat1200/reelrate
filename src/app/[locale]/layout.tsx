import type { Metadata, Viewport } from "next";
import { Inter } from 'next/font/google'
import '../globals.css'
import '../responsive-fix.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Header } from '@/components/layout/Header'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { UpdateNotification } from '@/components/pwa/UpdateNotification'
import { NetworkStatus } from '@/components/pwa/NetworkStatus'
import { OfflineBanner } from '@/components/ui/offline-banner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { NotificationProvider } from '@/contexts/NotificationContext'
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import ResizeHandler from '@/components/ResizeHandler';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "ReelRate - รีวิวหนังและอนิเมะ",
  description: "แพลตฟอร์มรีวิวหนังและอนิเมะที่ดีที่สุด",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ReelRate",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "ReelRate",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#3b82f6',
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <NotificationProvider>
              <ErrorBoundary>
                <ResizeHandler>
                  <div className="min-h-screen flex flex-col">
                    <OfflineBanner />
                    <NetworkStatus />
                    <UpdateNotification />
                    <Header />
                    <main className="flex-1 pb-16 md:pb-0">
                      {children}
                    </main>
                    <BottomNavigation />
                    <InstallPrompt />
                    <Toaster 
                      position="top-center"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
                  </div>
                </ResizeHandler>
              </ErrorBoundary>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
    </NextIntlClientProvider>
  );
}