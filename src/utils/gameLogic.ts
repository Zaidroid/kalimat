import { WORDS } from '../data/words';

export type CellState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameWon: boolean;
  gameOver: boolean;
  solution: string;
}

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export function getWordOfTheDay(): string {
  const now = new Date();
  const start = new Date(2024, 0, 1);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = day % WORDS.length;
  return WORDS[index];
}

export function evaluateGuess(guess: string, solution: string): CellState[] {
  const result: CellState[] = Array(WORD_LENGTH).fill('absent');
  const solutionChars = [...solution];
  const guessChars = [...guess];

  // First pass: mark correct letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === solutionChars[i]) {
      result[i] = 'correct';
      solutionChars[i] = '*';
      guessChars[i] = '*';
    }
  }

  // Second pass: mark present letters
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] !== '*') {
      const index = solutionChars.indexOf(guessChars[i]);
      if (index !== -1) {
        result[i] = 'present';
        solutionChars[index] = '*';
      }
    }
  }

  return result;
}