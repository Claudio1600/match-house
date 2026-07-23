import { PrismaClient, UserType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const DEFAULT_PASSWORD = "Password123!";

interface CityCoords {
  city: string;
  lat: number;
  lng: number;
}

const ITALIAN_CITIES: CityCoords[] = [
  { city: "Milano", lat: 45.4642, lng: 9.19 },
  { city: "Roma", lat: 41.9028, lng: 12.4964 },
  { city: "Torino", lat: 45.0703, lng: 7.6869 },
  { city: "Firenze", lat: 43.7696, lng: 11.2558 },
  { city: "Bologna", lat: 44.4949, lng: 11.3426 },
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d;
}

const LANDLORD_DATA = [
  {
    title: "Luminoso bilocale in Navigli",
    address: "Via Corsico 12",
    description:
      "Appartamento arredato con gusto a due passi dai Navigli. Ampia cucina, bagno moderno, spazio condiviso con altri due inquilini professionisti.",
    houseRules: "No feste rumorose. Rispetto degli orari condominiali.",
    neighborhoodInfo:
      "Quartiere vivace con bar, ristoranti e ottimi collegamenti metro.",
  },
  {
    title: "Camera singola in appartamento Prati",
    address: "Via Cola di Rienzo 88",
    description:
      "Camera spaziosa in appartamento signorile vicino al Vaticano. Tre coinquilini lavoratori, ambiente tranquillo e pulito.",
    houseRules: "Rispetto delle zone comuni. Pulizie a rotazione.",
    neighborhoodInfo:
      "Quartiere Prati, elegante e ben servito. Metro A a 5 minuti.",
  },
  {
    title: "Stanza in loft San Salvario",
    address: "Via Nizza 45",
    description:
      "Stanza in luminoso loft ristrutturato nel quartiere più trendy di Torino. Soffitti alti, ampia zona comune.",
    houseRules: "Animali benvenuti. No fumo in casa.",
    neighborhoodInfo:
      "San Salvario è il quartiere più vivace di Torino, pieno di locali e mercati.",
  },
  {
    title: "Appartamento con terrazza in Oltrarno",
    address: "Via dei Serragli 23",
    description:
      "Affascinante appartamento fiorentino con terrazza panoramica. Due camere disponibili, arredamento d'epoca.",
    houseRules: "Silenzio dopo le 22:00. Pulizie settimanali condivise.",
    neighborhoodInfo:
      "Oltrarno, il lato bohémien di Firenze. A piedi da Ponte Vecchio.",
  },
  {
    title: "Stanza vicino UniBo",
    address: "Via Zamboni 15",
    description:
      "Stanza luminosa in appartamento studentesco a 3 minuti dall'università. WiFi veloce, cucina attrezzata.",
    houseRules: "Rispetto degli orari. Pulizie a turno.",
    neighborhoodInfo:
      "Zona universitaria, piena di vita. Librerie, caffè e locali.",
  },
  {
    title: "Camera in villa con giardino, Brera",
    address: "Via Fiori Chiari 7",
    description:
      "Stanza esclusiva in elegante villa milanese con giardino privato. Ambiente cosmopolita con inquilini internazionali.",
    houseRules: "Silenzio notturno. Ospiti concordati in anticipo.",
    neighborhoodInfo:
      "Brera: gallerie d'arte, ristoranti di lusso, mercatino famoso.",
  },
  {
    title: "Trilocale a Trastevere",
    address: "Vicolo del Piede 3",
    description:
      "Incantevole appartamento romano nel cuore di Trastevere. Due camere disponibili, archi in mattoni originali.",
    houseRules: "Rispetto del vicinato. No feste oltre mezzanotte.",
    neighborhoodInfo:
      "Trastevere: tra i quartieri più affascinanti di Roma. Pieno di vita.",
  },
  {
    title: "Studio moderno in Porta Garibaldi",
    address: "Via Farini 60",
    description:
      "Camera in appartamento di design nel quartiere più moderno di Milano. Vicino a Eataly e ai migliori coworking.",
    houseRules: "No fumo. Animali non ammessi.",
    neighborhoodInfo: "Isola/Garibaldi: startup, design, locali alla moda.",
  },
  {
    title: "Appartamento storico a Santo Spirito",
    address: "Piazza Santo Spirito 8",
    description:
      "Palazzo del '500 ristrutturato con travi originali. Tre camere, ampia sala comune, posizione centrale.",
    houseRules: "Rispetto del condominio storico. No fumo.",
    neighborhoodInfo:
      "Cuore di Firenze, a due passi da Palazzo Pitti e Boboli.",
  },
  {
    title: "Attico condiviso a Quadrilatero",
    address: "Via Po 18",
    description:
      "Splendido attico con vista sui tetti di Torino. Due camere disponibili, cucina moderna, terrazza.",
    houseRules: "Ambiente adulto e tranquillo. Rispetto reciproco.",
    neighborhoodInfo:
      "Quadrilatero Romano: mercato, gallerie, locali, tutto a piedi.",
  },
];

const SEEKER_DATA = [
  {
    firstName: "Marco",
    lastName: "Rossi",
    age: 26,
    occupation: "Sviluppatore software",
    bio: "Dev full-stack appassionato di open source. Amo la montagna e il caffè. Cerco un posto tranquillo dove lavorare da remoto.",
    company: "Startup tech",
    schedule: "Mattiniero, lavoro da casa 3 giorni a settimana",
    hobbies: ["Escursionismo", "Fotografia", "Cucina"],
    sports: ["Running", "Ciclismo"],
    languages: ["Italiano", "Inglese"],
  },
  {
    firstName: "Giulia",
    lastName: "Ferrari",
    age: 24,
    occupation: "Studentessa magistrale",
    bio: "Studio architettura. Amo i musei, il cinema d'essai e i mercatini. Sono ordinata e rispettosa degli spazi comuni.",
    university: "Politecnico di Milano",
    schedule: "Lezioni al mattino, studio in biblioteca il pomeriggio",
    hobbies: ["Design", "Arte contemporanea", "Cinema"],
    sports: ["Yoga", "Pilates"],
    languages: ["Italiano", "Inglese", "Francese"],
  },
  {
    firstName: "Luca",
    lastName: "Bianchi",
    age: 29,
    occupation: "Product Manager",
    bio: "Lavoro per una startup fintech. Sono tranquillo, rispettoso e amo cucinare per i coinquilini. No drama.",
    company: "Fintech SpA",
    schedule: "9-18 in ufficio",
    hobbies: ["Cucina", "Vino", "Viaggi"],
    sports: ["Tennis", "Nuoto"],
    languages: ["Italiano", "Inglese", "Spagnolo"],
  },
  {
    firstName: "Sofia",
    lastName: "Esposito",
    age: 23,
    occupation: "Studentessa triennale",
    bio: "Studio medicina. Studio molto ma sono anche socia. Cerco un coinquilino con orari simili ai miei.",
    university: "Università La Sapienza",
    schedule: "Lezioni irregolari, studio notturno durante gli esami",
    hobbies: ["Libri", "Serie TV", "Gatto"],
    sports: ["Camminata"],
    languages: ["Italiano", "Inglese"],
  },
  {
    firstName: "Alessandro",
    lastName: "Conti",
    age: 31,
    occupation: "Graphic Designer",
    bio: "Freelancer creativo. Lavoro da casa ma sono silenzioso. Amo le piante, la musica indie e i gatti.",
    company: "Freelance",
    schedule: "Orari flessibili, in genere mattine creative",
    hobbies: ["Illustrazione", "Vinile", "Piante"],
    sports: ["Skateboard"],
    languages: ["Italiano", "Inglese"],
  },
  {
    firstName: "Valentina",
    lastName: "Ricci",
    age: 27,
    occupation: "Dottoranda",
    bio: "Dottorato in letteratura comparata. Sono tranquilla e ordinata. Amo la letteratura, il teatro e i mercatini dell'antiquariato.",
    university: "Università di Bologna",
    schedule: "Mattine in biblioteca, pomeriggi di scrittura",
    hobbies: ["Lettura", "Teatro", "Antiquariato"],
    sports: ["Yoga"],
    languages: ["Italiano", "Inglese", "Tedesco", "Francese"],
  },
  {
    firstName: "Francesco",
    lastName: "Romano",
    age: 28,
    occupation: "Chef",
    bio: "Lavoro in un ristorante stellato. Orari serali, mattine libere. Porto spesso avanzi di cucina gourmet — ottimo coinquilino!",
    company: "Ristorante La Pergola",
    schedule: "Pomeriggi e serate in ristorante, mattine libere",
    hobbies: ["Cucina", "Fermentazione", "Mercati"],
    sports: ["Calcetto"],
    languages: ["Italiano", "Inglese"],
  },
  {
    firstName: "Chiara",
    lastName: "Lombardi",
    age: 25,
    occupation: "Marketing Manager",
    bio: "Lavoro in un'agenzia di comunicazione. Sono energica, social e amo organizzare aperitivi in casa. Cerco un posto con buona vibe.",
    company: "Agenzia Creative Lab",
    schedule: "9-18 in ufficio, smartworking il venerdì",
    hobbies: ["Fotografia", "Viaggi", "Cibo"],
    sports: ["Palestra", "Running"],
    languages: ["Italiano", "Inglese"],
  },
  {
    firstName: "Matteo",
    lastName: "Marini",
    age: 30,
    occupation: "Ingegnere civile",
    bio: "Ingegnere strutturista. Tranquillo, ordinato, amo il calcio e la pizza. Cerco coinquilini simpatici ma rispettosi.",
    company: "Studio Marini Ingegneria",
    schedule: "Orari d'ufficio standard",
    hobbies: ["Calcio", "Serie A", "Videogiochi"],
    sports: ["Calcio", "Ciclismo"],
    languages: ["Italiano", "Inglese"],
  },
  {
    firstName: "Elena",
    lastName: "Costa",
    age: 26,
    occupation: "Fisioterapista",
    bio: "Lavoro in una clinica privata. Amo il fitness, la natura e i cani. Sono mattiniera e ordinate. Cerco un ambiente sano e sereno.",
    company: "Clinica FisioSport",
    schedule: "Mattine e pomeriggi in clinica",
    hobbies: ["Meditazione", "Escursionismo", "Cucina sana"],
    sports: ["CrossFit", "Trail running"],
    languages: ["Italiano", "Inglese"],
  },
];

async function main(): Promise<void> {
  console.log("Inizio seed del database...");

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  // ── Landlords ──────────────────────────────────────────────────────────────
  for (let i = 0; i < 10; i++) {
    const cityData = ITALIAN_CITIES[i % ITALIAN_CITIES.length];
    const data = LANDLORD_DATA[i];
    const rent = randInt(400, 1200);

    const user = await prisma.user.upsert({
      where: { email: `landlord${i + 1}@matchhouse.test` },
      update: {},
      create: {
        email: `landlord${i + 1}@matchhouse.test`,
        passwordHash,
        userType: UserType.LANDLORD,
        isVerified: true,
      },
    });

    const profile = await prisma.landlordProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        title: data.title,
        address: data.address,
        city: cityData.city,
        latitude: cityData.lat + (Math.random() - 0.5) * 0.05,
        longitude: cityData.lng + (Math.random() - 0.5) * 0.05,
        rent,
        totalRooms: randInt(2, 5),
        availableRooms: randInt(1, 2),
        currentTenants: randInt(1, 3),
        squareMeters: randInt(60, 150),
        floor: randInt(0, 6),
        furnished: Math.random() > 0.3,
        billsIncluded: Math.random() > 0.5,
        petsAllowed: Math.random() > 0.6,
        smokingAllowed: Math.random() > 0.8,
        wifiIncluded: Math.random() > 0.2,
        parkingAvailable: Math.random() > 0.7,
        availableFrom: futureDate(randInt(7, 60)),
        description: data.description,
        houseRules: data.houseRules,
        neighborhoodInfo: data.neighborhoodInfo,
      },
    });

    // Add 3 placeholder photos
    const existingPhotos = await prisma.propertyPhoto.count({
      where: { landlordProfileId: profile.id },
    });
    if (existingPhotos === 0) {
      await prisma.propertyPhoto.createMany({
        data: [0, 1, 2].map((order) => ({
          landlordProfileId: profile.id,
          url: `https://picsum.photos/seed/landlord${i + 1}_${order}/800/600`,
          cloudinaryId: `seed/landlord${i + 1}_photo${order}`,
          order,
          isMain: order === 0,
        })),
      });
    }

    console.log(`  Landlord ${i + 1}: ${user.email} — ${data.title}`);
  }

  // ── Seekers ────────────────────────────────────────────────────────────────
  for (let i = 0; i < 10; i++) {
    const preferredCity = rand(ITALIAN_CITIES).city;
    const data = SEEKER_DATA[i];
    const budgetMin = randInt(300, 500);
    const budgetMax = budgetMin + randInt(200, 600);

    const user = await prisma.user.upsert({
      where: { email: `seeker${i + 1}@matchhouse.test` },
      update: {},
      create: {
        email: `seeker${i + 1}@matchhouse.test`,
        passwordHash,
        userType: UserType.SEEKER,
        isVerified: true,
      },
    });

    const profile = await prisma.seekerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        bio: data.bio,
        occupation: data.occupation,
        university: data.university ?? null,
        company: data.company ?? null,
        smoker: Math.random() > 0.8,
        hasPets: Math.random() > 0.7,
        schedule: data.schedule,
        cleanliness: randInt(3, 5),
        noiseLevel: randInt(1, 4),
        budgetMin,
        budgetMax,
        preferredCity,
        moveInDate: futureDate(randInt(14, 90)),
        hobbies: data.hobbies,
        sports: data.sports,
        languages: data.languages,
      },
    });

    // Add 2 placeholder photos
    const existingPhotos = await prisma.seekerPhoto.count({
      where: { seekerProfileId: profile.id },
    });
    if (existingPhotos === 0) {
      await prisma.seekerPhoto.createMany({
        data: [0, 1].map((order) => ({
          seekerProfileId: profile.id,
          url: `https://picsum.photos/seed/seeker${i + 1}_${order}/400/400`,
          cloudinaryId: `seed/seeker${i + 1}_photo${order}`,
          order,
          isMain: order === 0,
        })),
      });
    }

    console.log(
      `  Seeker ${i + 1}: ${user.email} — ${data.firstName} ${data.lastName}`
    );
  }

  console.log("\nSeed completato con successo!");
  console.log(
    `\nPassword per tutti gli utenti seed: ${DEFAULT_PASSWORD}`
  );
}

main()
  .catch((err) => {
    console.error("Errore nel seed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
