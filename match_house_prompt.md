# Match House — Prompt di sviluppo completo

## Contesto e obiettivo

Sei uno sviluppatore full-stack senior. Il tuo compito è costruire **Match House**, un'applicazione mobile (React Native + Expo) con backend Node.js/Express e database PostgreSQL. L'app è una piattaforma di matching per la ricerca di stanze in affitto e coinquilini, ispirata alla logica di Tinder applicata al mondo immobiliare. Il design deve essere **minimal, professionale e pulito**: superfici bianche, bordi sottili, tipografia leggera, nessun gradiente o ombra decorativa.

---

## Stack tecnologico

### Frontend
- **React Native** con **Expo** (SDK 51+)
- **React Navigation v6** per la navigazione (Stack + Bottom Tabs)
- **Expo Router** per il file-based routing
- **Zustand** per la gestione dello stato globale
- **React Query (TanStack Query v5)** per fetching e caching dati
- **Reanimated 3** + **Gesture Handler** per le animazioni swipe
- **Expo Image** per la gestione ottimizzata delle immagini
- **React Native Maps** (Expo) per la visualizzazione della mappa
- **Socket.io-client** per la chat real-time
- **Expo SecureStore** per il salvataggio sicuro del token JWT
- **Expo ImagePicker** per l'upload di foto

### Backend
- **Node.js** con **Express**
- **TypeScript** su entrambi i lati
- **PostgreSQL** come database principale
- **Prisma ORM** per la gestione del database
- **Socket.io** per la chat real-time
- **JWT** per l'autenticazione (access token 15min + refresh token 7gg)
- **Multer + Cloudinary** per l'upload e la gestione delle immagini
- **Zod** per la validazione degli input
- **bcrypt** per l'hashing delle password
- **node-cron** per job periodici (pulizia token scaduti, notifiche)

### Infrastruttura
- **Docker + Docker Compose** per lo sviluppo locale
- **Redis** per sessioni, rate limiting e pub/sub Socket.io
- **Cloudinary** per lo storage delle immagini
- Database ospitato su **Supabase** (PostgreSQL managed) in produzione
- Deploy backend su **Railway** o **Render**
- Deploy app su **Expo EAS Build** (iOS + Android)

---

## Struttura del progetto

