import { Metadata } from 'next';
import ContactForm from '@/components/contact/ContactForm';
import Link from 'next/link';
import ChatButton from '@/components/contact/ChatButton';

export const metadata: Metadata = {
  title: 'Contact | VoicemailAI',
  description: 'Neem contact op met ons team voor vragen over VoicemailAI of om een demo aan te vragen',
  keywords: 'contact voicemail ai, voicemail ondersteuning, voicemail demo aanvragen, voicemail hulp',
};

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Neem contact op
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
              Heb je vragen over VoicemailAI? Ons team staat klaar om je te helpen. Vul het formulier in of gebruik een van de onderstaande contactmethoden.
            </p>
            <div className="mt-8 space-y-6">
              {/* Phone number section commented out
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500 dark:text-gray-300">
                  <p>+31 (0)20 123 4567</p>
                  <p className="mt-1">Ma-Vr 9:00-17:00</p>
                </div>
              </div>
              */}
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500 dark:text-gray-300">
                  <p>info@voicemailai.nl</p>
                  <p className="mt-1">We reageren binnen 24 uur</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div className="ml-3 text-base text-gray-500 dark:text-gray-300">
                  <p>Live chat</p>
                  <p className="mt-1">
                    <ChatButton>
                      Start een chat met ons team
                    </ChatButton>
                  </p>
                </div>
              </div>
            </div>
            {/* Social media section commented out
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Volg ons</h2>
              <div className="mt-4 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            */}
          </div>
          <div className="mt-12 sm:mt-16 md:mt-0">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Office Location */}
      <div className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto md:max-w-none md:grid md:grid-cols-2 md:gap-8">
          
            {/* Office location section commented out
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Ons kantoor</h2>
              <div className="mt-4">
                <p className="text-lg text-gray-500 dark:text-gray-300">
                  VoicemailAI B.V.
                </p>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  Herengracht 182<br />
                  1016 BR Amsterdam<br />
                  Nederland
                </p>
              </div>
            </div>
            */}
            {/* Opening hours section commented out
            <div className="mt-12 md:mt-0">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Openingstijden</h2>
              <div className="mt-4 space-y-2">
                <p className="text-base text-gray-500 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">Maandag - Vrijdag:</span> 9:00 - 17:00
                </p>
                <p className="text-base text-gray-500 dark:text-gray-300">
                  <span className="font-medium text-gray-900 dark:text-white">Zaterdag - Zondag:</span> Gesloten
                </p>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Veelgestelde vragen
              </h2>
              <p className="mt-4 text-base text-gray-500 dark:text-gray-300">
                Kun je het antwoord op je vraag niet vinden? Neem dan contact met ons op via het formulier.
              </p>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-2">
              <div className="space-y-12">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Hoe snel kan ik aan de slag met VoicemailAI?
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    Je kunt binnen enkele minuten aan de slag. Maak een account aan, kies een abonnement en configureer je instellingen. Onze onboarding-gids helpt je stap voor stap.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Werkt VoicemailAI met mijn bestaande telefoonsysteem?
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    VoicemailAI werkt met de meeste moderne telefoonsystemen. We bieden integraties met populaire VoIP-providers en traditionele telefoonsystemen. Neem contact op voor specifieke compatibiliteitsvragen.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Hoe nauwkeurig zijn de transcripties?
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    Onze AI-technologie biedt een nauwkeurigheid van meer dan 95% voor de meeste voicemails. De nauwkeurigheid kan variëren afhankelijk van factoren zoals achtergrondgeluid, accent en spraakkwaliteit.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Is er technische kennis nodig om VoicemailAI te gebruiken?
                  </h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                    Nee, VoicemailAI is ontworpen om gebruiksvriendelijk te zijn. De meeste klanten kunnen het systeem zelf instellen met onze stap-voor-stap handleiding. Voor complexere integraties bieden we ondersteuning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 