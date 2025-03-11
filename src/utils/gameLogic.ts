import { WORDS } from '../data/words';

export type CellState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameWon: boolean;
  gameOver: boolean;
  solution: string;
}

/**
 * Saves the game state to localStorage if the solution matches today's word.
 */
export function saveGameState(state: GameState, evaluations: CellState[][]): void {
  const todaySolution = getWordOfTheDay();
  if (state.solution === todaySolution) {
    localStorage.setItem(
      'gameState',
      JSON.stringify({
        ...state,
        lastPlayed: new Date().toISOString(),
      })
    );
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
  }
}

/**
 * Loads the game state from localStorage if it matches today's word.
 */
export function loadGameState(): { state: GameState | null; evaluations: CellState[][] | null } {
  const savedState = localStorage.getItem('gameState');
  const savedEvaluations = localStorage.getItem('evaluations');

  if (!savedState || !savedEvaluations) {
    return { state: null, evaluations: null };
  }

  const state = JSON.parse(savedState);
  const evaluations = JSON.parse(savedEvaluations);

  const todaySolution = getWordOfTheDay();
  if (state.solution !== todaySolution) {
    return { state: null, evaluations: null };
  }

  return { state, evaluations };
}

/**
 * Saves game statistics to localStorage.
 */
export function saveStats(gameWon: boolean, numGuesses: number): void {
  const stats = loadStats();

  stats.totalPlayed += 1;

  if (gameWon) {
    stats.wins += 1;
    stats.currentStreak += 1;
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
    stats.distribution[numGuesses - 1] += 1;
  } else {
    stats.currentStreak = 0;
  }

  localStorage.setItem('statistics', JSON.stringify(stats));
}

/**
 * Loads game statistics from localStorage.
 */
export function loadStats() {
  const savedStats = localStorage.getItem('statistics');

  if (!savedStats) {
    return {
      totalPlayed: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0],
    };
  }

  return JSON.parse(savedStats);
}

/**
 * Generates a shareable text representation of the game result.
 */
export function generateShareText(
  guesses: string[],
  evaluations: CellState[][],
  solution: string,
  gameWon: boolean
): string {
  const emojiGrid = evaluations
    .map((row) =>
      row
        .map((state) => {
          if (state === 'correct') return '🟩';
          if (state === 'present') return '🟨';
          return '⬛';
        })
        .join('')
    )
    .join('\n');

  const guessCount = gameWon ? guesses.length : 'X';

  return `كلمه ${guessCount}/${MAX_GUESSES}\n\n${emojiGrid}`;
}

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

/**
 * Gets the word of the day based on the current date.
 */
export function getWordOfTheDay(): string {
  const now = new Date();
  const start = new Date(2024, 0, 1);
  const diff = now.getTime() - start.getTime();
  const day = Math.floor(diff / (1000 * 60 * 60 * 24));
  const index = day % WORDS.length;
  return WORDS[index];
}

/**
 * Evaluates a guess against the solution, returning cell states.
 */
export function evaluateGuess(guess: string, solution: string): CellState[] {
  const result: CellState[] = Array(WORD_LENGTH).fill('absent');
  const solutionChars = [...solution];
  const guessChars = [...guess];

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === solutionChars[i]) {
      result[i] = 'correct';
      solutionChars[i] = '*';
      guessChars[i] = '*';
    }
  }

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
