# VoicemailAI Mobile-v3 Interface - Complete Screen Documentatie

## Overzicht van de Mobile-v3 Interface

VoicemailAI Mobile-v3 is een Progressive Web Application (PWA) die een volledig native mobiele ervaring biedt voor het beheren van voicemails met AI-powered transcriptie en analyse. De interface is geoptimaliseerd voor touch-interacties, gesture-based navigatie en een intuïtieve gebruikerservaring.

### Kernkenmerken Mobile-v3 Interface
- **Progressive Web App (PWA)**: Installeerbaar als native app
- **Gesture-first design**: Swipe-acties en touch-geoptimaliseerde interface
- **Nederlandse taal**: Volledige interface in het Nederlands
- **Real-time data**: Live synchronisatie met voicemail transcripties
- **AI-powered insights**: Automatische prioritering en samenvattingen
- **Offline capabilities**: Basis functionaliteit zonder internetverbinding

---

## Architectuur & Technische Stack

### Layout Structuur
```
Mobile-v3 Layout:
┌─────────────────────────────────────┐
│ Status Bar (Gesimuleerd)            │ ← Carrier, batterij, tijd
├─────────────────────────────────────┤
│ Header (Contextafhankelijk)         │ ← Back button, titel, acties
├─────────────────────────────────────┤
│                                     │
│ Main Content Area                   │ ← Scrollable content
│ (Scherm-specifieke inhoud)          │
│                                     │
├─────────────────────────────────────┤
│ Bottom Navigation (5 tabs)          │ ← Hoofdnavigatie
└─────────────────────────────────────┘
```

### Navigatie Architectuur
- **Bottom Navigation**: 5 hoofdtabs (Home, Calls, Calendar, Analytics, Profile)
- **Header Navigation**: Contextafhankelijke back buttons en acties
- **Gesture Navigation**: Swipe tussen schermen en voor acties
- **Deep Linking**: Directe URLs naar specifieke schermen

### Technische Implementatie
- **Framework**: Next.js 15 met App Router
- **Styling**: Tailwind CSS met mobile-first approach
- **Animaties**: Framer Motion voor smooth transitions en gestures
- **State Management**: Custom hooks (useAuth, useTranscriptions)
- **Data Storage**: Dual storage (localStorage + cookies) voor cross-tab sync

---

## Gedetailleerde Screen-by-Screen Analyse

## 1. 🏠 Dashboard (Home Screen)
**Route**: `/mobile-v3`
**Functie**: Hoofdscherm met overzicht en snelle toegang tot alle functies

### Wat gebruikers KUNNEN ZIEN:

#### Persoonlijke Begroeting
- **Tijdspecifieke begroeting**: "Goedemorgen", "Goedemiddag", "Goedenavond"
- **Gebruikersnaam**: Gepersonaliseerde welkomstbericht
- **Datum indicator**: Huidige datum in Nederlands formaat

#### Real-time Statistieken Dashboard
- **Vandaag's Voicemails**: Aantal vandaag verwerkte voicemails
- **Tijd Bespaard**: Totale tijd bespaard in minuten/uren
- **Weekelijkse Groei**: Percentage groei ten opzichte van vorige week
- **Totaal Transcripties**: Lifetime aantal verwerkte voicemails

#### Recente Activiteit (Laatste 3 Voicemails)
Voor elke recente voicemail:
- **Caller informatie**: Naam van beller of "Onbekende beller"
- **AI Samenvatting**: Eerste 50 karakters van AI-gegenereerde samenvatting
- **Tijdstempel**: "X minuten geleden", "Y uren geleden", "Z dagen geleden"
- **Prioriteit indicator**: Kleurgecodeerde prioriteit (hoog/medium/laag)
- **Ongelezen indicator**: Blauwe dot voor niet-gelezen berichten

#### Quick Action Buttons
- **Transcripties**: Badge met aantal ongelezen transcripties
- **Agenda**: Toegang tot kalender integratie
- **Analytics**: Statistieken en trends
- **Instellingen**: Profiel en configuratie

#### Vandaag's Samenvatting Card
- **Totaal Transcripties Vandaag**: Aantal verwerkte voicemails
- **Totale Tijd Bespaard**: Tijd in minuten/uren formaat
- **Gemiddelde Gespreksduur**: Automatisch berekend

### Wat gebruikers KUNNEN DOEN:

#### Navigatie Acties
- **Tap op Quick Action**: Navigeer naar specifieke sectie
  - "Transcripties" → `/mobile-v3/transcriptions`
  - "Agenda" → `/mobile-v3/calendar`
  - "Analytics" → `/mobile-v3/analytics`
  - "Instellingen" → `/mobile-v3/profile`

#### Interactie met Recente Activiteit
- **Tap op voicemail item**: Navigeer naar detail view (`/mobile-v3/voicemails/[id]`)
- **Swipe right**: Markeer als gelezen
- **Swipe left**: Archiveer voicemail

#### Data Management
- **Pull-to-refresh**: Ververs alle dashboard data
- **Automatic refresh**: Data wordt elke 30 seconden bijgewerkt
- **Offline indicators**: Toont wanneer data offline is

### Authenticatie Status Handling
- **Ingelogd**: Toont alle persoonlijke data en statistieken
- **Niet ingelogd**: Automatische redirect naar `/mobile-v3/auth/login`
- **Loading state**: Spinner met "Gegevens laden..." bericht
- **Error state**: Foutmelding met "Opnieuw proberen" knop

---

## 2. 🎤 Voicemail Beheer Schermen

### 2A. Transcripties Overzicht (Herzien)
**Route**: `/mobile-v3/transcriptions`
**Functie**: Conversation-style interface voor gesprekstranscripties met smart prioriteit systeem
**Database**: `call_transcriptions` tabel (151 records, 75% success rate)

#### Wat gebruikers KUNNEN ZIEN:

##### Smart Statistics Header
```
┌─────────────────────────────────────┐
│ 📊 Vandaag: 12 gesprekken           │
│ ✅ 75% succesvol  •  ⏱️ Ø 1 min     │
│ 🔄 Laatste sync: 2 min geleden     │
└─────────────────────────────────────┘
```
- **Realtime Metrics**: Gebaseerd op `callSuccessful` field (success/failure/unknown)
- **Success Rate**: Berekend percentage van succesvolle gesprekken
- **Gemiddelde Duur**: Uit `callDuration` field (gemiddeld 60 seconden)
- **Live Sync Status**: Laatste database update tijd

##### Intelligent Filtering System
```
┌─────────────────────────────────────┐
│ 🔍 Zoek in gesprekken...            │
├─────────────────────────────────────┤
│ 🟢 Succesvol (114) 🔴 Mislukt (30) │
│ 🏢 Voicemail AI (65) 💰 MoneyB. (52)│
├─────────────────────────────────────┤
│ 📅 Vandaag  ⏱️ Kort (<30s)  🔄 Alle │
└─────────────────────────────────────┘
```
- **Status Filters**: Direct gebaseerd op `callSuccessful` field
- **Company Filters**: Top bedrijven uit `company_name` (Voicemail AI, MoneyBoomerang)
- **Duration Filters**: Kort (<30s), Normaal (30s-2min), Lang (>2min)
- **Live Counts**: Real-time badge counts per filter

