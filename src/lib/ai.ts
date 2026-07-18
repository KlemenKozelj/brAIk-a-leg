// Browser-side AI analysis pipeline using OpenAI.
// All processing happens client-side — no backend needed.
import OpenAI from 'openai';
import { Feedback, PerformanceScores } from '@/types';

// ── Client ──────────────────────────────────────────────────────────────────

function getClient(): OpenAI {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey || apiKey === '') throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY');
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

// ── Frame extraction (25%, 50%, 75%) ────────────────────────────────────────

async function extractFrames(videoBlob: Blob): Promise<string[]> {
  const url = URL.createObjectURL(videoBlob);

  try {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Video failed to load'));
      const timeout = setTimeout(() => reject(new Error('Video load timeout')), 8000);
      // If already loaded
      if (video.readyState >= 1) { clearTimeout(timeout); resolve(); }
    });

    const duration = video.duration;
    if (!duration || duration < 0.5) return [];

    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d')!;

    const times = duration < 3
      ? [0, duration * 0.5, duration * 0.9]
      : [duration * 0.25, duration * 0.5, duration * 0.75];

    const frames: string[] = [];

    for (const t of times) {
      video.currentTime = t;
      await new Promise<void>((resolve, reject) => {
        const onSeeked = () => { video.removeEventListener('seeked', onSeeked); resolve(); };
        const onError = () => { video.removeEventListener('error', onError); reject(new Error('Seek failed')); };
        video.addEventListener('seeked', onSeeked);
        video.addEventListener('error', onError);
        const timeout = setTimeout(() => { video.removeEventListener('seeked', onSeeked); resolve(); }, 5000);
      });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL('image/jpeg', 0.7));
    }

    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ── Audio extraction (WebM → WAV) ──────────────────────────────────────────

async function extractAudioAsWav(videoBlob: Blob): Promise<Blob | null> {
  try {
    const arrayBuffer = await videoBlob.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();

    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Interleave channels
    const interleaved = new Float32Array(length * numChannels);
    for (let ch = 0; ch < numChannels; ch++) {
      const channelData = audioBuffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        interleaved[i * numChannels + ch] = channelData[i];
      }
    }

    // Convert to 16-bit PCM
    const pcmData = new Int16Array(interleaved.length);
    for (let i = 0; i < interleaved.length; i++) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      pcmData[i] = Math.round(s < 0 ? s * 0x8000 : s * 0x7FFF);
    }

    const dataSize = pcmData.length * 2;
    const headerSize = 44;
    const totalSize = headerSize + dataSize;

    const wav = new ArrayBuffer(totalSize);
    const view = new DataView(wav);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, totalSize - 8, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);          // chunk size
    view.setUint16(20, 1, true);           // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
    view.setUint16(32, numChannels * 2, true); // block align
    view.setUint16(34, 16, true);          // bits per sample

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);
    for (let i = 0; i < pcmData.length; i++) {
      view.setInt16(headerSize + i * 2, pcmData[i], true);
    }

    return new Blob([wav], { type: 'audio/wav' });
  } catch {
    // If audio extraction fails, return null — we'll skip transcription
    return null;
  }
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// ── OpenAI Transcription ────────────────────────────────────────────────────

async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const openai = getClient();
  const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
  const transcription = await openai.audio.transcriptions.create({
    model: 'gpt-4o-transcribe',
    file,
  });
  return transcription.text || '';
}

// ── Vision + Text Analysis ─────────────────────────────────────────────────

function clampScore(n: unknown): number {
  const num = Number(n);
  if (isNaN(num)) return 3;
  return Math.max(1, Math.min(5, Math.round(num)));
}

function parseFeedback(raw: string): Feedback {
  try {
    const parsed = JSON.parse(raw);
    return {
      scores: {
        emotion: clampScore(parsed.scores?.emotion),
        clarity: clampScore(parsed.scores?.clarity),
        pace: clampScore(parsed.scores?.pace),
      },
      strength: typeof parsed.strength === 'string' ? parsed.strength : 'Good take overall.',
      retryCue: typeof parsed.retryCue === 'string' ? parsed.retryCue : 'Keep practicing.',
    };
  } catch {
    throw new Error('AI returned malformed feedback');
  }
}

async function analyzePerformance(
  line: string,
  emotion: string,
  transcript: string,
  frameDataUrls: string[]
): Promise<Feedback> {
  const openai = getClient();

  const prompt = `You are an acting coach analyzing a video take.
The actor was given a line to deliver with a specific emotion.

Line to deliver: "${line}"
Target emotion: ${emotion}
Transcript of what was said: "${transcript}"

Analyze the performance across three dimensions (1-5 scale):
- emotion: How well did they convey the target emotion?
- clarity: How clear was their speech and diction?
- pace: How effective was their pacing and timing?

Return ONLY valid JSON with this structure:
{
  "scores": { "emotion": <1-5>, "clarity": <1-5>, "pace": <1-5> },
  "strength": "one sentence about what they did well",
  "retryCue": "one sentence about what to improve on the retry"
}

Do NOT wrap in markdown. Return raw JSON only.`;

  const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: 'text', text: prompt },
  ];

  for (const url of frameDataUrls) {
    content.push({
      type: 'image_url',
      image_url: { url, detail: 'low' },
    });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an acting coach. Respond only with valid JSON matching the requested structure.',
      },
      { role: 'user', content },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 300,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error('Empty response from model');
  return parseFeedback(raw);
}

// ── Mock fallback (when no API key or analysis fails) ──────────────────────

function mockAnalyze(emotion: string): Feedback {
  const scores: PerformanceScores = {
    emotion: Math.floor(Math.random() * 3) + 3,
    clarity: Math.floor(Math.random() * 3) + 3,
    pace: Math.floor(Math.random() * 3) + 3,
  };

  const strengths = [
    'Great emotional range in your delivery.',
    'Strong vocal projection and presence.',
    'Good physical engagement with the emotion.',
    'Natural timing in your performance.',
    'Clear commitment to the character.',
  ];

  const cues = [
    `Try varying your tempo to better express "${emotion}".`,
    `Consider pausing before the key word for more impact.`,
    `Your eyes could convey more of the "${emotion}" feeling.`,
    `Try a lower register to ground the emotion.`,
    `Experiment with a sharper attack on the opening.`,
  ];

  return {
    scores,
    strength: strengths[Math.floor(Math.random() * strengths.length)],
    retryCue: cues[Math.floor(Math.random() * cues.length)],
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Analyze a recorded take.
 *
 * All processing happens in the browser:
 * 1. Extract 3 frames (25%, 50%, 75%) from the video
 * 2. Extract audio and transcribe it via gpt-4o-transcribe
 * 3. Send frames + transcript to gpt-4o-mini for structured feedback
 *
 * Falls back to mock data if the API key is missing or any step fails.
 */
export async function analyzeTake(
  line: string,
  emotion: string,
  videoBlob?: Blob
): Promise<Feedback> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey || apiKey === '' || !videoBlob) {
    return mockAnalyze(emotion);
  }

  try {
    const framePromise = extractFrames(videoBlob);

    let transcript = '';
    try {
      const audioBlob = await extractAudioAsWav(videoBlob);
      if (audioBlob) {
        transcript = await transcribeAudio(audioBlob);
      }
    } catch {
      // Skip transcription — analyze with frames only
    }

    const frames = await framePromise;
    return await analyzePerformance(line, emotion, transcript, frames);
  } catch (err) {
    console.warn('AI analysis failed, falling back to mock:', err);
    return mockAnalyze(emotion);
  }
}