```
match-house/
├── apps/
│   ├── mobile/               # React Native / Expo
│   │   ├── app/              # Expo Router (file-based routing)
│   │   │   ├── (auth)/       # Schermate autenticazione
│   │   │   ├── (tabs)/       # Tab principali post-login
│   │   │   └── _layout.tsx
│   │   ├── components/       # Componenti riutilizzabili
│   │   ├── hooks/            # Custom hooks
│   │   ├── stores/           # Zustand stores
│   │   ├── services/         # Chiamate API
│   │   ├── types/            # Tipi TypeScript condivisi
│   │   └── utils/
│   └── backend/              # Node.js / Express
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── socket/
│       │   └── utils/
│       ├── prisma/
│       │   └── schema.prisma
│       └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Schema del database (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserType {
  LANDLORD   // proprietario / inquilino che affitta
  SEEKER     // cercatore di stanza
}

enum SwipeAction {
  SMASH
  PASS
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String
  userType       UserType
  isVerified     Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  landlordProfile LandlordProfile?
  seekerProfile   SeekerProfile?
  refreshTokens   RefreshToken[]
  swipesGiven     Swipe[]   @relation("SwipeFrom")
  swipesReceived  Swipe[]   @relation("SwipeTo")
  matchesA        Match[]   @relation("MatchUserA")
  matchesB        Match[]   @relation("MatchUserB")
  messages        Message[]
}

model LandlordProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Dettagli immobile
  title             String   // es. "Trilocale Navigli"
  address           String
  city              String
  latitude          Float
  longitude         Float
  rent              Float    // prezzo mensile per stanza
  totalRooms        Int
  availableRooms    Int
  currentTenants    Int
  squareMeters      Int?
  floor             Int?

  // Caratteristiche
  furnished         Boolean  @default(false)
  billsIncluded     Boolean  @default(false)
  petsAllowed       Boolean  @default(false)
  smokingAllowed    Boolean  @default(false)
  wifiIncluded      Boolean  @default(false)
  parkingAvailable  Boolean  @default(false)
  availableFrom     DateTime

  // Testi liberi
  description       String
  houseRules        String?
  neighborhoodInfo  String?

  photos            PropertyPhoto[]

  updatedAt         DateTime @updatedAt
}

model PropertyPhoto {
  id                String          @id @default(cuid())
  landlordProfileId String
  landlordProfile   LandlordProfile @relation(fields: [landlordProfileId], references: [id], onDelete: Cascade)
  url               String
  cloudinaryId      String
  order             Int             @default(0)
  isMain            Boolean         @default(false)
}

model SeekerProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Dati personali
  firstName    String
  lastName     String
  age          Int
  bio          String
  occupation   String   // es. "Studente universitario" / "Sviluppatore"
  university   String?
  company      String?

  // Preferenze convivenza
  smoker       Boolean  @default(false)
  hasPets      Boolean  @default(false)
  schedule     String?  // es. "Nottambulo", "Mattiniero"
  cleanliness  Int      @default(3) // scala 1-5
  noiseLevel   Int      @default(3) // scala 1-5

  // Budget e preferenze ricerca
  budgetMin    Float?
  budgetMax    Float?
  preferredCity String?
  moveInDate   DateTime?

  // Array fields (stored as string arrays in Postgres)
  hobbies      String[]
  sports       String[]
  languages    String[]

  photos       SeekerPhoto[]

  updatedAt    DateTime @updatedAt
}

model SeekerPhoto {
  id             String        @id @default(cuid())
  seekerProfileId String
  seekerProfile  SeekerProfile @relation(fields: [seekerProfileId], references: [id], onDelete: Cascade)
  url            String
  cloudinaryId   String
  order          Int           @default(0)
  isMain         Boolean       @default(false)
}

model Swipe {
  id          String      @id @default(cuid())
  fromUserId  String
  toUserId    String
  action      SwipeAction
  createdAt   DateTime    @default(now())

  fromUser    User        @relation("SwipeFrom", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUser      User        @relation("SwipeTo", fields: [toUserId], references: [id], onDelete: Cascade)

  @@unique([fromUserId, toUserId])
}

model Match {
  id        String    @id @default(cuid())
  userAId   String
  userBId   String
  createdAt DateTime  @default(now())

  userA     User      @relation("MatchUserA", fields: [userAId], references: [id], onDelete: Cascade)
  userB     User      @relation("MatchUserB", fields: [userBId], references: [id], onDelete: Cascade)
  messages  Message[]

  @@unique([userAId, userBId])
}

model Message {
  id        String   @id @default(cuid())
  matchId   String
  senderId  String
  content   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  match     Match    @relation(fields: [matchId], references: [id], onDelete: Cascade)
  sender    User     @relation(fields: [senderId], references: [id], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## API REST — Endpoint completi

### Autenticazione `/api/auth`

| Metodo | Path | Descrizione |
|--------|------|-------------|
| POST | `/register` | Registra nuovo utente (email, password, userType) |
| POST | `/login` | Login → restituisce accessToken + refreshToken |
| POST | `/refresh` | Rinnova accessToken tramite refreshToken |
| POST | `/logout` | Invalida refreshToken |
| POST | `/verify-email` | Verifica email con codice OTP |
| POST | `/forgot-password` | Invia email reset password |
| POST | `/reset-password` | Resetta password con token |

### Profilo proprietario `/api/landlord-profile`

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | `/me` | Legge profilo dell'utente autenticato |
| POST | `/` | Crea profilo (prima configurazione) |
| PUT | `/` | Aggiorna profilo |
| DELETE | `/` | Elimina profilo |
| POST | `/photos` | Upload foto (max 10, multipart/form-data) |
| DELETE | `/photos/:photoId` | Elimina foto |
| PUT | `/photos/reorder` | Riordina foto |

### Profilo cercatore `/api/seeker-profile`

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | `/me` | Legge profilo dell'utente autenticato |
| POST | `/` | Crea profilo (prima configurazione) |
| PUT | `/` | Aggiorna profilo |
| DELETE | `/` | Elimina profilo |
| POST | `/photos` | Upload foto (max 6) |
| DELETE | `/photos/:photoId` | Elimina foto |

### Discovery `/api/discover`

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | `/` | Restituisce profili da mostrare (paginati, esclusi già visti) |
| GET | `/?lat=&lng=&radius=` | Filtra per distanza (km) |
| GET | `/?budgetMax=&city=` | Filtra per budget/città (solo seeker) |

La logica di discovery:
- Se l'utente è **SEEKER**: mostra profili `LandlordProfile` con almeno una stanza disponibile, esclusi quelli già swipati
- Se l'utente è **LANDLORD**: mostra profili `SeekerProfile` con `preferredCity` compatibile, esclusi già swipati
- Ordinamento: prima i profili con foto, poi per distanza geografica, poi per data di creazione
- Limite: 20 profili per batch (lazy load)

### Swipe `/api/swipe`

| Metodo | Path | Descrizione |
|--------|------|-------------|
| POST | `/` | Registra swipe `{ toUserId, action: "SMASH" | "PASS" }` |

Logica backend:
1. Salva lo swipe nel DB
2. Se `action === "SMASH"`, controlla se esiste già uno swipe SMASH reciproco
3. Se sì → crea record `Match`, emetti evento Socket.io `match:new` a entrambi gli utenti
4. Restituisce `{ matched: boolean, matchId?: string }`

### Match `/api/matches`

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | `/` | Lista di tutti i match dell'utente autenticato |
| GET | `/:matchId` | Dettaglio singolo match con ultimo messaggio |
| DELETE | `/:matchId` | Elimina match (e relativa chat) |

### Messaggi `/api/matches/:matchId/messages`

| Metodo | Path | Descrizione |
|--------|------|-------------|
| GET | `/` | Lista messaggi (paginata, `?cursor=&limit=`) |
| PUT | `/read` | Marca tutti i messaggi come letti |

I messaggi vengono inviati e ricevuti via **Socket.io** (non HTTP), ma la history è recuperabile via REST.

---

## Socket.io — Architettura real-time

### Namespace: `/chat`

**Autenticazione socket**: il client invia il JWT come query param o nell'handshake auth.

```javascript
// Client
const socket = io("wss://api.matchhouse.app/chat", {
  auth: { token: accessToken }
});