##### Conversation-Style Cards
```
┌─────────────────────────────────────┐
│ 🔴 URGENT                    14:32  │ ← Priority + tijd
├─────────────────────────────────────┤
│ 📞 Yiu-Wing Liu                     │ ← customer_name
│ 🏢 Voicemail AI                     │ ← company_name
│ 📱 +31654798857  •  34s  •  📥     │ ← caller_phone + callDuration
├─────────────────────────────────────┤
│ 🤖 "User initiated call and asked   │ ← transcriptSummary
│     if agent spoke English. After   │   (max 100 chars)
│     confirmation, made unclear..."   │
├─────────────────────────────────────┤
│ 📞 Bellen  📧 Email  📅 Afspraak ⋯ │ ← Quick actions
└─────────────────────────────────────┘
```

**Smart Priority System** (Gebaseerd op database patterns):
- 🔴 **URGENT**: `callSuccessful = "failure"` + `callDuration < 30s`
- 🟡 **BELANGRIJK**: `callSuccessful = "failure"` + `callDuration >= 30s`
- 🟢 **SUCCESVOL**: `callSuccessful = "success"`
- ⚪ **ONBEKEND**: `callSuccessful = "unknown"`

**Database Field Mapping**:
- **Caller Info**: `customer_name` + `caller_phone` + `company_name`
- **Call Details**: `created_at` + `callDuration` + `callDirection`
- **AI Content**: `transcriptSummary` (gemiddeld 206 karakters)
- **Status**: `callSuccessful` voor prioriteit bepaling

#### Wat gebruikers KUNNEN DOEN:

##### Smart Filtering & Search
- **Real-time Search**: Zoeken in `customer_name`, `caller_phone` en `transcriptSummary`
- **Status Filter Tabs**: 
  - 🟢 Succesvol (114) - `callSuccessful = "success"`
  - 🔴 Mislukt (30) - `callSuccessful = "failure"`
  - ⚪ Onbekend (7) - `callSuccessful = "unknown"`
- **Company Quick Filters**: 
  - 🏢 Voicemail AI (65 records)
  - 💰 MoneyBoomerang (52 records)
  - 🎨 Crieative BV (11 records)
- **Duration Filters**: 
  - ⚡ Kort (<30s) - Mogelijk probleem gesprekken
  - 🕐 Normaal (30s-2min) - Standaard gesprekken
  - 📞 Lang (>2min) - Uitgebreide gesprekken

##### Conversation Card Interactions
- **Priority-Based Display**: Automatische sortering op urgentie
  - Failures met korte duur bovenaan (urgent)
  - Succesvolle gesprekken onderaan
- **Tap Interactions**:
  - **Header tap**: Expand volledige `conversation` JSONB data
  - **Summary tap**: Toon complete `transcriptSummary`
  - **Phone tap**: Direct bellen naar `caller_phone`
  - **Company tap**: Filter op `company_name`
- **Swipe Actions**:
  - **Swipe right**: Markeer als verwerkt
  - **Swipe left**: Archiveer gesprek
  - **Long press**: Context menu met alle opties

##### Performance-Optimized Data Loading
- **Smart Pagination**: 20 items per pagina (optimaal voor 151 records)
- **Lazy Loading**: Zware JSONB velden (`transcript`, `conversation`) op demand
- **Virtualized Scrolling**: Smooth scrolling door grote lijsten
- **Background Refresh**: Automatische sync elke 30 seconden
- **Offline Caching**: Critical data lokaal opslaan

##### Advanced Actions
- **Bulk Operations**: Selecteer meerdere gesprekken voor:
  - Status wijzigingen
  - Company herclassificatie
  - Export naar CSV/PDF
- **Smart Shortcuts**:
  - **Double tap**: Snelle callback actie
  - **Pinch zoom**: Vergroot transcriptie tekst
  - **Shake device**: Refresh alle data

##### Database-Driven Features
- **Success Rate Tracking**: Real-time berekening van conversie
- **Company Performance**: Welke bedrijven hebben hoogste success rate
- **Duration Analytics**: Correlatie tussen gespreksduur en succes
- **Caller Intelligence**: Herkenning van terugkerende bellers

##### Edge Cases & Error Handling
- **Missing transcriptSummary**: Fallback naar eerste 100 chars van `conversation`
- **Duplicate fields**: Prioriteit: `customer_name` > `customerName`
- **Null values**: Graceful handling van alle nullable fields
- **Network errors**: Retry logic met exponential backoff
- **Large datasets**: Efficient handling van 151+ records

##### Technical Performance
- **Optimized SQL Query**:
```sql
SELECT 
  id, customer_name, company_name, caller_phone,
  created_at, callDuration, callSuccessful, transcriptSummary
FROM call_transcriptions
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY 
  CASE callSuccessful 
    WHEN 'failure' THEN 1
    WHEN 'unknown' THEN 2  
    WHEN 'success' THEN 3
  END,
  callDuration ASC, -- Korte failures eerst
  created_at DESC
LIMIT 20 OFFSET ?;
```
- **Database Indexes**: `created_at`, `callSuccessful`, `company_name`
- **Response Time**: <200ms voor lijst view
- **Memory Usage**: Efficient caching van 206-char summaries

---

### 2B. Voicemail Management (Swipe Interface)
**Route**: `/mobile-v3/voicemails`
**Functie**: Gesture-based voicemail beheer met swipe acties

#### Wat gebruikers KUNNEN ZIEN:

##### Quick Stats Header
- **Ongelezen Voicemails**: Totaal aantal met urgent indicator
- **Urgente Voicemails**: Hoge prioriteit count met rode badge
- **Vandaag Ontvangen**: Aantal vandaag binnengekomen
- **Gemiddelde Responstijd**: Tijd tussen ontvangst en verwerking

##### Filter Tabs (Met Live Counts)
- **Alle** (X): Alle voicemails
- **Ongelezen** (Y): Alleen ongelezen items
- **Urgent** (Z): Alleen hoge prioriteit
- **Vandaag** (W): Vandaag ontvangen

##### Voicemail Cards (Swipe-enabled)
Voor elke voicemail:
- **Caller Information**:
  - Naam van beller (of "Onbekend")
  - Telefoonnummer (klikbaar voor terugbellen)
  - Bedrijfsnaam (indien beschikbaar)
- **Timing Information**:
  - Tijdstempel: "X minuten geleden"
  - Gespreksduur: MM:SS format
  - Ontvangst tijd: Exacte tijd van binnenkomst
- **AI-Generated Content**:
  - Korte samenvatting (2-3 zinnen)
  - Gedetecteerde action items
  - Sentiment analysis (😊😐😟)
  - Urgentie score (1-5 sterren)
- **Visual Indicators**:
  - Ongelezen indicator (blauwe dot)
  - Prioriteit kleurcodering (rood/oranje/groen)
  - Audio beschikbaarheid (speaker icon)
  - Transcriptie status (check mark)

#### Wat gebruikers KUNNEN DOEN:

