import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookieBanner from '@/components/layout/CookieBanner';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VoicemailAI - Intelligente Voicemail Oplossingen',
  description: 'Transformeer je voicemail ervaring met AI-gestuurde oplossingen die tijd besparen en communicatie verbeteren.',
  keywords: 'voicemail, ai, kunstmatige intelligentie, spraakherkenning, voicemail assistent, voicemail naar tekst',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <ToastContainer position="bottom-right" />
          <CookieBanner />
        </div>
      </body>
    </html>
  );
}