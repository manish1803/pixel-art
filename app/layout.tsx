import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pixel Art',
  description: 'A premium, dark-themed pixel art editor and animator built for designers.',
  openGraph: {
    title: 'Pixel Art',
    description: 'A premium, dark-themed pixel art editor and animator built for designers.',
    images: ['/preview.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Art',
    description: 'A premium, dark-themed pixel art editor and animator built for designers.',
    images: ['/preview.png'],
  },
  icons: {
    icon: '/pixel-art.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