##### Gesture-Based Acties
- **Swipe Right (Archiveer)**:
  - Swipe distance: 50% van scherm breedte
  - Visual feedback: Groene achtergrond met archief icon
  - Haptic feedback: Lichte trillingen
  - Undo optie: 3 seconden toast met "Ongedaan maken"
- **Swipe Left (Verwijder)**:
  - Swipe distance: 50% van scherm breedte
  - Visual feedback: Rode achtergrond met prullenbak icon
  - Confirmatie dialog: "Weet je zeker dat je wilt verwijderen?"
  - Permanent verwijdering na bevestiging

##### Audio Playback
- **Tap play button**: Start/stop audio afspelen
- **Playback controls**:
  - Play/pause toggle
  - Audio progress bar
  - Playback speed (0.5x, 1x, 1.5x, 2x)
  - Audio scrubbing (tap op progress bar)
- **Background playback**: Audio blijft spelen tijdens navigatie
- **Auto-pause**: Pauzeert bij nieuwe voicemail

##### Content Interaction
- **Tap op card**: Expand/collapse voor volledige transcriptie
- **Long press**: Context menu met extra opties
- **Tap op "Meer"**: Navigeer naar detail pagina
- **Tap op telefoonnummer**: Directe belfunctie

##### Filtering en Sortering
- **Tap op filter tabs**: Dynamisch filteren van voicemails
- **Filter persistentie**: Gekozen filter blijft actief tussen sessies
- **Smart notifications**: Badge updates op filter tabs

---

### 2C. Voicemail Detail View
**Route**: `/mobile-v3/voicemails/[id]`
**Functie**: Uitgebreide weergave van individuele voicemail met volledige transcriptie

#### Wat gebruikers KUNNEN ZIEN:

##### Uitgebreide Call Informatie Header
- **Caller Details**:
  - Volledige naam van beller
  - Telefoonnummer (geformatteerd met landcode)
  - Bedrijfsnaam en functie (indien beschikbaar)
  - Caller ID foto (indien beschikbaar)
- **Call Metadata**:
  - Volledige datum en tijd (inclusief weekdag)
  - Gespreksduur in MM:SS format
  - Richting: Inkomend/Uitgaand indicator
  - Agent nummer (indien call center)
  - Call status: Beantwoord/Gemist/Doorverbonden

##### AI-Powered Content Sectie
- **AI Samenvatting Card**:
  - Uitgebreide AI-gegenereerde samenvatting
  - Key points en belangrijke onderwerpen
  - Gedetecteerde action items met prioriteit
  - Sentiment analyse met confidence score
  - Urgentie beoordeling met reden
- **Smart Insights**:
  - Callback suggestion met beste tijd
  - Related previous calls (indien beschikbaar)
  - Customer journey indicators
  - Follow-up reminders

##### Volledige Transcriptie
- **Conversatie Flow**:
  - Chronologische volgorde met timestamps
  - Rol-gebaseerde formatting (Agent vs Beller)
  - Duidelijke visuele scheiding tussen sprekers
  - Emoticon indicators voor toon
- **Interactive Elements**:
  - Klikbare timestamps (spring naar audio moment)
  - Highlighted keywords en phrases
  - Searchable content binnen transcriptie
  - Copy-to-clipboard functionaliteit

##### Audio Controls
- **Advanced Playback**:
  - Grote play/pause button
  - Progress bar met time indicators
  - Speed control (0.5x tot 2x)
  - 15-second skip forward/backward
- **Audio Visualization**:
  - Waveform display (indien beschikbaar)
  - Visual indication van huidige positie
  - Marker voor transcript synchronisatie

#### Wat gebruikers KUNNEN DOEN:

##### Audio Management
- **Playback Control**:
  - **Tap play/pause**: Start/stop audio
  - **Drag progress bar**: Scrub naar specifiek moment
  - **Tap speed button**: Wijzig afspeelsnelheid
  - **Double tap**: Skip 15 seconden vooruit/achteruit
- **Audio Features**:
  - **Background play**: Audio blijft spelen tijdens navigatie
  - **Auto-pause**: Pauzeert bij belangrijke notificaties
  - **Noise reduction**: Toggle voor betere audio kwaliteit

##### Content Interaction
- **Transcriptie Navigation**:
  - **Scroll through**: Lees volledige conversatie
  - **Tap timestamps**: Spring naar specifiek audio moment
  - **Search within**: Zoek naar keywords in transcriptie
  - **Copy text**: Selecteer en kopieer transcriptie delen
- **Smart Actions**:
  - **Tap keywords**: Highlight related content
  - **Long press**: Context menu met extra opties
  - **Share transcript**: Deel via email of messaging

##### Response Actions
- **Direct Actions**:
  - **📞 Terugbellen**: Initieert direct telefoongesprek
  - **📧 Email**: Composeert email met transcriptie context
  - **📅 Afspraak**: Voegt call to action toe aan kalender
  - **📝 Notities**: Voeg persoonlijke notities toe
- **Follow-up Management**:
  - **⏰ Reminder**: Stel follow-up reminder in
  - **🏷️ Tags**: Voeg categorieën toe voor organisatie
  - **⭐ Bookmark**: Markeer als favoriet
  - **📋 Action Items**: Maak to-do items aan

##### Navigation
- **Header Navigation**:
  - **Back button**: Return naar voicemails lijst
  - **Share button**: Deel voicemail details
  - **More options**: Dropdown met extra acties
- **Swipe Navigation**:
  - **Swipe left**: Volgende voicemail
  - **Swipe right**: Vorige voicemail
  - **Pinch to zoom**: Zoom in op transcriptie tekst

---

## 3. 📅 Kalender Integratie
**Route**: `/mobile-v3/calendar`
**Functie**: Volledig geïntegreerde kalender voor afspraakbeheer

### Wat gebruikers KUNNEN ZIEN:

#### Kalender Header
- **Maand/Jaar Indicator**: Huidige maand en jaar
- **Navigatie Pijlen**: Vorige/volgende maand
- **Vandaag Button**: Snelle terugkeer naar huidige datum
- **View Toggle**: Maand/Week/Dag weergave

#### Kalender Grid
- **Maand Weergave**:
  - 7x6 grid met weekdagen
  - Dag nummers met event indicators
  - Vandaag highlighting (blauwe achtergrond)
  - Event dots (verschillende kleuren per type)
- **Week Weergave**:
  - Horizontale tijdlijn
  - Uurvakken met event blocks
  - Scrollable day columns
- **Dag Weergave**:
  - Gedetailleerde timeline
  - Evenementen met volledige details
  - Vrije tijdslots gemarkeerd

#### Event Informatie
Per afspraak/event:
- **Titel en Omschrijving**
- **Tijd en Duur**
- **Locatie** (indien opgegeven)
- **Deelnemers/Contacten**
- **Prioriteit Level** (kleurcodering)
- **Recurrence Pattern** (indien herhalend)

#### Cal.com Integratie Status
- **Connectie Status**: Verbonden/Niet verbonden indicator
- **Sync Status**: Laatste synchronisatie tijd
- **Beschikbaarheid**: Vrije tijdslots gemarkeerd
- **Booking Links**: Directe links voor online booking

