import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Transformeer je <span className="text-blue-200">voicemail</span> met AI
              </h1>
              <p className="mt-6 text-xl text-blue-100 max-w-3xl">
                Onze AI-gestuurde voicemail oplossing bespaart tijd, verbetert communicatie en maakt voicemail eindelijk nuttig.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50 md:text-lg"
                >
                  Gratis proberen
                </Link>
                <Link
                  href="/demo"
                  className="px-8 py-3 border border-blue-300 text-base font-medium rounded-md text-white hover:bg-blue-800 hover:bg-opacity-20 md:text-lg"
                >
                  Demo bekijken
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-96 w-full rounded-lg shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 opacity-75 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-sm w-full">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Voicemail Bericht</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-300">Zojuist ontvangen</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        &quot;Hallo, ik bel over de afspraak van morgen. Kunnen we deze verzetten naar 15:00 uur? Bel me terug op dit nummer.&quot;
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Vandaag, 10:23</span>
                        <div className="flex space-x-2">
                          <button className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                            </svg>
                          </button>
                          <button className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">Functies</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Waarom kiezen voor VoicemailAI?
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
              Onze geavanceerde AI-technologie maakt voicemail eindelijk nuttig en efficiënt.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <div className="h-12 w-12 rounded-md bg-blue-500 text-white flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tijdbesparend</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Geen tijd meer verspillen aan het beluisteren van lange voicemails. Ontvang direct de belangrijkste informatie.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <div className="h-12 w-12 rounded-md bg-green-500 text-white flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Tekst Transcriptie</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Voicemails worden automatisch omgezet naar tekst, zodat je ze snel kunt lezen in plaats van beluisteren.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg">
                <div className="h-12 w-12 rounded-md bg-purple-500 text-white flex items-center justify-center mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Slimme Acties</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Onze AI herkent automatisch actiepunten en kan deze toevoegen aan je agenda of takenlijst.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Wat onze klanten zeggen
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-12 w-12 text-blue-500" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    &quot;VoicemailAI heeft mijn werkdag compleet veranderd. Ik hoef geen tijd meer te verspillen aan het beluisteren van voicemails en mis nooit meer belangrijke informatie.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Martijn de Vries</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Marketing Manager, TechCorp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-12 w-12 text-blue-500" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    &quot;Als klein bedrijf hebben we niet altijd iemand beschikbaar om de telefoon op te nemen. VoicemailAI zorgt ervoor dat we toch professioneel overkomen en geen klanten mislopen.&quot;
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Laura Jansen</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Eigenaar, Bloemenwinkel Flora</p>
                    </div>
                  </div>
                </div>
              </div>
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
