import { EMOTIONS } from '@/types';

export const FALLBACK_LINES: string[] = [
  "I just accidentally sent my mom a video of me twerking",
  "My zip is down and everyone in this meeting has noticed",
  "I thought I was waving at a friend but it was a mannequin",
  "I farted during the quiet part of the wedding ceremony",
  "My screen share showed my search history to the whole office",
  "I tried to be sexy but I just looked like I was having a seizure",
  "My pants ripped right down the middle during my big presentation",
  "I called my teacher 'Mom' and now I'm considering witness protection",
  "I walked into a glass door in front of my crush",
  "I laughed so hard I peed a little and it shows",
  "My toupee just slid off into the birthday cake",
  "I tripped up the stairs and blamed it on the carpet",
  "I high-fived someone reaching for the same door handle",
  "My voice cracked during a very serious emotional monologue",
  "I waved at someone who was definitely waving at the person behind me",
  "I just told my boss I love them while signing off",
  "My fake tan is dripping off me in front of everyone",
  "I tried to whisper but it came out as a very loud scream",
  "I accidentally liked my ex's photo from 2016 at 3 AM",
  "My wig is crooked and I can feel everyone staring",
  "I got my hand stuck in a vending machine trying to steal a snack",
  "I sneezed so hard I farted and now the room is silent",
  "My crush just saw me pick my nose and wipe it on my sleeve",
  "I tried to do a cool spin but fell into the waiter",
  "I replied all to a company email with a poop emoji",
  "My sweat is dripping onto the table and I can't stop it",
  "I just burped in someone's face while saying excuse me",
  "I matched with my therapist on Tinder and swiped left too late",
  "My spanx are rolling down and I'm trapped in my own body",
  "I walked into the wrong house and pretended to live there",
  "My bikini top fell off while I was trying to look cool exiting the pool",
  "I accidentally sent a flirty text to my dad",
  "My eyebrows are completely different shapes and I just noticed",
  "I tried to parallel park and now I'm on the sidewalk",
  "I waved at my reflection thinking it was someone I knew",
  "My deodorant failed and I'm doing that thing where I don't raise my arms",
  "I just called my girlfriend by my ex's name... in bed",
  "My fake eyelash is dangling off and I can see it in my peripheral vision",
  "I tried to blow out a candle and spit all over the cake",
  "I fell asleep in a meeting and snored so loud I woke myself up",
  "My family just saw the roleplay video I made for my drama class",
  "I tried to flirt but my voice came out like a strangled cat",
  "I went to sit down and completely missed the chair",
  "My outfit is giving 'blindfolded dressing in the dark'",
  "I just found out my fly has been open for the last three hours",
  "My date saw me eat a string of cheese in one unbroken slurp",
  "My armpit hair is poking out and I'm wearing a tank top",
  "I tried to twerk and my back went into spasm",
  "I just admitted something deeply embarrassing on a work call I thought was muted",
  "My zipper is stuck and I'm trapped in my own dress",
];

export const FALLBACK_EMOTIONS: string[] = [...EMOTIONS];

export function getHardcodedPool() {
  const shuffled = [...FALLBACK_LINES].sort(() => Math.random() - 0.5);
  return {
    lines: shuffled.slice(0, 8),
    emotions: [...FALLBACK_EMOTIONS],
  };
}

export function getFallbackLines(count: number = 8): string[] {
  const shuffled = [...FALLBACK_LINES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getFallbackEmotions(): string[] {
  return [...EMOTIONS];
}
