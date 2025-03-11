import { WORDS } from '../data/words';

export type CellState = 'correct' | 'present' | 'absent' | 'empty';

export interface GameState {
  guesses: string[];
  currentGuess: string;
  gameWon: boolean;
  gameOver: boolean;
  solution: string;
}

// Save game state to localStorage
export function saveGameState(state: GameState, evaluations: CellState[][]): void {
  const todaySolution = getWordOfTheDay();
  if (state.solution === todaySolution) {
    localStorage.setItem('gameState', JSON.stringify({
      ...state,
      lastPlayed: new Date().toISOString()
    }));
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
  }
}

// Load game state from localStorage
export function loadGameState(): { state: GameState | null, evaluations: CellState[][] | null } {
  const savedState = localStorage.getItem('gameState');
  const savedEvaluations = localStorage.getItem('evaluations');
  
  if (!savedState || !savedEvaluations) {
    return { state: null, evaluations: null };
  }
  
  const state = JSON.parse(savedState);
  const evaluations = JSON.parse(savedEvaluations);
  
  // Check if saved game is from today
  const todaySolution = getWordOfTheDay();
  if (state.solution !== todaySolution) {
    return { state: null, evaluations: null };
  }
  
  return { state, evaluations };
}

// Save statistics
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

// Load statistics
export function loadStats() {
  const savedStats = localStorage.getItem('statistics');
  
  if (!savedStats) {
    return {
      totalPlayed: 0,
      wins: 0,
      currentStreak: 0,
      maxStreak: 0,
      distribution: [0, 0, 0, 0, 0, 0]
    };
  }
  
  return JSON.parse(savedStats);
}

export function generateShareText(guesses: string[], evaluations: CellState[][], solution: string, gameWon: boolean): string {
  // Create emoji grid based on evaluations
  const emojiGrid = evaluations.map(row => 
    row.map(state => {
      if (state === 'correct') return '🟩';  // Green square for correct
      if (state === 'present') return '🟨';  // Yellow square for present
      return '⬛';  // Black square for absent
    }).join('')
  ).join('\n');
  
  // Generate header with number of guesses or X if lost
  const guessCount = gameWon ? guesses.length : 'X';
  
  return `كلمه ${guessCount}/${MAX_GUESSES}\n\n${emojiGrid}`;
}

// In your App.tsx, add a share button when game is over
const handleShare = () => {
  const shareText = generateShareText(
    gameState.guesses, 
    evaluations, 
    gameState.solution, 
    gameState.gameWon
  );
  
  if (navigator.share) {
    navigator.share({
      title: 'كلمه - نتيجتي اليوم',
      text: shareText
    }).catch(error => {
      console.log('Error sharing:', error);
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      alert('تم نسخ النتيجة إلى الحافظة!');
    });
  } else {
    // Fallback for browsers without Web Share API
    navigator.clipboard.writeText(shareText);
    alert('تم نسخ النتيجة إلى الحافظة!');
  }
};

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
