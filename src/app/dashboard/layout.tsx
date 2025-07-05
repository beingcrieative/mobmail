import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Dashboard | VoicemailAI',
  description: 'Beheer je VoicemailAI account en instellingen',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
} 