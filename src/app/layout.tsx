import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://pixelart-merlin.vercel.app'), // Replace with actual production URL
  title: {
    default: 'Pixel Art Editor',
    template: '%s | Pixel Art Editor',
  },
  description: 'A premium, dark-themed pixel art editor and animator built for designers and artists. Create, animate, and export your pixel art with ease.',
  keywords: ['pixel art', 'editor', 'animator', 'pixel art software', 'dark theme', 'design tools', 'sprite creator'],
  authors: [{ name: 'Pixel Art Team' }],
  creator: 'Pixel Art Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pixelart-editor.vercel.app',
    title: 'Pixel Art Editor',
    description: 'Create and animate stunning pixel art in a premium dark-themed environment.',
    siteName: 'Pixel Art Editor',
    images: [
      {
        url: '/preview.png',
        width: 1200,
        height: 630,
        alt: 'Pixel Art Editor Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Art Editor',
    description: 'Create and animate stunning pixel art in a premium dark-themed environment.',
    creator: '@pixelart_editor',
    images: ['/preview.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="overflow-x-hidden" suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

