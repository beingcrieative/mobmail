import React from 'react';

export const metadata = {
  title: 'Algemene Voorwaarden',
  description: 'Algemene voorwaarden voor onze diensten',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">ALGEMENE VOORWAARDEN</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 1 - Definities</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">In deze algemene voorwaarden wordt verstaan onder:</p>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Ondernemer: de natuurlijke of rechtspersoon die producten en/of diensten aanbiedt aan consumenten of bedrijven.</li>
            <li>Consument: de natuurlijke persoon die niet handelt in de uitoefening van een beroep of bedrijf en een overeenkomst aangaat met de ondernemer.</li>
            <li>Overeenkomst: iedere afspraak tussen ondernemer en consument waarbij wederzijdse verplichtingen ontstaan.</li>
            <li>Producten en diensten: alle goederen en/of services die door de ondernemer worden aangeboden.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 2 - Toepasselijkheid</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Deze algemene voorwaarden zijn van toepassing op alle offertes, overeenkomsten en leveringen van de ondernemer.</li>
            <li>Afwijkingen van deze voorwaarden zijn alleen bindend indien deze schriftelijk zijn overeengekomen.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 3 - Aanbiedingen en Overeenkomsten</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Alle aanbiedingen zijn vrijblijvend en gelden zolang de voorraad strekt.</li>
            <li>De overeenkomst komt tot stand op het moment dat de consument de bestelling plaatst en de ondernemer deze bevestigt.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 4 - Prijzen en Betaling</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Alle prijzen zijn inclusief btw, tenzij anders aangegeven.</li>
            <li>Betaling dient te geschieden binnen de aangegeven termijn, tenzij anders overeengekomen.</li>
            <li>Bij niet-tijdige betaling behoudt de ondernemer zich het recht voor om extra kosten in rekening te brengen.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 5 - Levering en Uitvoering</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>De ondernemer zal uiterste zorgvuldigheid in acht nemen bij de uitvoering van bestellingen en levering van diensten.</li>
            <li>De opgegeven leveringstermijn is indicatief en niet bindend.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 6 - Herroepingsrecht en Retouren</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>De consument heeft het recht om binnen 14 dagen na ontvangst zonder opgave van redenen de overeenkomst te herroepen.</li>
            <li>Producten dienen ongebruikt en in originele verpakking geretourneerd te worden.</li>
            <li>De kosten voor retourzending zijn voor rekening van de consument, tenzij anders overeengekomen.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 7 - Aansprakelijkheid</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>De ondernemer is niet aansprakelijk voor schade die ontstaat door onjuist gebruik van het product.</li>
            <li>Aansprakelijkheid is in alle gevallen beperkt tot het factuurbedrag van de geleverde producten of diensten.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 8 - Overmacht</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>De ondernemer is niet aansprakelijk voor enige vertraging of tekortkoming indien deze voortkomt uit overmacht, zoals natuurrampen, stakingen of andere onvoorziene omstandigheden.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 9 - Klachten en Geschillen</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Klachten dienen binnen redelijke termijn en volledig omschreven te worden ingediend bij de ondernemer.</li>
            <li>Op alle overeenkomsten is het Nederlands recht van toepassing.</li>
            <li>Geschillen worden bij voorkeur in onderling overleg opgelost. Indien dit niet lukt, wordt het geschil voorgelegd aan de bevoegde rechter.</li>
          </ol>
        </section>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Artikel 10 - Wijziging van Voorwaarden</h2>
          <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1">
            <li>De ondernemer behoudt zich het recht voor deze algemene voorwaarden te wijzigen.</li>
            <li>Gewijzigde voorwaarden zijn van toepassing zodra deze op de website zijn gepubliceerd of aan de consument zijn medegedeeld.</li>
          </ol>
        </section>
        
        <p className="text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm">
          Deze algemene voorwaarden zijn voor het laatst bijgewerkt op 10 april 2025.
        </p>
      </div>
    </div>
  );
} 