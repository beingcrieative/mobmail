import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Functies | VoicemailAI',
  description: 'Ontdek alle functies van VoicemailAI en hoe ze je helpen tijd te besparen en communicatie te verbeteren',
  keywords: 'voicemail ai functies, ai voicemail transcriptie, voicemail naar tekst, voicemail assistent',
};

export default function FeaturesPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-blue-600 dark:bg-blue-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Alle functies van VoicemailAI
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              Ontdek hoe onze AI-gestuurde voicemail oplossing je communicatie transformeert en je tijd bespaart.
            </p>
          </div>
        </div>
      </div>

      {/* Main Features Section */}
      <div className="py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
              Kernfuncties
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Maak voicemail eindelijk nuttig
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Onze geavanceerde AI-technologie maakt voicemail eindelijk nuttig en efficiënt.
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
              <div className="relative">
                <div className="relative h-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 lg:aspect-w-1 lg:aspect-h-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-75"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Tekst Transcriptie</h3>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Voicemails worden automatisch omgezet naar tekst, zodat je ze snel kunt lezen in plaats van beluisteren. Onze geavanceerde AI-technologie zorgt voor nauwkeurige transcripties, zelfs bij achtergrondgeluid of verschillende accenten.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 lg:aspect-w-1 lg:aspect-h-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 opacity-75"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white">AI-samenvatting</h3>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Onze AI analyseert de inhoud van voicemails en geeft je een beknopte samenvatting van het bericht. Je krijgt direct de belangrijkste informatie zonder de hele voicemail te hoeven beluisteren of lezen.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="relative h-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 lg:aspect-w-1 lg:aspect-h-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 opacity-75"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-center">
                      <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white">Slimme Acties</h3>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-gray-600 dark:text-gray-300">
                    Onze AI herkent automatisch actiepunten in voicemails en kan deze toevoegen aan je agenda of takenlijst. Mis nooit meer een belangrijke afspraak of deadline die in een voicemail wordt genoemd.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Features */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Meer geavanceerde functies
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
              Ontdek alle mogelijkheden die VoicemailAI te bieden heeft
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Slimme notificaties</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ontvang direct een melding met de transcriptie en samenvatting via e-mail of SMS. Je kunt zelf instellen hoe en wanneer je notificaties wilt ontvangen.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-green-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aanpasbare instellingen</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Pas de service aan jouw behoeften aan met uitgebreide configuratiemogelijkheden. Stel in hoe je voicemails worden verwerkt, opgeslagen en doorgestuurd.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-purple-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Geavanceerde analyses</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Krijg inzicht in je voicemail patronen met gedetailleerde analyses. Zie wie het meest belt, op welke tijden en over welke onderwerpen.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-red-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Integraties</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Integreer VoicemailAI naadloos met je bestaande tools zoals Slack, Microsoft Teams, Google Workspace en meer. Werk efficiënter door alles op één plek te hebben.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-yellow-500 text-white flex items-center justify-center mb-4">
                {/*<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>*/}
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M3 4.5v15a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V4.5a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 003 4.5zm9 7.5h5.25m-5.25 3h5.25" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Agendabeheer</h3>
              <p className="text-gray-600 dark:text-gray-300">
                 Laat je digitale assistant je agenda beheren, zodat jij je tijd kunt besteden aan de belangrijke dingen!"
              </p>
            </div>

            <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg p-6">
              <div className="h-12 w-12 rounded-md bg-indigo-500 text-white flex items-center justify-center mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Meertalige ondersteuning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                VoicemailAI ondersteunt meerdere talen, waaronder Nederlands, Engels, Frans, Duits en Spaans. Ontvang nauwkeurige transcripties in de taal van de voicemail.
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