### Wat gebruikers KUNNEN DOEN:

#### Kalender Navigatie
- **Swipe Gestures**:
  - **Swipe left**: Volgende maand/week/dag
  - **Swipe right**: Vorige maand/week/dag
  - **Pinch to zoom**: Wijzig view (maand ↔ week ↔ dag)
- **Tap Navigation**:
  - **Tap datum**: Ga naar dag weergave
  - **Tap event**: Open event details
  - **Tap vrije tijd**: Nieuwe afspraak maken

#### Event Management
- **Nieuwe Afspraak Maken**:
  - **Tap op vrije tijdslot**: Open create form
  - **Formulier velden**:
    - Titel (verplicht)
    - Datum en tijd (datepicker)
    - Duur (dropdown: 15min, 30min, 1u, 2u, custom)
    - Locatie (vrije tekst + location picker)
    - Omschrijving (tekst area)
    - Prioriteit (laag/medium/hoog)
    - Herhalingspatroon (dagelijks/wekelijks/maandelijks)
    - Herinneringen (5min, 15min, 30min, 1u voor)
- **Event Bewerken**:
  - **Tap op event**: Open detail view
  - **Edit button**: Wijzig event details
  - **Delete button**: Verwijder event (met confirmatie)
  - **Duplicate button**: Kopieer event naar andere datum

#### Smart Scheduling Features
- **AI-Powered Suggestions**:
  - **Beste tijden**: Gebaseerd op voicemail patterns
  - **Follow-up timing**: Automatische follow-up voorstellen
  - **Conflict detection**: Waarschuwing bij dubbele bookings
- **Quick Actions**:
  - **Template Events**: Vooraf ingestelde afspraak types
  - **Bulk Actions**: Meerdere events tegelijk beheren
  - **Recurring Events**: Herhalende afspraken beheren

#### Cal.com Integratie
- **Account Linking**:
  - **Connect Cal.com**: Koppel externe kalender
  - **Sync Settings**: Configureer synchronisatie opties
  - **Booking Pages**: Manage public booking links
- **Advanced Features**:
  - **Availability Zones**: Stel beschikbare tijden in
  - **Buffer Times**: Tijd tussen afspraken
  - **Meeting Types**: Verschillende soorten afspraken
  - **Team Scheduling**: Groep afspraken (indien team account)

---

## 4. 📊 Analytics Dashboard
**Route**: `/mobile-v3/analytics`
**Functie**: Uitgebreide analytics en statistieken voor voicemail activiteit

### Wat gebruikers KUNNEN ZIEN:

#### Time Range Selector
- **Periode Buttons**:
  - **Week**: Laatste 7 dagen
  - **Maand**: Laatste 30 dagen
  - **Jaar**: Laatste 12 maanden
  - **Custom**: Eigen datumbereik kiezen
- **Active Indicator**: Huidige geselecteerde periode gemarkeerd
- **Quick Filters**: Vandaag, Gisteren, Deze week, Vorige maand

#### Key Performance Metrics (KPI Cards)
- **Totaal Voicemails**:
  - Absolute aantal met groei percentage
  - Vergelijking met vorige periode
  - Trend indicator (omhoog/omlaag pijl)
- **Tijd Bespaard**:
  - Totale tijd in uren/minuten
  - Gemiddelde tijdsbesparing per voicemail
  - Efficiency score (1-10)
- **Gemiddelde Gespreksduur**:
  - Duur in minuten:seconden
  - Vergelijking met industrie gemiddelde
  - Trend over tijd
- **Response Rate**:
  - Percentage beantwoorde voicemails
  - Gemiddelde responstijd
  - Follow-up percentage

#### Visuele Charts en Grafieken

##### Weekactiviteit Bar Chart
- **7-daagse activiteit visualisatie**:
  - Kolommen voor elke dag van de week
  - Hoogte toont aantal voicemails
  - Kleurcodering: Groen (hoog), Oranje (gemiddeld), Rood (laag)
  - Interactieve tooltips met exacte cijfers
- **Comparative Data**:
  - Vorige week overlay (gestippelde lijn)
  - Gemiddelde lijn door data
  - Peak hours indicator

##### Priority Distribution Donut Chart
- **Prioriteit Verdeling**:
  - Hoog prioriteit: Percentage met aantal
  - Medium prioriteit: Percentage met aantal
  - Laag prioriteit: Percentage met aantal
- **Interactive Elements**:
  - Tap segmenten voor details
  - Legenda met percentages
  - Drill-down naar specifieke voicemails

##### Maandelijkse Trends Line Chart
- **5-maanden historische data**:
  - Lijn grafiek met data points
  - Trend lijn voor algemene richting
  - Seizoenspatroon indicatoren
- **Multiple Metrics**:
  - Volume (aantal voicemails)
  - Gemiddelde duur
  - Response rates
  - Customer satisfaction

#### Geavanceerde Analytics

##### Caller Analytics
- **Top Callers**: Meest actieve bellers
- **New vs Return**: Nieuwe vs terugkerende bellers
- **Geographic Distribution**: Locatie gebaseerde statistieken
- **Time Patterns**: Wanneer bellen klanten meestal

##### Performance Metrics
- **AI Accuracy**: Transcriptie nauwkeurigheid
- **Processing Time**: Gemiddelde verwerkingstijd
- **System Uptime**: Beschikbaarheid statistieken
- **Error Rates**: Percentage gefaalde transcripties

### Wat gebruikers KUNNEN DOEN:

#### Time Period Management
- **Periode Selectie**:
  - **Tap week/maand/jaar**: Verander data periode
  - **Smooth transition**: Animatie tussen periodes
  - **Custom range**: Kies specifieke datums
- **Comparison Features**:
  - **Compare periods**: Vergelijk met vorige periode
  - **Overlay data**: Meerdere periodes in één grafiek
  - **Export comparison**: Deel vergelijkende data

#### Interactive Charts
- **Chart Interactions**:
  - **Tap data points**: Toon gedetailleerde informatie
  - **Pinch to zoom**: Zoom in op specifieke tijdsperiodes
  - **Swipe charts**: Scroll door historische data
- **Drill-down Capabilities**:
  - **Tap chart segments**: Ga naar onderliggende data
  - **Filter by chart**: Gebruik chart als filter voor andere views
  - **Cross-reference**: Verbind data tussen verschillende charts

#### Data Export & Sharing
- **Export Options**:
  - **PDF Report**: Professionele analytics rapport
  - **CSV Data**: Ruwe data voor Excel/spreadsheet
  - **Image Export**: Charts als afbeeldingen
- **Sharing Features**:
  - **Email Reports**: Verstuur naar team/management
  - **Link Sharing**: Deel read-only dashboard link
  - **Scheduled Reports**: Automatische periodieke rapporten

#### Advanced Analytics
- **Custom Metrics**:
  - **Create KPIs**: Definieer eigen belangrijke metrics
  - **Alert Thresholds**: Stel waarschuwingen in voor belangrijke wijzigingen
  - **Goal Tracking**: Monitor progress naar specifieke doelen
