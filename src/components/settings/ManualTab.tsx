"use client";

import { useState } from 'react';

export default function ManualTab() {
  const [expandedManual, setExpandedManual] = useState<string | null>('cal-com');

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Handleidingen
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Hier vind je handleidingen voor verschillende functionaliteiten van VoicemailAI.
        </p>
      </div>

      <div className="space-y-8">
        {/* Cal.com Manual */}
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mr-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Cal.com Integratie
                </h3>
              </div>
              <button 
                onClick={() => setExpandedManual(expandedManual === 'cal-com' ? null : 'cal-com')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm flex items-center"
              >
                {expandedManual === 'cal-com' ? (
                  <>
                    <span>Inklappen</span>
                    <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Uitklappen</span>
                    <svg className="ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Leer hoe je een Cal.com account aanmaakt en integreert met je digitale assistent zodat deze afspraken in je agenda kan inboeken.
            </p>

            {expandedManual === 'cal-com' && (
              <div className="mt-6 border-t border-gray-200 dark:border-gray-600 pt-6">
                <div className="prose prose-blue dark:prose-invert max-w-none">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Cal.com Handleiding
                  </h2>
                  
                  <p className="text-gray-600 dark:text-gray-300">
                    Volg deze stappen om je Cal.com account aan te maken en te integreren met je digitale assistent.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    1. Maak een Cal.com account aan
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Ga naar <a href="https://cal.com/signup" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">cal.com/signup</a> en maak een nieuw account aan.</li>
                    <li>Voltooi het registratieproces en verifieer je e-mailadres.</li>
                    <li>Kies voor het gratis plan of upgrade naar Pro voor extra functionaliteiten.</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    2. Stel een event type in
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Ga naar het "Event Types" tabblad in je Cal.com dashboard.</li>
                    <li>Klik op "New event type" en kies voor "One-on-one".</li>
                    <li>Geef je event een naam, bijvoorbeeld "30 minuten meeting" en stel de duur in op 30 minuten.</li>
                    <li>Geef bij "Slug" de waarde "30min" op.</li>
                    <li>Configureer je beschikbaarheid en sla het event type op.</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    3. Maak een API sleutel aan
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Ga naar "Settings" → "Developer" → "API Keys" in je Cal.com dashboard.</li>
                    <li>Klik op "Create new API key".</li>
                    <li>Geef je API sleutel een naam, bijvoorbeeld "VoicemailAI Integration".</li>
                    <li>Kopieer de gegenereerde API sleutel (je kunt deze later niet meer zien).</li>
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">
                    4. Configureer je VoicemailAI-account
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Ga naar het tabblad "Profiel" in je VoicemailAI-instellingen.</li>
                    <li>Vul bij "Cal.com Gebruikersnaam" je Cal.com gebruikersnaam in (deel van je URL, bijvoorbeeld "johndoe" als je URL cal.com/johndoe is).</li>
                    <li>Vul bij "Cal.com API Sleutel" de API sleutel in die je in stap 3 hebt aangemaakt.</li>
                    <li>Klik op "Get EventId" om je Event Type ID automatisch op te halen.</li>
                    <li>Sla je instellingen op door op "Opslaan" te klikken.</li>
                  </ul>
                  
                  <div className="my-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                    <p className="text-blue-700 dark:text-blue-300">
                      Je digitale assistent kan nu afspraken inplannen in je Cal.com agenda op basis van voicemails die je ontvangt. Zorg ervoor dat alle velden correct zijn ingevuld voor optimale functionaliteit.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for future manuals */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Binnenkort meer handleidingen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 