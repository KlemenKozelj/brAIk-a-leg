# 🦵 brAIk-a-leg — Scene Roulette

### *A slot machine that gambles with your dignity, then makes an AI roast the results.*

Pull the lever. It hands you a cursed line — say, *"I just called my girlfriend by my ex's name... in bed"* — and an emotion you must deliver it with, like **"smug."** You have 5 seconds, a front camera, and no way out. Then GPT-4o-mini watches the tape, scores your acting, and drags you for it, personally, by name (well — by vibe).

🎰 **Spin** a scene → 🎥 **Film** a 5-second take → 🤖 **Get roasted** (and coached) by AI → 🔄 **Redeem yourself** on retry #2 → 📤 **Share the receipts**

**Go put it in judges' hands right now:**

```bash
npm install && cp .env.example .env.local && npm run dev
```

No login screen. No database. No backend to explain, deploy, or apologize for when it falls over mid-demo — because there isn't one. It's a phone, a browser, and questionable life choices.

---

## Why judges should care

*(besides watching your own teammate get emotionally destroyed by an LLM in front of the room, which — try it once, it's the best part of any demo booth)*

- **Zero backend, fully functional.** Everything — video capture, frame extraction, audio transcription, AI scoring — runs in the browser. `npm install && npm run dev` really is the entire deploy story.
- **Real AI pipeline, not a gimmick.** The app pulls 3 frames from your video, extracts and transcribes the audio client-side (raw `AudioContext` → WAV, no ffmpeg), and sends it all to OpenAI for structured vision+language analysis.
- **Graceful without a key.** No `OPENAI_API_KEY`? The app falls back to a large bank of hand-written, unreasonably funny mock feedback instead of breaking — so it's demo-able offline, key-less, mid-flight, whatever.
- **A genuinely fun core loop.** Roulette spin → 5-second dare → AI roast → coached retry with score deltas → share card. Judges will replay it. That's the tell.
- **Built-in virality.** One tap fires the native share sheet (or copies to clipboard) with your viral score, star rating, and the AI's roast quote, ready to drop straight into a group chat — the app is designed to leave the room with the judge.
- **PWA, not just a website.** Installable, offline app-shell caching, portrait-locked — works the moment a judge pulls their phone out of their pocket.
- **Shake-to-spin.** Uses the `DeviceMotion` API — physically shake the phone to re-spin instead of tapping a button. Small detail, big "oh that's slick" reaction.

## Try it in 60 seconds

```bash
npm install
cp .env.example .env.local
npm run dev
# open http://localhost:3000 on your phone or desktop (front camera required)
```

Add a real AI pass by setting one env var in `.env.local`:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

No key set → the app still fully works, just with mock ("Fortune-Teller Mode") feedback instead of live model output.

## The loop

```
🎰 Roulette          🎥 Record            🤖 Feedback
Spin a wheel for  →  3s countdown,    →   Emotion/clarity/pace
a funny line +       5s auto-stop         scores + viral score
a target emotion     recording,           + a roast + a
(shake phone to       preview/re-record    "coached retry" cue
re-spin)                                       │
                                                ▼
                                        🔄 Coached Retry
                                        Same line, one more take
                                        → side-by-side score deltas
                                        → 🎰 back to a new scene
```

All state lives in `sessionStorage` — nothing is written to a server or a database, and nothing survives a tab close.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS, custom casino/theater theme |
| State | React hooks + `sessionStorage` (no backend) |
| Video/Audio | `MediaRecorder`, `<canvas>` frame grabs, `AudioContext` WAV encoding — all in-browser |
| AI | OpenAI `gpt-4o-mini` (vision + structured JSON feedback), `gpt-4o-transcribe` (audio) |
| Motion | `DeviceMotion` API for shake-to-spin |
| PWA | Web app manifest + service worker (`public/sw.js`), installable, offline app shell |
| Tests | Jest + Testing Library (unit/component), Playwright (E2E) |

## What happens on submit

1. Pull 3 frames from the recorded clip (25%/50%/75% through, or adapted for very short clips).
2. Decode the WebM's audio track and hand-roll it into a WAV blob — no ffmpeg dependency needed.
3. Transcribe the audio with `gpt-4o-transcribe`.
4. Send the frames + transcript + target line/emotion to `gpt-4o-mini` with a structured JSON response format, asking for:
   - `emotion` / `clarity` / `pace` scores (1–5)
   - a `viralScore` (1–10, "would this break the internet")
   - a one-line `roast` (funny, not cruel)
   - a `strength` and a `retryCue` for the coached second take
5. Any failure at any step (no key, camera denied, model error) falls back to a large bank of pre-written funny feedback so the demo never dead-ends.

See [src/lib/ai.ts](src/lib/ai.ts) for the full pipeline.

## Project structure

```
src/
├── app/
│   ├── page.tsx            # Redirects straight to /roulette
│   ├── roulette/page.tsx   # Screen 1 — spin for line + emotion
│   ├── record/page.tsx     # Screen 2 — camera capture + submit
│   └── feedback/page.tsx   # Screen 3 — scores, roast, retry/deltas
├── components/
│   ├── RouletteWheel.tsx   # Casino-style spinner + shake-to-spin
│   ├── CameraCapture.tsx   # Front camera, countdown, recording, preview
│   ├── FeedbackDisplay.tsx # Scores, viral meter, roast card, share
│   └── ...
├── lib/
│   ├── ai.ts               # Browser-side OpenAI pipeline + mock fallback
│   ├── fallbackPool.ts     # 50 lines + 20 emotions
│   └── useShake.ts         # DeviceMotion shake detection hook
└── types/index.ts          # Shared types + constants
```

## Testing

```bash
npm test              # unit + component tests
npm run test:coverage # with coverage
npx playwright test   # E2E (requires dev server running)
```

## Privacy

- No accounts, no sign-in, no server-side storage.
- Video never leaves the device except as ephemeral frames/audio sent directly to OpenAI for analysis — nothing is persisted server-side because there is no server.
- All exercise/session state lives in `sessionStorage` and is cleared on new scenes or tab close.

## License

Private — hackathon submission.
