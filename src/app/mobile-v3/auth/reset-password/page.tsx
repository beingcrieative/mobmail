import MobileResetPasswordForm from '@/components/mobile-v3/auth/MobileResetPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wachtwoord resetten | VoicemailAI Mobile',
  description: 'Stel je nieuwe wachtwoord in voor VoicemailAI',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function MobileResetPasswordPage() {
  return <MobileResetPasswordForm />;
}