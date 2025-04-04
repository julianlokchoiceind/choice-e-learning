import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Choice E-Learning | Learn Modern Web Development",
  description: "Learn modern web development with practical projects and real-world applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
        style={{ 
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        <Header />
        <main className="flex-grow pt-[44px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
