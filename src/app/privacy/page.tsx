import React from 'react';

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for our service',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacybeleid</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Laatst bijgewerkt: 12 maart 2025</p>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">1. Inleiding</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Welkom bij voicemailAI. Wij hechten veel waarde aan uw privacy en de bescherming van uw persoonlijke gegevens. 
          In dit privacybeleid leggen we uit welke gegevens we verzamelen, hoe we deze gebruiken en welke rechten u heeft met betrekking tot uw gegevens.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">2. Welke gegevens verzamelen wij?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Wij kunnen de volgende gegevens verzamelen:</p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
          <li>Persoonlijke identificatiegegevens (zoals naam, e-mailadres, telefoonnummer)</li>
          <li>Gebruiksgegevens (call detail records)</li>
          <li>Betaalgegevens (indien van toepassing, voor aankopen en abonnementen)</li>
          <li>Cookies en trackinggegevens voor analytische doeleinden</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">3. Hoe gebruiken wij uw gegevens?</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Wij gebruiken uw gegevens om:</p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
          <li>De dienst te leveren en te verbeteren</li>
          <li>Klantenservice te bieden</li>
          <li>Betalingen te verwerken</li>
          <li>Marketing en communicatie uit te voeren (indien u hiermee akkoord bent gegaan)</li>
          <li>De beveiliging en functionaliteit van onze dienst te waarborgen</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">4. Delen van gegevens met derden</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">Wij delen uw gegevens alleen met derden in de volgende gevallen:</p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
          <li>Wanneer dit noodzakelijk is voor het leveren van onze dienst (bijvoorbeeld betalingsverwerkers)</li>
          <li>Wanneer wij wettelijk verplicht zijn dit te doen</li>
          <li>Met uw expliciete toestemming</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">5. Hoe beschermen wij uw gegevens?</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beschermen tegen verlies, misbruik en ongeautoriseerde toegang.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">6. Uw rechten</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">U heeft het recht om:</p>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
          <li>Uw gegevens in te zien, te corrigeren of te verwijderen</li>
          <li>Bezwaar te maken tegen het gebruik van uw gegevens voor marketingdoeleinden</li>
          <li>Uw toestemming in te trekken (indien van toepassing)</li>
          <li>Een klacht in te dienen bij een toezichthoudende autoriteit</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">7. Bewaartermijn van gegevens</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Wij bewaren uw gegevens niet langer dan noodzakelijk is voor de doeleinden waarvoor deze zijn verzameld, tenzij een langere bewaartermijn wettelijk vereist is.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">8. Contact</h2>
        <p className="text-gray-700 dark:text-gray-300">Voor vragen over dit privacybeleid kunt u contact met ons opnemen via:</p>
        <div className="mt-2 text-gray-700 dark:text-gray-300">
          <p>VoicemailAI</p>
          <p>info@voicemailai.nl</p>
        </div>
      </section>
      
      <p className="text-gray-700 dark:text-gray-300 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
        Wij behouden ons het recht voor om dit privacybeleid te wijzigen. Controleer deze pagina regelmatig voor updates.
      </p>
    </div>
  );
} 