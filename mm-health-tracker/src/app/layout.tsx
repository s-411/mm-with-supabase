import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from '@/lib/context-supabase';
import { LayoutWrapper } from '@/components/LayoutWrapper';
import { ErrorBoundary, DevelopmentErrorDisplay } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: "MM Health Tracker",
  description: "Comprehensive health tracking application with calorie, exercise, and injection management",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-mm-dark text-mm-white" suppressHydrationWarning>
        <ErrorBoundary>
          <AppProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </AppProvider>
          <DevelopmentErrorDisplay />
        </ErrorBoundary>
      </body>
    </html>
  );
}