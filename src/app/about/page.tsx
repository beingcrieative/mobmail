import React from 'react';

export const metadata = {
  title: 'Over ons',
  description: 'Leer meer over ons team en onze missie',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Over ons</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Wij zijn twee vrienden met een gedeelde passie voor automatisering en het oplossen van complexe problemen. Wat begon als een gezamenlijke interesse is uitgegroeid tot een missie: bedrijven en individuen helpen om slimmer, efficiënter en effectiever te werken.
        </p>
        
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Wij zien elke uitdaging als een kans om innovatieve en creatieve oplossingen te bedenken. Of het nu gaat om het automatiseren van repetitieve processen, het verbeteren van workflows of het ontwikkelen van op maat gemaakte systemen, wij zetten ons volledig in om onze klanten te helpen groeien.
        </p>
        
        <h2 className="text-2xl font-semibold mt-10 mb-6 text-gray-900 dark:text-white">Onze kernwaarden</h2>
        
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="flex items-center text-xl font-medium text-gray-900 dark:text-white mb-3">
              <span className="text-blue-500 mr-2">🔹</span>
              Uitdaging
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Wij houden van complexe vraagstukken en technische puzzels. Hoe ingewikkelder het probleem, hoe gemotiveerder we zijn om de beste oplossing te vinden. Geen uitdaging is te groot; we denken in mogelijkheden, niet in beperkingen.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="flex items-center text-xl font-medium text-gray-900 dark:text-white mb-3">
              <span className="text-blue-500 mr-2">🔹</span>
              Klantgerichtheid
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Jouw behoefte staat bij ons centraal. We luisteren, analyseren en ontwikkelen oplossingen die écht aansluiten bij jouw situatie. We streven naar langdurige samenwerkingen waarin we continu waarde blijven toevoegen.
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="flex items-center text-xl font-medium text-gray-900 dark:text-white mb-3">
              <span className="text-blue-500 mr-2">🔹</span>
              Creativiteit
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              Standaardoplossingen zijn niet altijd de beste. Wij denken buiten de gebaande paden en combineren technologie met inventiviteit om innovatieve en efficiënte systemen te creëren die het verschil maken.
            </p>
          </div>
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            Benieuwd wat wij voor jou kunnen betekenen? Neem gerust contact op!
          </p>
          <div className="mt-6">
            <a 
              href="/contact" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Contact opnemen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 