import { Inter } from 'next/font/google';
import './globals.css';
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import AuthSessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Choice E-Learning',
  description: 'Online learning platform for everyone',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <AuthSessionProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthSessionProvider>
      </body>
    </html>
  );
}