- **Predictive Analytics**:
  - **Trend Forecasting**: Voorspel toekomstige volumes
  - **Seasonal Patterns**: Identificeer seizoensgebonden patronen
  - **Anomaly Detection**: Automatische detectie van ongewone activiteit

---

## 5. 👤 Profiel & Instellingen
**Route**: `/mobile-v3/profile`
**Functie**: Gebruikersprofiel, instellingen en account management

### Wat gebruikers KUNNEN ZIEN:

#### User Profile Header
- **Profielfoto**:
  - Avatar placeholder met initialen
  - Upload functionaliteit voor eigen foto
  - Automatic color generation based op naam
- **Persoonlijke Informatie**:
  - Volledige naam
  - Email adres
  - Lidmaatschap datum ("Lid sinds 15 maart 2024")
  - Account type (Personal/Business/Enterprise)

#### Subscription Status Card
- **Abonnement Details**:
  - Huidige plan: Basic/Pro/Enterprise
  - Status indicator: Actief (groen), Verlopen (rood), Trial (oranje)
  - Vervaldatum met countdown
  - Volgende factuurdatum
- **Usage Metrics**:
  - Verbruik deze maand (voicemails/transcripties)
  - Limiet van huidige plan
  - Percentage gebruikt met progress bar
- **Billing Information**:
  - Maandelijkse kosten
  - Volgende factuur bedrag
  - Betalingsmethode (laatste 4 cijfers)

#### Persoonlijke Statistieken
- **Lifetime Statistics**:
  - Totaal voicemails verwerkt
  - Totale tijd bespaard (geformatteerd als "2u 34m")
  - Aantal voltooide transcripties
  - Gemiddelde responstijd
- **Achievement Badges**:
  - Milestone badges (100, 500, 1000 voicemails)
  - Efficiency badges (snelle respons, hoge kwaliteit)
  - Streak badges (dagelijkse usage)

#### Instellingen Categorieën

##### Account & Profiel
- **"Profiel bewerken"**: Wijzig persoonlijke informatie
- **"Wachtwoord wijzigen"**: Beveiligingsinstellingen
- **"Twee-factor authenticatie"**: 2FA setup
- **"Account deactiveren"**: Account management

##### Voicemail Configuratie
- **"Setup Wizard"**: Hertart configuratie wizard
- **"Voicemail instellingen"**: Nummer configuratie
- **"Transcriptie voorkeuren"**: Taal en kwaliteit settings
- **"AI Assistant training"**: Personalisatie van AI responses

##### Notificaties & Communicatie
- **"Meldingen"**: Push notification settings
- **"Email voorkeuren"**: Email notification types
- **"SMS alerts"**: Tekstbericht configuratie
- **"Quiet hours"**: Rustperiodes instellen

##### Privacy & Beveiliging
- **"Privacy instellingen"**: Data handling preferences
- **"Beveiliging & toegang"**: Login settings
- **"Data export"**: Download persoonlijke data
- **"Account geschiedenis"**: Login en activiteit logs

##### Integraties
- **"Kalender integratie"**: Cal.com en andere agenda's
- **"CRM connecties"**: Salesforce, HubSpot, enz.
- **"API toegang"**: Developer settings
- **"Webhooks"**: Externe notificaties

#### App Informatie
- **Versie Informatie**: App versie (v1.0.0)
- **Legal Links**:
  - Privacy Policy
  - Algemene Voorwaarden
  - Cookie Beleid
  - GDPR Compliance
- **Support & Help**:
  - Help Center
  - Contact Support
  - Feature Requests
  - Bug Reports

### Wat gebruikers KUNNEN DOEN:

#### Profile Management
- **Edit Profile**:
  - **Tap "Profiel bewerken"**: Open edit form
  - **Photo upload**: Nieuwe profielfoto toevoegen
  - **Information update**: Naam, email, telefoon wijzigen
  - **Save changes**: Bevestig en sla wijzigingen op
- **Account Settings**:
  - **Password change**: Beveiligde wachtwoord update
  - **2FA setup**: Twee-factor authenticatie activeren
  - **Login preferences**: Onthoud mij, auto-login opties

#### Subscription Management
- **Plan Management**:
  - **"Abonnement beheren"**: Ga naar Stripe customer portal
  - **Upgrade/Downgrade**: Wijzig subscription plan
  - **Billing history**: Bekijk factuur geschiedenis
  - **Payment methods**: Beheer betalingsmethodes
- **Usage Monitoring**:
  - **View usage**: Gedetailleerd verbruik per maand
  - **Usage alerts**: Waarschuwingen bij limiet bereik
  - **Overage management**: Opties bij overschrijding limiet

#### Settings Configuration
- **Wizard Management**:
  - **Launch Setup Wizard**: Hertart configuratie proces
  - **Wizard progress**: Bekijk voltooiingsstatus
  - **Skip wizard**: Overslaan voor ervaren gebruikers
- **Notification Preferences**:
  - **Push notifications**: Aan/uit per notification type
  - **Email frequency**: Dagelijks/wekelijks/maandelijks
  - **Quiet hours**: Tijd periodes zonder notificaties
  - **Emergency overrides**: Belangrijke meldingen altijd doorlaten

#### Privacy & Security
- **Privacy Controls**:
  - **Data retention**: Hoe lang data bewaren
  - **Sharing preferences**: Wat mag gedeeld worden
  - **Analytics opt-out**: Uitzetten van usage tracking
- **Security Features**:
  - **Session management**: Actieve sessies bekijken/beëindigen
  - **Login alerts**: Ontvang meldingen bij nieuwe logins
  - **Suspicious activity**: Automatische waarschuwingen

#### Support & Help
- **Help Resources**:
  - **FAQ**: Veelgestelde vragen
  - **Video tutorials**: Step-by-step instructies
  - **Live chat**: Direct contact met support
  - **Community forum**: Gebruikers community
- **Feedback & Improvements**:
  - **Feature requests**: Voorstellen voor nieuwe functionaliteit
  - **Bug reports**: Rapporteer problemen
  - **Rating & reviews**: Beoordeel de app
  - **Beta testing**: Deelnemen aan beta programma

#### Account Actions
- **Logout Process**:
  - **Tap "Uitloggen"**: Initieer logout proces
  - **Confirmation dialog**: "Weet je zeker dat je wilt uitloggen?"
  - **Secure logout**: Clear localStorage en cookies
  - **Multi-device logout**: Uitloggen op alle apparaten optie
- **Account Management**:
  - **Data export**: Download alle persoonlijke data
  - **Account deactivation**: Tijdelijk account uitschakelen
  - **Account deletion**: Permanent account verwijderen (met recovery periode)

---

## 6. 🔧 Setup Wizard (Modal Overlay)
**Component**: `MobileSettingsWizard`
**Functie**: Gestructureerde onboarding voor nieuwe gebruikers

### Wat gebruikers KUNNEN ZIEN:

#### Wizard Layout
- **Progress Indicator**: 
  - 7 stappen met visuele progress bar
  - Huidige stap gemarkeerd
  - Voltooide stappen met check marks
- **Step Navigation**:
  - Stap titel en nummer
  - Geschatte tijd per stap
  - Optioneel/verplicht indicator

