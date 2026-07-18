# 🎭 Actor Coach — Scene Roulette PWA

A casino-inspired progressive web app for actors to practice scenes with AI-powered feedback. Built with Next.js, stateless and simple.

## Features

- **Scene Roulette** — Spin to get a random funny line + emotion challenge
- **Video Recording** — Front camera, 3s countdown, 5s auto-stop, preview/re-record
- **AI Feedback** — Scores for emotion, clarity, and pace + strength + retry cue
- **Coached Retry** — Second take with score comparison deltas
- **PWA Support** — Installable, offline-capable (app shell), portrait-first
- **Privacy-First** — No accounts, no stored videos, 20-min TTL exercises

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (TypeScript) |
| Styling | Tailwind CSS |
| State | React hooks + sessionStorage |
| Session | Signed cookies |
| AI | OpenAI (GPT-5 mini + GPT-4o mini Transcribe) |
| Tests | Jest + Playwright |

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment
cp .env.example .env.local

# Start development
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Access gate (Screen 0)
│   ├── layout.tsx         # Root layout with PWA meta
│   ├── globals.css        # Tailwind + custom styles
│   ├── roulette/page.tsx  # Scene Roulette (Screen 1)
│   ├── record/page.tsx    # Camera recording (Screen 2)
│   ├── feedback/page.tsx  # AI feedback display (Screen 3)
│   └── api/
│       ├── access/route.ts   # Access validation
│       ├── pool/route.ts     # Sentence pool generation
│       ├── exercise/route.ts # Exercise lifecycle
│       └── analyze/route.ts  # Video analysis pipeline
├── components/
│   ├── RouletteWheel.tsx     # Casino-style spinner
│   ├── CameraCapture.tsx     # Front camera + recording
│   ├── FeedbackDisplay.tsx   # Scores + deltas
│   ├── AccessGate.tsx        # Age/consent form
│   ├── LoadingSpinner.tsx    # Loading indicator
│   └── ErrorDisplay.tsx      # Error with retry
├── lib/
│   ├── ai.ts               # AI stubs (replace with OpenAI)
│   ├── exerciseStore.ts    # In-memory exercise store
│   ├── fallbackPool.ts     # Safe fallback sentences
│   ├── session.ts          # Session management
│   └── validation.ts       # Zod schemas + validators
├── types/
│   └── index.ts            # Shared TypeScript types
└── middleware.ts           # Route protection
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SESSION_SECRET` | ✅ | Min 32 chars, used for signed cookies |
| `OPENAI_API_KEY` | ⏳ | Add when configuring AI |

### AI Configuration

The AI module in `src/lib/ai.ts` uses stubs by default (`FALLBACK_MODE = true`). 
To enable real AI:

1. Set `OPENAI_API_KEY` in environment
2. Change `FALLBACK_MODE = false` in `src/lib/ai.ts`
3. The pipeline uses:
   - **GPT-5 mini** — Performance analysis from video frames
   - **GPT-4o mini Transcribe** — Audio transcription

## Testing

```bash
# Unit + component + integration tests
npm test

# With coverage
npm run test:coverage

# E2E tests (requires dev server)
npx playwright test

# Watch mode
npm run test:watch
```

### Test Coverage

| Layer | File | Tests |
|-------|------|-------|
| Unit | `tests/unit/validation.test.ts` | Video validation, line validation, schemas |
| Unit | `tests/unit/fallbackPool.test.ts` | Pool size, uniqueness, content safety |
| Unit | `tests/unit/session.test.ts` | Encode/decode, tamper detection |
| Unit | `tests/unit/types.test.ts` | Constants and type exports |
| Component | `tests/component/RouletteWheel.test.tsx` | Idle/spin/landed states, disabled |
| Component | `tests/component/AccessGate.test.tsx` | Form rendering |
| Integration | `tests/integration/api.test.ts` | API validation logic |
| E2E | `tests/e2e/full-flow.spec.ts` | Full user journey |

## API Routes

### `POST /api/access`
Validate age confirmation and video consent, set session cookie.

### `GET /api/pool`
Return pre-generated sentence pool (8 lines + emotions).

### `POST /api/exercise`
Commit a roulette spin as an active exercise.

### `GET /api/exercise?id=xxx`
Retrieve exercise details.

### `POST /api/analyze`
Submit video take, get AI feedback. Multipart form:
- `video` — WebM file
- `exerciseId` — Exercise reference
- `attempt` — 1 or 2
- `line`, `emotion` — Challenge pairing

## Design System

The casino-inspired theme uses these custom Tailwind colors:

- **Stage** (`stage-*`) — Dark theater background (`#0a0a0f`)
- **Crimson** (`crimson-*`) — Primary accent (`#dc2626`)
- **Gold** (`gold-*`) — Secondary accent (`#f59e0b`)
- **Electric** (`electric-*`) — Interactive elements (`#6366f1`)

Animations respect `prefers-reduced-motion`.

## Privacy

- No user accounts or stored personal data
- Videos processed in isolated temp directories
- All files deleted after analysis (success or failure)
- 20-minute exercise TTL (in-memory)
- No AI inference on identity, age, or appearance

## License

Private Pilot — Internal use only.