// Server middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  const payload = verifyJWT(token);
  socket.data.userId = payload.userId;
  next();
});
```

**Events emessi dal client:**

| Event | Payload | Descrizione |
|-------|---------|-------------|
| `join:match` | `{ matchId }` | Entra nella room della chat |
| `leave:match` | `{ matchId }` | Esce dalla room |
| `message:send` | `{ matchId, content }` | Invia messaggio |
| `typing:start` | `{ matchId }` | Sta scrivendo |
| `typing:stop` | `{ matchId }` | Ha smesso di scrivere |

**Events emessi dal server:**

| Event | Payload | Descrizione |
|-------|---------|-------------|
| `message:new` | `{ id, matchId, senderId, content, createdAt }` | Nuovo messaggio ricevuto |
| `message:read` | `{ matchId, userId }` | Messaggi letti |
| `match:new` | `{ matchId, otherUser }` | Nuovo match avvenuto |
| `typing:update` | `{ matchId, userId, isTyping }` | Stato digitazione |

---

## Struttura schermate mobile (Expo Router)

```
app/
├── _layout.tsx              # Root layout (auth gate)
├── (auth)/
│   ├── _layout.tsx
│   ├── welcome.tsx          # Schermata iniziale con scelta ruolo
│   ├── login.tsx
│   ├── register.tsx
│   ├── verify-email.tsx
│   └── onboarding/
│       ├── _layout.tsx
│       ├── landlord/
│       │   ├── step1-basics.tsx    # Titolo, indirizzo, mappa
│       │   ├── step2-details.tsx   # Stanze, prezzo, caratteristiche
│       │   ├── step3-rules.tsx     # Regole, quartiere
│       │   └── step4-photos.tsx    # Upload foto
│       └── seeker/
│           ├── step1-personal.tsx  # Nome, età, bio
│           ├── step2-lifestyle.tsx # Hobby, sport, abitudini
│           ├── step3-work.tsx      # Studio / lavoro
│           ├── step4-prefs.tsx     # Budget, città, data
│           └── step5-photos.tsx    # Upload foto
└── (tabs)/
    ├── _layout.tsx          # Bottom tab navigator
    ├── explore/
    │   ├── index.tsx        # Stack di swipe card
    │   └── [profileId].tsx  # Dettaglio profilo (modal)
    ├── matches/
    │   └── index.tsx        # Griglia match
    ├── chat/
    │   ├── index.tsx        # Lista conversazioni
    │   └── [matchId].tsx    # Schermata chat
    └── profile/
        ├── index.tsx        # Profilo utente
        ├── edit.tsx         # Modifica profilo
        └── settings.tsx     # Impostazioni
