# Match House

Piattaforma di matching per la ricerca di stanze in affitto e coinquilini — ispirata alla logica di Tinder applicata al mondo immobiliare.

## Stack

| Layer | Tecnologia |
|-------|-----------|
| Mobile | React Native + Expo SDK 51 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL (Prisma ORM) |
| Cache / PubSub | Redis |
| Real-time | Socket.io |
| Immagini | Cloudinary |
| Auth | JWT (access 15min + refresh 7gg) |

## Struttura

```
match-house/
├── apps/
│   ├── mobile/      # React Native / Expo
│   └── backend/     # Node.js / Express
├── docker-compose.yml
└── README.md
```

## Setup sviluppo locale

### Prerequisiti
- Node.js 20+
- Docker + Docker Compose
- Expo CLI (`npm install -g expo-cli`)

### 1. Avvia database e Redis

```bash
docker-compose up -d postgres redis
```

### 2. Backend

```bash
cd apps/backend
cp .env.example .env
# Modifica .env con le tue credenziali Cloudinary e SMTP
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Il backend sarà disponibile su `http://localhost:3000`.

### 3. Mobile

```bash
cd apps/mobile
cp .env.example .env
npm install
npm start
```

Scansiona il QR code con Expo Go (Android) o Camera (iOS).

## Variabili d'ambiente

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://matchhouse:matchhouse_secret@localhost:5432/matchhouse
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-key-min-32-chars-here!!
JWT_REFRESH_SECRET=another-secret-for-refresh-tokens-32chars
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

### Mobile (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=ws://localhost:3000
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## API

Il backend espone le seguenti route:

- `POST /api/auth/register` — Registrazione
- `POST /api/auth/login` — Login
- `POST /api/auth/refresh` — Rinnovo token
- `POST /api/auth/logout` — Logout
- `GET /api/discover` — Feed di discovery
- `POST /api/swipe` — Swipe SMASH/PASS
- `GET /api/matches` — Lista match
- `GET /api/matches/:id/messages` — Messaggi chat

## Deploy

- **Backend**: Railway o Render (Docker container)
- **Database**: Supabase (PostgreSQL managed)
- **Mobile**: Expo EAS Build (iOS + Android)

## Funzionalità MVP

- Autenticazione con verifica email OTP
- Onboarding multi-step (landlord e seeker)
- Feed di swipe con animazioni Reanimated 3
- Matching bilaterale con modal celebrativo
- Chat real-time via Socket.io
- Mappa integrata per annunci landlord
- Filtri discovery (città, budget, distanza)