#### Stap 1: Welkom
- **Introductie Bericht**:
  - Welkom bij VoicemailAI
  - Uitleg van setup proces
  - Geschatte tijd (5-10 minuten)
- **Benefits Overview**:
  - AI-powered transcripties
  - Tijd besparing
  - Professionele voicemail management
- **Getting Started**:
  - Tips voor beste resultaten
  - Wat te verwachten
  - Support informatie

#### Stap 2: Profiel Setup
- **Persoonlijke Informatie**:
  - Voornaam (verplicht)
  - Achternaam (verplicht)
  - Functie/Titel (optioneel)
  - Profielfoto upload (optioneel)
- **Validation**:
  - Real-time form validation
  - Error messages in het Nederlands
  - Required field indicators

#### Stap 3: Contact Informatie
- **Contactgegevens**:
  - Primaire telefoonnummer
  - Secundaire nummer (optioneel)
  - Email verificatie
  - Communicatie voorkeuren
- **Formatting**:
  - Automatische nummer formatting
  - Internationale nummer ondersteuning
  - Validatie van email format

#### Stap 4: Bedrijfsinformatie
- **Company Details**:
  - Bedrijfsnaam
  - Industrie/Sector (dropdown)
  - Bedrijfsgrootte (dropdown)
  - Website URL (optioneel)
- **Business Settings**:
  - Openingstijden configuratie
  - Tijdzone instelling
  - Standaard taal voor transcripties

#### Stap 5: Company Beschrijving
- **Business Description**:
  - Korte bedrijfsomschrijving
  - Wat doet het bedrijf?
  - Target audience
  - Speciale instructies voor AI
- **Text Areas**:
  - Multi-line text input
  - Character count indicators
  - Placeholder text voor guidance

#### Stap 6: Voicemail Configuratie
- **AI Assistant Setup**:
  - Aanvullende informatie voor AI
  - Specifieke terminology
  - Veelgestelde vragen
  - Escalatie procedures
- **Technical Setup**:
  - Voicemail doorschakeling
  - Nummer configuratie
  - Backup instellingen

#### Stap 7: Voltooiing
- **Setup Samenvatting**:
  - Overzicht van alle instellingen
  - Bevestiging van configuratie
  - Volgende stappen
- **Success Indicators**:
  - Groene check marks
  - Voltooiings percentage
  - Geschatte tijd tot eerste transcriptie

### Wat gebruikers KUNNEN DOEN:

#### Wizard Navigatie
- **Navigation Controls**:
  - **"Volgende" Button**: Ga naar volgende stap
  - **"Vorige" Button**: Ga terug naar vorige stap
  - **"Overslaan" Option**: Skip optionele stappen
  - **Progress Bar**: Klik om naar specifieke stap te gaan
- **Gesture Support**:
  - **Swipe left**: Volgende stap
  - **Swipe right**: Vorige stap
  - **Tap outside**: Geen actie (prevent accidental close)

#### Form Interaction
- **Data Entry**:
  - **Text inputs**: Standaard text fields
  - **Dropdown selectors**: Voor voorgedefinieerde opties
  - **Toggle switches**: Aan/uit instellingen
  - **File uploads**: Profielfoto en documenten
- **Validation Feedback**:
  - **Real-time validation**: Onmiddellijke feedback
  - **Error highlighting**: Rode rand voor fouten
  - **Success indicators**: Groene check marks
  - **Helper text**: Instructies onder velden

#### Save & Continue Options
- **Data Persistence**:
  - **Auto-save**: Automatisch opslaan per stap
  - **Draft saving**: Bewaar incomplete stappen
  - **Resume wizard**: Hertart waar je stopte
- **Completion Actions**:
  - **Save & Continue**: Opslaan en doorgaan
  - **Save & Exit**: Opslaan en wizard sluiten
  - **Discard Changes**: Wijzigingen weggooien

#### Wizard Management
- **Exit Options**:
  - **Close (X) Button**: Sluit wizard (met confirmatie)
  - **"Later Voltooien"**: Sla op en sluit
  - **"Annuleren"**: Annuleer zonder opslaan
- **Restart Capability**:
  - **"Opnieuw Beginnen"**: Reset wizard naar begin
  - **"Bewerk Stap"**: Ga terug om specifieke stap aan te passen
  - **"Wizard Overslaan"**: Skip hele wizard (voor ervaren gebruikers)

---

## 7. 🔐 Authentication Schermen

### 7A. Login Screen
**Route**: `/mobile-v3/auth/login`
**Component**: `MobileLoginForm`

#### Wat gebruikers KUNNEN ZIEN:

##### Login Interface Design
- **Gradient Header**:
  - VoicemailAI logo
  - Welkom terug bericht
  - Moderne gradient achtergrond
- **Login Form**:
  - Email input field met validatie
  - Wachtwoord field met show/hide toggle
  - "Ingelogd blijven" checkbox
  - Visuele focus indicators
- **Error/Success States**:
  - Validation errors in rood
  - Success messages in groen
  - Loading spinner tijdens authenticatie
- **Alternative Actions**:
  - "Wachtwoord vergeten?" link
  - "Nog geen account? Registreer hier" link

##### Visual Feedback
- **Loading States**: Spinner in login button tijdens process
- **Form Validation**: Real-time feedback op velden
- **Toast Notifications**: Success/error messages bovenaan
- **Haptic Feedback**: Trillingen bij success/error

#### Wat gebruikers KUNNEN DOEN:

##### Authentication Process
- **Login Actions**:
  - **Input credentials**: Email en wachtwoord invoeren
  - **Tap "Inloggen"**: Submit login form
  - **Auto-validation**: Real-time form validation
  - **Remember me**: Blijf ingelogd op device
- **Form Interactions**:
  - **Show/hide password**: Toggle password visibility
  - **Auto-focus**: Automatische focus op eerste veld
  - **Tab navigation**: Keyboard navigatie tussen velden
  - **Submit on enter**: Enter key submit functionaliteit

##### Account Recovery
- **Password Recovery**:
  - **Tap "Wachtwoord vergeten"**: Ga naar reset pagina
  - **Email recovery**: Ontvang reset link via email
  - **Back to login**: Terug naar login scherm
- **Account Creation**:
  - **Tap "Registreren"**: Ga naar registratie pagina
  - **Guest access**: Beperkte toegang zonder account (indien beschikbaar)

---

### 7B. Forgot Password Screen
**Route**: `/mobile-v3/auth/forgot-password`
**Component**: `MobileForgotPasswordForm`

#### Wat gebruikers KUNNEN ZIEN:

##### Password Reset Interface
- **Reset Form**:
  - Email input voor account identificatie
  - Instructies voor reset process
  - Submit button voor reset aanvraag
- **Confirmation States**:
  - Success message na versturen
  - Email verzonden bevestiging
  - Instructies voor volgende stappen
- **Error Handling**:
  - Account niet gevonden errors
  - Network error messages
  - Retry functionaliteit

#### Wat gebruikers KUNNEN DOEN:

##### Password Reset Process
- **Reset Request**:
  - **Enter email**: Voer account email in
  - **Tap "Reset versturen"**: Verstuur reset aanvraag
  - **Email confirmation**: Ontvang reset link