```

---

## Componenti chiave da implementare

### `<SwipeCard />`

Componente centrale dell'app. Deve supportare:
- Gesture pan orizzontale con `useGestureHandler` di Reanimated 3
- Rotazione leggera della card durante il drag (max ±15°)
- Overlay "SMASH" (verde, angolo sinistro) / "PASS" (rosso, angolo destro) che appare con opacità progressiva durante il drag
- Soglia di swipe: se il drag supera il 30% della larghezza schermo, confermare l'azione; altrimenti, spring-back
- Animazione di uscita: fly-out a sinistra (PASS) o a destra (SMASH)
- Gestione stack: 3 card pre-caricate, la terza in fondo leggermente rimpicciolita

```typescript
// Firma del componente
interface SwipeCardProps {
  profile: LandlordProfile | SeekerProfile;
  onSwipe: (userId: string, action: "SMASH" | "PASS") => void;
  isTop: boolean; // solo la card in cima è interattiva
}
```

### `<ProfileCard />`

Versione statica della card (per griglia match, modal dettaglio):
- Foto scorrevoli con dot indicator
- Info essenziali visibili senza scroll
- Badge per caratteristiche principali (arredato, animali, ecc.)
- Sezione mappa per i profili landlord

### `<ChatBubble />`

- Allineamento destra/sinistra in base a `senderId`
- Timestamp in formato relativo ("adesso", "5 min fa", "ieri")
- Stato lettura (spunta singola/doppia)
- Supporto testo lungo con wrap corretto

### `<MatchModal />`

Modal celebrativo che appare al momento del match:
- Animazione con le due foto che si avvicinano al centro
- CTA "Scrivi subito" → naviga alla chat
- CTA "Continua a esplorare" → chiude il modal

---

## Logica di autenticazione e token

```typescript
// services/auth.ts

// Salva token in SecureStore
await SecureStore.setItemAsync("accessToken", token);
await SecureStore.setItemAsync("refreshToken", refreshToken);

