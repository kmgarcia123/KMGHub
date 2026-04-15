// src/app/layout.tsx
import type { Metadata } from 'next';
import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppBot from '@/components/layout/WhatsAppBot';
import QueryProvider from '@/components/layout/QueryProvider';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: { default: 'MugHero — Pocillos de Colección', template: '%s | MugHero' },
  description: 'Los mejores pocillos de superhéroes, anime y videojuegos. DC, Marvel, Dragon Ball y más. Envíos a toda Colombia.',
  keywords: ['pocillos', 'mugs', 'superheroes', 'colombia', 'batman', 'spiderman', 'anime'],
  openGraph: {
    title: 'MugHero — Pocillos de Colección',
    description: 'Los mejores pocillos de tus personajes favoritos',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="bg-dark-900 text-dark-50 font-body antialiased">
        <QueryProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <CartSidebar />
          <WhatsAppBot />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: { background: '#1c1c1c', color: '#f5f2ee', border: '1px solid #3d3d3d' },
              success: { iconTheme: { primary: '#e8c547', secondary: '#0e0e0e' } },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
