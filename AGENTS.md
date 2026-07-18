# Actor Coach — Scene Roulette PWA

## Overview

A casino-inspired progressive web app for actors to practice scenes with AI-powered feedback. Pure frontend MVP — no backend, no database, no sessions.

## Architecture

**Stack:** Next.js 14 (TypeScript) + Tailwind CSS. 100% client-side.

All state lives in `sessionStorage`. No API routes, no middleware, no server-side rendering logic.

## Screen Flow

```
Screen 0: / (Home)
  → auto-redirects to /roulette

Screen 1: /roulette (Scene Roulette)
  - RouletteWheel component with hardcoded 50 funny lines + 20 emotions
  - Spin animates for ~1.8s, then lands on a random line + emotion
  - "Start take" button appears → creates Exercise in sessionStorage → navigates to /record

Screen 2: /record (Record Take)
  - Reads Exercise from sessionStorage('currentExercise')
  - Shows challenge (line + emotion)
  - "Submit take" button → calls analyzeTake() stub from ai.ts
  - Stores result in sessionStorage('analysisResult') + handles firstTakeScores/comparison
  - Navigates to /feedback

Screen 3: /feedback (Feedback)
  - Reads AnalysisResult from sessionStorage('analysisResult')
  - Take 1: shows feedback + "Coached Retry" → updates exercise.attempt=2 → /record
  - Take 2: shows feedback + deltas + "Spin a new scene" → clears storage → /roulette
```

## Key Files

| File | Role |
|------|------|
| `src/app/page.tsx` | Auto-redirect to /roulette |
| `src/app/roulette/page.tsx` | Scene Roulette — spin, land, start take |
| `src/app/record/page.tsx` | Submit take, get AI feedback |
| `src/app/feedback/page.tsx` | Display scores + retry cue + comparison |
| `src/components/RouletteWheel.tsx` | Casino-style spinner (line reel + emotion wheel) |
| `src/components/CameraCapture.tsx` | Front camera recording with countdown |
| `src/components/FeedbackDisplay.tsx` | Score cards with star ratings, deltas, action button |
| `src/components/LoadingSpinner.tsx` | Simple loading indicator |
| `src/components/ErrorDisplay.tsx` | Error message with retry |
| `src/lib/ai.ts` | AI stub — replace analyzeTake() with real OpenAI |
| `src/lib/fallbackPool.ts` | 50 hardcoded funny lines + 20 emotions |
| `src/lib/validation.ts` | Client-side line validation + emotion check |
| `src/types/index.ts` | All TypeScript interfaces and constants |

## Data Flow (all sessionStorage)

```
currentExercise  → { id, line, emotion, attempt }
firstTakeScores  → { emotion, clarity, pace }  (set on take 1, consumed on take 2)
analysisResult   → { feedback: { scores, strength, retryCue }, comparison?: { deltas } }
exerciseAttempt  → "1" | "2"
```

## Tests

```
tests/unit/           → validation, fallbackPool, types
tests/component/      → RouletteWheel
```

Run: `npm test`

## AI Integration

`src/lib/ai.ts` exports `analyzeTake(line, emotion, videoBlob?)` — fully wired up.

### Pipeline (all browser-side)

| Step | What happens | Model |
|------|-------------|-------|
| 1 | Extract 3 frames at 25%/50%/75% | `<video>` + `<canvas>` → base64 JPEG |
| 2 | Extract audio → WAV | `AudioContext.decodeAudioData()` |
| 3 | Transcribe audio | `gpt-4o-transcribe` |
| 4 | Analyze frames + transcript | `gpt-4o-mini` vision → structured JSON |

### Configuration

Set `NEXT_PUBLIC_OPENAI_API_KEY` in `.env.local` for real AI analysis.
Without a key, the app falls back to mock data gracefully.

### Fallback behavior

- No API key → mock data (random scores + canned feedback)
- Audio extraction fails → skip transcription, analyze frames only
- Any API call fails → log warning, return mock data

## PWA Setup

| Asset | Path | Purpose |
|-------|------|---------|
| Manifest | `public/manifest.json` | SVG icons, standalone display, portrait lock |
| Service Worker | `public/sw.js` | Caches `_next/static/*` and icons, network-first for pages |
| Registration | Inline script in `src/app/layout.tsx` | Registers SW on load |
| Icons | `public/icons/icon-192.svg`, `icon-512.svg` | Theater mask emoji on crimson-gold gradient |
| iOS meta | `apple-touch-icon`, `apple-mobile-web-app-capable` | Safari home screen support |

Safari on iOS requires HTTPS or localhost for PWA install prompt.
Run `npm run dev` and access via `http://localhost:3000` to test.

### Tests

- `tests/unit/` — validation, fallbackPool, types
- `tests/component/` — RouletteWheel
- Run: `npm test`