// Interceptor Axios: rinnova automaticamente l'access token
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      const { data } = await axios.post("/auth/refresh", { refreshToken });
      await SecureStore.setItemAsync("accessToken", data.accessToken);
      // Retry la richiesta originale
      error.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosInstance(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## Middleware backend

```typescript
// middleware/auth.ts
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token mancante" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId;
    req.userType = payload.userType;
    next();
  } catch {
    return res.status(401).json({ error: "Token non valido" });
  }
};

// middleware/rateLimiter.ts
// Rate limit: max 100 req/min per IP, max 10 swipe/min per utente
import rateLimit from "express-rate-limit";
export const swipeLimiter = rateLimit({ windowMs: 60_000, max: 60 });
```

---

## Design system mobile

Definisci questi token in un file `theme.ts` e usali ovunque. Mai hardcodare colori.

```typescript
// theme.ts
export const colors = {
  background: "#FFFFFF",
  surface: "#F7F7F5",
  surfaceElevated: "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
  borderStrong: "rgba(0,0,0,0.16)",
  textPrimary: "#1A1A1A",
  textSecondary: "#6B6B6B",
  textMuted: "#ADADAD",
  smash: "#1D9E75",    // verde per Smash
  smashBg: "#E1F5EE",
  pass: "#E24B4A",     // rosso per Pass
  passBg: "#FCEBEB",
  accent: "#1A1A1A",   // bottone primario
};

export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

export const radius = {
  sm: 6, md: 12, lg: 20, full: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "500" },
  h2: { fontSize: 22, fontWeight: "500" },
  h3: { fontSize: 18, fontWeight: "500" },
  body: { fontSize: 15, fontWeight: "400", lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: "400" },
  label: { fontSize: 11, fontWeight: "500", letterSpacing: 0.5 },
};
```

**Regole di design da rispettare:**
- Nessun gradiente, nessuna ombra decorativa (solo ombra funzionale per modal)
- Pesi font: solo 400 (regular) e 500 (medium). Mai 600 o 700
- Bordi: sempre `0.5px` o `1px`, colore `rgba(0,0,0,0.08)`
- Card radius: `12px` per card, `8px` per elementi interni, `999px` per pill/badge
- Bottom tab: icone Outline only, label 10px, nessuna ombra sopra
- Colori funzionali solo per Smash (verde) e Pass (rosso), tutto il resto in scala di grigi

---

## Funzionalità da implementare — lista completa

### MVP (versione 1.0)
- [ ] Autenticazione (register, login, refresh token, logout)
- [ ] Verifica email via OTP
- [ ] Onboarding multi-step (landlord + seeker)
- [ ] Upload foto su Cloudinary
- [ ] Discovery feed con swipe (Smash/Pass)
- [ ] Logica di match bilaterale
- [ ] Modal di match celebrativo
- [ ] Lista match
- [ ] Chat real-time via Socket.io
- [ ] Profilo utente (visualizzazione + modifica)
- [ ] Mappa nell'annuncio (landlord)
- [ ] Filtri base discovery (città, budget, distanza)
- [ ] Gestione errori e stati di caricamento

### Post-MVP (versione 1.1+)
- [ ] Notifiche push (Expo Notifications + FCM/APNs)
- [ ] Videochiamata integrata (via Agora.io o Twilio)
- [ ] Segnalazione profili inappropriati
- [ ] Sistema di blocco utenti
- [ ] Boost profilo (visibilità aumentata)
- [ ] Super Smash (notifica speciale all'altro utente)
- [ ] Scadenza automatica annunci
- [ ] Dashboard analytics per landlord
- [ ] Internazionalizzazione (i18n)

---

## Variabili d'ambiente

### Backend (`.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/matchhouse
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=another-secret-for-refresh-tokens
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@matchhouse.app
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8081
```

### Mobile (`.env` / `app.config.ts`)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=ws://localhost:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

---

## Sicurezza — checklist obbligatoria

- Tutte le password hashate con `bcrypt` (salt rounds: 12)
- JWT firmati con chiave ≥ 32 caratteri, mai esposta nel frontend
- Rate limiting su tutti gli endpoint pubblici (auth, swipe)
- Validazione input con Zod su ogni route
- Upload immagini: validazione MIME type + dimensione massima (10MB) lato server
- CORS configurato con whitelist (solo origini Expo/app)
- Helmet.js per headers HTTP di sicurezza
- Nessun dato sensibile loggato (password, token)
- Sanitizzazione HTML nei campi testo libero (bio, descrizione)
- Verifica che ogni operazione su profili/match appartenga all'utente autenticato (no IDOR)

---

## Istruzioni per lo sviluppo

Quando implementi questa applicazione:

1. **Inizia dal database**: crea le migrazioni Prisma e popola il DB con dati seed realistici (almeno 20 profili per tipo) prima di costruire qualsiasi UI.

2. **Poi il backend**: implementa gli endpoint in ordine — auth → profili → discovery → swipe → match → chat. Testa ogni route con Postman o Insomnia prima di procedere.

3. **Poi il mobile**: inizia dalla navigazione e dal sistema di autenticazione, poi l'onboarding, poi la schermata di swipe (la più complessa), poi chat e profilo.

4. **Usa TypeScript ovunque**: nessun `any`, tipi condivisi tra frontend e backend tramite un package `@match-house/types` nel monorepo.

5. **Gestisci sempre tre stati**: loading, error, empty — ogni schermata deve avere skeleton loader, stato di errore con retry, e stato vuoto con messaggio chiaro.

6. **Il componente SwipeCard è il cuore dell'app**: dedica il tempo necessario ad animazioni fluide (60fps costanti). Testa su dispositivo fisico, non solo su simulatore.

7. **La chat deve funzionare offline**: usa React Query per la cache dei messaggi, e accoda i messaggi inviati offline da rispedire alla riconnessione.
