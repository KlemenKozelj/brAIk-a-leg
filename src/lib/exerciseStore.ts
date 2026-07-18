// In-memory exercise store — stateless, cleared on server restart
// Separated from route handler so both exercise and analyze routes can access it

import { nanoid } from 'nanoid';
import { PerformanceScores, EMOTIONS } from '@/types';

export interface ExerciseRecord {
  id: string;
  poolId: string;
  line: string;
  emotion: string;
  attempt: 1;
  createdAt: number;
}

const exercises = new Map<string, ExerciseRecord>();
const firstTakeScores = new Map<string, PerformanceScores>();

export function createExercise(poolId: string, line: string, emotion: string): ExerciseRecord {
  if (!EMOTIONS.includes(emotion as typeof EMOTIONS[number])) {
    throw new Error('Invalid emotion');
  }
  if (line.length < 3 || line.length > 200) {
    throw new Error('Line must be between 3 and 200 characters');
  }

  const id = nanoid(12);
  const exercise: ExerciseRecord = {
    id,
    poolId,
    line,
    emotion,
    attempt: 1,
    createdAt: Date.now(),
  };

  exercises.set(id, exercise);
  setTimeout(() => exercises.delete(id), 20 * 60 * 1000);
  return exercise;
}

export function getExercise(id: string): ExerciseRecord | undefined {
  return exercises.get(id);
}

export function deleteExercise(id: string): void {
  exercises.delete(id);
}

export function setFirstTakeScores(exerciseId: string, scores: PerformanceScores): void {
  firstTakeScores.set(exerciseId, scores);
}

export function getFirstTakeScores(exerciseId: string): PerformanceScores | undefined {
  return firstTakeScores.get(exerciseId);
}

export function deleteFirstTakeScores(exerciseId: string): void {
  firstTakeScores.delete(exerciseId);
}
