"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ForwardingSettingsProps {
  userId: string;
}

// Get the forwarding number from environment variables
const forwardingNumber = process.env.NEXT_PUBLIC_FORWARDING_NUMBER || process.env.FORWARDING_NUMBER;

export default function ForwardingSettings({ userId }: ForwardingSettingsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
          Doorschakeling
        </h3>
        <p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
          Scan de QR-code om je telefoon door te schakelen naar VoicemailAI.
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 md:gap-10">
            <div className="flex flex-col items-center justify-self-end">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-4">
                <Image 
                  src="/images/qr-code-forwarding.png" 
                  alt="QR code voor doorschakel instructies" 
                  width={240} 
                  height={240}
                  
                />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Activeren</span>
            </div>
            
            <div className="flex flex-col items-center justify-self-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                <Image 
                  src="/images/qr-code-disable-forwarding.png" 
                  alt="QR code voor aanvullende doorschakel instructies" 
                  width={240} 
                  height={240}
                 
                />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Deactiveren</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Doorschakelen met doorschakelcode</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Lukt het doorschakelen van je nummer via de instellingen van je telefoon niet? Dan kun je doorschakelcodes gebruiken in combinatie met het telefoonnummer waar je naar wilt doorschakelen. Deze methode werkt als volgt:
          </p>
          
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Telefoonnummer doorschakelen bij geen gehoor</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Je activeert doorschakelen bij geen gehoor door de code <span className="font-mono font-medium">**61*{forwardingNumber}#</span> in te voeren en op de groene belknop te drukken. Je kunt de code deactiveren door <span className="font-mono font-medium">##61#</span> in te voeren en op de groene belknop te drukken.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Telefoonnummer doorschakelen bij geen bereik</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Je activeert doorschakelen bij geen bereik door de code <span className="font-mono font-medium">**62*{forwardingNumber}#</span> in te voeren en op de groene belknop te drukken. Je kunt de code deactiveren door <span className="font-mono font-medium">##62#</span> in te voeren en op de groene belknop te drukken.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Telefoonnummer doorschakelen als je in gesprek bent</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Je activeert doorschakelen bij in gesprek door de code <span className="font-mono font-medium">**67*{forwardingNumber}#</span> in te voeren en op de groene belknop te drukken. Je kunt de code deactiveren door <span className="font-mono font-medium">##67#</span> in te voeren en op de groene belknop te drukken.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Telefoonnummer altijd doorschakelen</h4>
              <p className="text-gray-700 dark:text-gray-300">
                Je telefoonnummer altijd doorschakelen, doe je door de code <span className="font-mono font-medium">**21*{forwardingNumber}#</span> in te voeren en op de groene belknop te drukken. Je kunt de code deactiveren door <span className="font-mono font-medium">##21#</span> in te voeren en op de groene belknop te drukken.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 