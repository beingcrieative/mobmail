'use client';

import Link from 'next/link';
import ElevenLabsWidget from '@/components/demo/ElevenLabsWidget';
import { useEffect, useState } from 'react';

export default function DemoPage() {
  const [showElevenLabs, setShowElevenLabs] = useState(false);
  
  useEffect(() => {
    // Check environment variable for ElevenLabs widget toggle
    const enableElevenLabs = process.env.NEXT_PUBLIC_ENABLE_ELEVENLABS_CHAT === 'true';
    setShowElevenLabs(enableElevenLabs);
  }, []);
  
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-blue-600 dark:bg-blue-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ervaar VoicemailAI in actie
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              Bekijk onze interactieve demo en ontdek hoe VoicemailAI je voicemail ervaring kan transformeren.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
              Interactieve Demo
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Zie hoe VoicemailAI werkt
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Volg de stappen hieronder om onze demo te ervaren.
            </p>
          </div>

          <div className="mt-16">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">VoicemailAI Demo</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Interactieve simulatie</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Stap 1: Ontvang een voicemail</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Jan de Vries</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Vandaag, 10:23</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">0:42</span>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                          Afspelen
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Stap 2: Ontvang transcriptie en samenvatting</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Transcriptie</h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          &quot;Hallo, met Jan de Vries hier. Ik bel over de afspraak die we hebben staan voor morgen om 10:00 uur. Ik moet deze helaas verzetten vanwege een onverwachte vergadering. Zou het mogelijk zijn om de afspraak te verplaatsen naar 15:00 uur? Laat me weten of dit lukt. Je kunt me terugbellen op dit nummer. Alvast bedankt en tot morgen hopelijk!&quot;
                        </p>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">AI Samenvatting</h5>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Jan de Vries wil de afspraak van morgen 10:00 verzetten naar 15:00 uur.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Stap 3: Acties ondernemen</h4>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Terugbellen
                        </button>
                        <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Afspraak verzetten
                        </button>
                        <button className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          E-mail sturen
                        </button>
                        <button className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 flex items-center">
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          SMS sturen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ElevenLabs AI Assistant Widget */}
                {process.env.NEXT_PUBLIC_ENABLE_ELEVENLABS_CHAT === 'true' && (
                  <ElevenLabsWidget />
                )}

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Dit is een gesimuleerde demo. In een echte omgeving zou je voicemails ontvangen, transcripties bekijken en acties ondernemen via je dashboard.
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Gratis proberen
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Waarom kiezen voor VoicemailAI?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Ontdek de voordelen van onze AI-gestuurde voicemail oplossing.
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tijdbesparend</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bespaar tot 80% van de tijd die je normaal besteedt aan het beluisteren van voicemails. Lees transcripties en samenvattingen in een fractie van de tijd.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-green-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Veilig en privé</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Al je voicemails worden veilig opgeslagen met end-to-end encryptie. Je hebt volledige controle over wie toegang heeft tot je voicemails.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-purple-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Slimme acties</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Onze AI herkent automatisch actiepunten in voicemails en kan deze toevoegen aan je agenda of takenlijst. Mis nooit meer een belangrijke afspraak.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Klaar om te beginnen?</span>
            <span className="block text-blue-200">Probeer VoicemailAI vandaag nog.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
              >
                Gratis proberen
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-700"
              >
                Contact opnemen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 