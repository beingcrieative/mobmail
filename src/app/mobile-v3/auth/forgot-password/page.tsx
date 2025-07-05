import MobileForgotPasswordForm from '@/components/mobile-v3/auth/MobileForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wachtwoord vergeten | VoicemailAI Mobile',
  description: 'Reset je wachtwoord voor VoicemailAI',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function MobileForgotPasswordPage() {
  return <MobileForgotPasswordForm />;
}