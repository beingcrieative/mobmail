import MobileLoginForm from '@/components/mobile-v3/auth/MobileLoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inloggen | VoicemailAI Mobile',
  description: 'Log in op je VoicemailAI account',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function MobileLoginPage() {
  return <MobileLoginForm />;
}