"use client";

import { toast } from 'react-toastify';
import { ReactNode } from 'react';

interface ChatButtonProps {
  children: ReactNode;
}

export default function ChatButton({ children }: ChatButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.info('De live chat is tijdelijk niet beschikbaar. Stuur ons een e-mail via info@voicemailai.nl');
  };

  return (
    <button
      onClick={handleClick}
      className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
    >
      {children}
    </button>
  );
} 