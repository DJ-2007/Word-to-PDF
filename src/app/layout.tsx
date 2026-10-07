import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { APP_CONFIG } from '@/config';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.url),
  title: {
    default: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: APP_CONFIG.description,
  keywords: [
    'file converter',
    'pdf to word',
    'word to pdf',
    'jpg to pdf',
    'merge pdf',
    'compress pdf',
    'csv to excel',
    'universal converter',
  ],
  authors: [{ name: 'Convertly Engineering Team' }],
  creator: 'Convertly',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_CONFIG.url,
    title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    description: APP_CONFIG.description,
    siteName: APP_CONFIG.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
    description: APP_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
