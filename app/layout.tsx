/**
 * Root layout cho Next.js App Router
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PageViewTracker } from '@/components/PageViewTracker';
import { ToastContainer } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Học Tập Âm Nhạc Quân Đội',
  description: 'Ứng dụng học tập các bài hát quân đội Việt Nam',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          <AuthProvider>
            <PageViewTracker />
            <Navbar />
            <main className="min-h-screen flex flex-col">{children}</main>
            <Footer />
            <ToastContainer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
