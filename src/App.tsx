import React, { useState, useEffect } from 'react';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { WORDS } from './data/words';
import {
  CellState,
  GameState,
  WORD_LENGTH,
  MAX_GUESSES,
  getWordOfTheDay,
  evaluateGuess
} from './utils/gameLogic';

function GameContent() {
  const { theme } = useTheme();

  const [gameState, setGameState] = useState<GameState>(() => ({
    guesses: [],
    currentGuess: '',
    gameWon: false,
    gameOver: false,
    solution: getWordOfTheDay()
  }));

  const [evaluations, setEvaluations] = useState<CellState[][]>([]);
  const [usedKeys, setUsedKeys] = useState<Record<string, CellState>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [invalidGuess, setInvalidGuess] = useState(false);

  const handleKeyPress = (key: string) => {
    if (gameState.gameOver) return;

    if (key === 'Enter') {
      if (gameState.currentGuess.length !== WORD_LENGTH) {
        setInvalidGuess(true);
        setTimeout(() => setInvalidGuess(false), 600);
        return;
      }

      const evaluation = evaluateGuess(gameState.currentGuess, gameState.solution);
      const newEvaluations = [...evaluations, evaluation];
      const newGuesses = [...gameState.guesses, gameState.currentGuess];

      // Update used keys
      const newUsedKeys = { ...usedKeys };
      [...gameState.currentGuess].forEach((letter, i) => {
        const currentState = newUsedKeys[letter];
        const newState = evaluation[i];
        if (newState === 'correct' ||
            (newState === 'present' && currentState !== 'correct') ||
            (!currentState && newState === 'absent')) {
          newUsedKeys[letter] = newState;
        }
      });

      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 250 * WORD_LENGTH);

      setEvaluations(newEvaluations);
      setUsedKeys(newUsedKeys);

      setGameState(prev => ({
        ...prev,
        guesses: newGuesses,
        currentGuess: '',
        gameWon: gameState.currentGuess === gameState.solution,
        gameOver: gameState.currentGuess === gameState.solution || newGuesses.length === MAX_GUESSES
      }));
    } else if (key === 'Backspace') {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1)
      }));
    } else if (gameState.currentGuess.length < WORD_LENGTH) {
      setGameState(prev => ({
        ...prev,
        currentGuess: prev.currentGuess + key
      }));
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center transition-colors duration-300">
      <header className="w-full bg-white dark:bg-gray-800 shadow-md p-4 mb-4 transition-colors duration-300">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="w-8"></div> {/* Spacer for alignment */}
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">كلمه</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-between p-4">
        <Grid
          guesses={gameState.guesses}
          currentGuess={gameState.currentGuess}
          solution={gameState.solution}
          evaluations={evaluations}
          isRevealing={isRevealing}
          invalidGuess={invalidGuess}
          theme={theme}
        />

        {gameState.gameOver && (
          <div className="my-4 text-center">
            {gameState.gameWon ? (
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">أحسنت! لقد فزت!</p>
            ) : (
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">حظاً أوفر في المرة القادمة!</p>
                <p className="mt-2 text-gray-800 dark:text-gray-300">الكلمة كانت: {gameState.solution}</p>
              </div>
            )}
          </div>
        )}

        <Keyboard onKeyPress={handleKeyPress} usedKeys={usedKeys} />
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <GameContent />
    </ThemeProvider>
  );
}

export default App;
