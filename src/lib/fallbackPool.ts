import { EMOTIONS } from '@/types';

export const FALLBACK_LINES: string[] = [
  'I accidentally married a penguin last night',
  'My left shoe is filing a restraining order',
  'I was raised by very confused wolves',
  'The toaster told me I have no future',
  'I am the emperor of this potato farm',
  'My reflection blinked out of sync with me',
  'I have been declared a minor folk legend',
  'A squirrel is my life coach now',
  'I sat on my own birthday cake again',
  'My moustache has its own fan club',
  'I am wanted in three counties for juggling',
  'The ceiling fan is giving me advice',
  'I accidentally became mayor of a mailbox',
  'My pet rock just gave me performance review',
  'I am the worlds okayest interpretive dancer',
  'A goose stole my identification papers',
  'I negotiated peace with the garden gnomes',
  'My eyebrows have unionized against me',
  'I am banned from the local echo chamber',
  'The spaghetti monster chose me as its prophet',
  'A seagull has been following me for years',
  'I am the king of this abandoned trolley',
  'My shadow keeps making fun of my posture',
  'I have been cursed by a very bored witch',
  'The vending machine mocked my life choices',
  'I once wrestled a cloud and almost won',
  'My furniture is planning a rebellion',
  'I speak fluent squirrel but have no accent',
  'A committee of cats judged my life',
  'My luck ran away to join the circus',
];

export function getFallbackLines(count: number = 8): string[] {
  const shuffled = [...FALLBACK_LINES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getFallbackEmotions(): string[] {
  return [...EMOTIONS];
}