- **Navigation**:
  - **Back to login**: Terug naar login scherm
  - **Resend email**: Verstuur reset link opnieuw
  - **Contact support**: Hulp bij problemen

---

### 7C. Reset Password Screen
**Route**: `/mobile-v3/auth/reset-password`
**Component**: `MobileResetPasswordForm`

#### Wat gebruikers KUNNEN ZIEN:

##### New Password Interface
- **Password Reset Form**:
  - Nieuw wachtwoord input
  - Bevestig wachtwoord input
  - Wachtwoord sterkte indicator
  - Validatie requirements
- **Security Features**:
  - Wachtwoord sterkte meter
  - Requirements checklist
  - Security tips
- **Completion State**:
  - Success confirmation
  - Redirect naar login
  - Account beveiligings melding

#### Wat gebruikers KUNNEN DOEN:

##### Password Creation
- **New Password Setup**:
  - **Enter new password**: Kies nieuw wachtwoord
  - **Confirm password**: Bevestig wachtwoord match
  - **Password strength**: Bekijk sterkte meter
  - **Requirements check**: Voldoe aan beveiligings eisen
- **Completion Actions**:
  - **Submit new password**: Voltooie reset proces
  - **Return to login**: Ga naar login met nieuw wachtwoord
  - **Security notification**: Ontvang bevestiging email

---

## Mobile Navigation & Gesture System

### Bottom Navigation (Hoofdnavigatie)
**Component**: `BottomNavigation`

#### Navigatie Tabs
1. **🏠 Home** (`/mobile-v3`)
   - Dashboard overzicht
   - Snelle toegang tot functies
   - Badge: Ongelezen voicemails count
2. **📞 Calls** (`/mobile-v3/transcriptions`)
   - Transcripties overzicht
   - Voicemail management
   - Badge: Nieuwe transcripties count
3. **📅 Calendar** (`/mobile-v3/calendar`)
   - Kalender integratie
   - Afspraak management
   - Badge: Aankomende afspraken count
4. **📊 Analytics** (`/mobile-v3/analytics`)
   - Statistieken dashboard
   - Performance metrics
   - Badge: Nieuwe insights beschikbaar
5. **👤 Profile** (`/mobile-v3/profile`)
   - Gebruiker profiel
   - Instellingen en configuratie
   - Badge: Account notifications

#### Navigatie Behavior
- **Active State**: Huidige tab highlighted met kleur
- **Tap Interaction**: Directe navigatie naar gekozen sectie
- **Badge Notifications**: Real-time updates van counts
- **Haptic Feedback**: Trillingen bij tab switch
- **Smooth Transitions**: Geanimeerde overgangen tussen schermen

### Gesture Navigation System

#### Swipe Gestures
- **Horizontal Swipes**:
  - **Swipe left**: Volgende pagina/item
  - **Swipe right**: Vorige pagina/item
  - **Swipe left (cards)**: Archiveer actie
  - **Swipe right (cards)**: Verwijder actie
- **Vertical Swipes**:
  - **Pull down**: Refresh content
  - **Pull up**: Load more content
  - **Scroll**: Navigeer door content

#### Touch Interactions
- **Tap**: Primaire acties (selecteren, activeren)
- **Long Press**: Context menu's en secundaire acties
- **Double Tap**: Zoom of special actions
- **Pinch**: Zoom in/out op content
- **Drag**: Reorder items of scroll

#### Feedback System
- **Visual Feedback**: Highlight on touch, animation op acties
- **Haptic Feedback**: Trillingen bij belangrijke acties
- **Audio Feedback**: Optionele sound effects
- **Loading States**: Spinners en skeleton screens

---

## Data Management & API Integration

### Real-time Data Sources

#### Transcripties API (`/api/transcriptions`)
- **Client-specific filtering**: Filter op client ID
- **Real-time updates**: WebSocket of polling voor live data
- **Pagination**: Lazy loading voor performance
- **Caching**: Local storage voor offline access

#### User Profile API (`/api/user/profile`)
- **Profile management**: CRUD operations voor user data
- **Settings synchronization**: Sync preferences across devices
- **Subscription status**: Real-time billing informatie
- **Cal.com integration**: Kalender sync status

#### Analytics API
- **Statistics calculation**: Real-time berekeningen
- **Historical data**: Trends en vergelijkingen
- **Export functionality**: PDF/CSV export capabilities
- **Custom metrics**: User-defined KPIs

### Offline Capabilities

#### Local Storage Strategy
- **Critical data caching**: Belangrijke user data lokaal opslaan
- **Offline queue**: Acties queuen voor later sync
- **Sync on reconnect**: Automatische sync bij internet herstel
- **Conflict resolution**: Oplossen van data conflicts

#### Progressive Enhancement
- **Core functionality**: Basis features zonder internet
- **Graceful degradation**: Verminderde functionaliteit offline
- **Offline indicators**: Duidelijke offline status
- **Background sync**: Synchronisatie op achtergrond

### Performance Optimizations (Database-Driven)

#### Transcripties-Specific Optimizations
- **Smart Pagination**: 20 items per pagina voor 151+ records
- **Priority-Based Loading**: Failures eerst, successes later
- **JSONB Field Optimization**: 
  - Lazy load `transcript` (kan groot zijn)
  - Eager load `transcriptSummary` (gemiddeld 206 chars)
  - Cache `conversation` data lokaal
- **Database Indexing**:
  ```sql
  CREATE INDEX idx_call_transcriptions_priority ON call_transcriptions 
  (callSuccessful, callDuration, created_at DESC);
  
  CREATE INDEX idx_call_transcriptions_company ON call_transcriptions 
  (company_name, created_at DESC);
  ```

#### Real-World Performance Metrics
- **Target Load Time**: <200ms voor lijst view (20 items)
- **Memory Usage**: ~50KB per transcriptie card
- **Network Efficiency**: Batch API calls, minimize JSONB transfer
- **Offline Storage**: Cache laatste 100 transcripties lokaal

#### Loading Strategies
- **Skeleton Loading**: Placeholder voor conversation cards
- **Progressive Enhancement**: 
  - Eerst: `customer_name`, `created_at`, `callDuration`
  - Daarna: `transcriptSummary`, `company_name`
  - Laatste: `conversation` JSONB (op demand)
- **Virtualized Scrolling**: Voor smooth handling van 151+ items
- **Background Sync**: Nieuwe gesprekken ophalen elke 30s

#### Animation Performance
- **Priority Color Transitions**: Smooth fade tussen status kleuren
- **Card Expand/Collapse**: 300ms ease-in-out animations
- **Swipe Gestures**: 60fps swipe feedback
- **Pull-to-Refresh**: Native-feeling refresh indicator

---

## User Experience Design Patterns

### Mobile-First Design Philosophy

#### Touch-Friendly Interface
- **44px minimum touch targets**: Volg iOS/Android guidelines
- **Gesture recognition**: Natuurlijke mobile gestures
- **One-handed usage**: Bereikbare interface elementen
- **Context-aware UI**: Smart defaults en voorspellende acties

