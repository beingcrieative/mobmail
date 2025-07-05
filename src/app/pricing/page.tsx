import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Prijzen | VoicemailAI',
  description: 'Bekijk onze abonnementen en kies het plan dat bij jouw behoeften past',
  keywords: 'voicemail ai prijzen, voicemail abonnementen, ai voicemail kosten, voicemail service prijzen',
};

export default function PricingPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Eenvoudige en transparante prijzen
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Kies het abonnement dat bij jouw behoeften past. Alle plannen bevatten onze kernfuncties.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Basic Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Basis</h3>
              <div className="mt-4 flex justify-center">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">€19</span>
                <span className="text-xl font-medium text-gray-500 dark:text-gray-400 self-end mb-1">/maand</span>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Perfect voor individuele gebruikers en kleine bedrijven
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-8">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Tot 50 voicemails per maand <span><p>(fair use policy)</p></span></span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Tekst transcriptie</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">E-mail notificaties</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">7 dagen opslag</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">AI-samenvatting</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/register?plan=basic"
                  className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Kies Basis
                </Link>
              </div>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden border-2 border-blue-500 dark:border-blue-400 transform scale-105 z-10 transition-transform duration-300 hover:scale-110">
            <div className="bg-blue-500 dark:bg-blue-600 py-2">
              <p className="text-center text-white text-sm font-semibold uppercase tracking-wide">
                Meest populair
              </p>
            </div>
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Pro</h3>
              <div className="mt-4 flex justify-center">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">€29</span>
                <span className="text-xl font-medium text-gray-500 dark:text-gray-400 self-end mb-1">/maand</span>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Ideaal voor groeiende bedrijven en teams
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-8">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Tot 100 voicemails per maand <span><p>(fair use policy)</p></span></span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Tekst transcriptie</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">E-mail notificaties</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">30 dagen opslag</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">AI-samenvatting</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Agendabeheer</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/register?plan=pro"
                  className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Kies Pro
                </Link>
              </div>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-transform duration-300 hover:scale-105">
            <div className="px-6 py-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">Custom</h3>
              <div className="mt-4 flex justify-center">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white">€??</span>
                <span className="text-xl font-medium text-gray-500 dark:text-gray-400 self-end mb-1">/maand</span>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Voor grote organisaties met specifieke behoeften
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-8">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Alles in Pro</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Onbeperkte opslag</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Geavanceerde integraties</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Aangepaste AI-training</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">Meertalige ondersteuning</span>
                </li>
                {/*<li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-700 dark:text-gray-300">SLA garantie</span>
                </li> */}
              </ul>
              <div className="mt-8">
                <Link
                  href="/register?plan=enterprise"
                  className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Kies Custom
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
            Veelgestelde vragen
          </h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Kan ik van abonnement wisselen?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Ja, je kunt na elke maand upgraden of downgraden.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Is er een gratis proefperiode?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Ja, we bieden een gratis proefperiode van 1 dag voor de basic en pro abonnementen. Je kunt alle functies uitproberen zonder verplichtingen. Neem contact met ons voor de mogelijkheden.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Hoe werkt de facturering?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                We factureren maandelijks. Wij zijn druk bezig om de mogelijkheid tot een jaarlijks facturering toe te voegen. Bij jaarlijkse facturering ontvang je 2 maanden gratis.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Kan ik mijn abonnement opzeggen?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Je kunt je abonnement op elk moment opzeggen. Na opzegging blijft je account actief tot het einde van de huidige factureringsperiode.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Zijn er additionele kosten?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Mogelijk zijn er belkosten voor het doorschakelen, vraag dit na bij je provider.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Zijn er extra kosten voor meer gebruikers?
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Elke gebruiker krijgt een eigen account, dus ook een eigen abonnement.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-24 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Heb je nog vragen?
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ons team staat klaar om al je vragen te beantwoorden en je te helpen het juiste abonnement te kiezen voor jouw behoeften.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Neem contact op
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 