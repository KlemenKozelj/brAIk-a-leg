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

`src/lib/ai.ts` exports `analyzeTake(line, emotion)` which currently returns mock feedback.
To wire up real AI:
1. Set `OPENAI_API_KEY` env var
2. Replace the function body with actual OpenAI calls
3. The function signature stays the same — no other changes needed