#### Loading & Feedback States
- **Skeleton screens**: Placeholder content tijdens loading
- **Progressive loading**: Stapsgewijze content reveal
- **Error states**: Duidelijke foutmeldingen met herstel opties
- **Success confirmation**: Positieve feedback op acties

### Accessibility Features

#### Screen Reader Support
- **ARIA labels**: Uitgebreide labeling voor screen readers
- **Semantic HTML**: Correcte heading hiërarchie
- **Focus management**: Keyboard navigatie ondersteuning
- **Skip links**: Snelle navigatie voor screen reader users

#### Visual Accessibility
- **High contrast mode**: Ondersteuning voor high contrast
- **Color blindness**: Kleur-onafhankelijke design
- **Text scaling**: Ondersteuning voor grote tekst
- **Reduced motion**: Respecteer motion preferences

#### Motor Accessibility
- **Grote touch targets**: Minimum 44px voor alle interactieve elementen
- **Gesture alternatives**: Keyboard equivalenten voor gestures
- **Timeout extensions**: Configureerbare timeout waarden
- **Voice control**: Ondersteuning voor voice commands

---

## Component Specificaties

### TranscriptionCard Component
```typescript
interface TranscriptionCardProps {
  id: string;
  customerName: string;
  companyName: string;
  callerPhone: string;
  createdAt: string;
  callDuration: number;
  callSuccessful: 'success' | 'failure' | 'unknown';
  transcriptSummary: string;
  onExpand?: (id: string) => void;
  onAction?: (action: string, id: string) => void;
}
```

**Priority Logic**:
```typescript
const getPriorityLevel = (callSuccessful: string, callDuration: number) => {
  if (callSuccessful === 'failure' && callDuration < 30) return 'urgent';
  if (callSuccessful === 'failure' && callDuration >= 30) return 'important';
  if (callSuccessful === 'success') return 'success';
  return 'unknown';
};
```

### SmartFilters Component
```typescript
interface FilterState {
  status: 'all' | 'success' | 'failure' | 'unknown';
  company: string | null;
  duration: 'all' | 'short' | 'normal' | 'long';
  dateRange: { start: Date; end: Date };
}
```

### Database Query Optimization
```sql
-- Optimized query for conversation list
SELECT 
  id, customer_name, company_name, caller_phone,
  created_at, callDuration, callSuccessful, 
  LEFT(transcriptSummary, 100) as summary_preview
FROM call_transcriptions
WHERE 
  created_at >= $1 AND
  ($2 IS NULL OR company_name = $2) AND
  ($3 IS NULL OR callSuccessful = $3)
ORDER BY 
  CASE callSuccessful 
    WHEN 'failure' THEN 1
    WHEN 'unknown' THEN 2  
    WHEN 'success' THEN 3
  END,
  callDuration ASC,
  created_at DESC
LIMIT 20 OFFSET $4;
```

---

## Technische Implementatie Details

### Progressive Web App (PWA) Features

#### Manifest.json Configuratie
```json
{
  "name": "VoicemailAI Mobile",
  "short_name": "VoicemailAI",
  "description": "AI-powered voicemail management",
  "theme_color": "#2563eb",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/mobile-v3/",
  "start_url": "/mobile-v3",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### Service Worker Features
- **Offline caching**: Critical resources cached lokaal
- **Background sync**: Queued actions tijdens offline
- **Push notifications**: Server-side notification support
- **App updates**: Seamless app updates

### State Management Architecture

#### Custom Hooks (Database-Integrated)
```typescript
// Transcriptions data management
export function useTranscriptions() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    company: null,
    duration: 'all',
    dateRange: { start: new Date(), end: new Date() }
  });

  // Optimized data fetching
  const fetchTranscriptions = useCallback(async (page = 0) => {
    const query = `
      SELECT id, customer_name, company_name, caller_phone,
             created_at, callDuration, callSuccessful, 
             LEFT(transcriptSummary, 100) as summary_preview
      FROM call_transcriptions
      WHERE created_at >= $1 AND
            ($2 IS NULL OR company_name = $2) AND
            ($3 IS NULL OR callSuccessful = $3)
      ORDER BY 
        CASE callSuccessful 
          WHEN 'failure' THEN 1
          WHEN 'unknown' THEN 2  
          WHEN 'success' THEN 3
        END,
        callDuration ASC,
        created_at DESC
      LIMIT 20 OFFSET $4
    `;
    
    const { data, error } = await supabase
      .rpc('get_transcriptions_optimized', {
        date_from: filters.dateRange.start.toISOString(),
        company_filter: filters.company,
        status_filter: filters.status === 'all' ? null : filters.status,
        page_offset: page * 20
      });
    
    if (error) throw error;
    return data;
  }, [filters]);

  // Real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('transcriptions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'call_transcriptions'
      }, (payload) => {
        setTranscriptions(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  return {
    transcriptions,
    loading,
    filters,
    setFilters,
    fetchTranscriptions,
    refetch: () => fetchTranscriptions(0)
  };
}

// Priority calculation hook
export function usePriority(callSuccessful: string, callDuration: number) {
  return useMemo(() => {
    if (callSuccessful === 'failure' && callDuration < 30) return 'urgent';
    if (callSuccessful === 'failure' && callDuration >= 30) return 'important';
    if (callSuccessful === 'success') return 'success';
    return 'unknown';
  }, [callSuccessful, callDuration]);
}
```

#### Local Storage Strategy
- **Dual storage**: localStorage + cookies voor SSR compatibility
- **Cross-tab sync**: Storage event listeners voor multi-tab support
- **Encryption**: Gevoelige data encryption in local storage
- **Cleanup**: Automatische cleanup van oude data

### Security Implementation

#### Authentication Security
- **Token management**: Secure JWT token handling
- **Session management**: Automatic session refresh
- **Logout security**: Complete session cleanup
- **Multi-device support**: Manage sessions across devices

#### Data Protection
- **Input validation**: Client-side en server-side validation
- **XSS protection**: Sanitization van user input
- **CSRF protection**: Token-based CSRF prevention
- **Data encryption**: Gevoelige data encryption

---

## Conclusie

De VoicemailAI Mobile-v3 interface biedt een complete, professionele mobiele ervaring voor AI-powered voicemail management. Met focus op gebruiksgemak, performance en toegankelijkheid, combineert de app moderne web technologieën met native mobile design patterns.

### Kernvoordelen
- **Intuïtieve interface**: Gesture-first design voor natuurlijke interactie
- **Comprehensive functionaliteit**: Alle features van desktop in mobile-geoptimaliseerde vorm
- **Real-time capabilities**: Live updates en synchronisatie
- **Offline support**: Basis functionaliteit zonder internet
- **Professional grade**: Enterprise-ready features en beveiliging

### Technische Excellentie
- **Progressive Web App**: Installeerbaar en native-feeling
- **Performance optimized**: Snelle loading en smooth animaties
- **Accessibility compliant**: Volledig toegankelijk voor alle gebruikers
- **Secure architecture**: Enterprise-grade beveiliging
- **Scalable design**: Klaar voor toekomstige uitbreidingen

Deze documentatie biedt een complete referentie voor de Mobile-v3 interface, geschikt voor developers, designers en product managers die werken aan de VoicemailAI mobile experience.