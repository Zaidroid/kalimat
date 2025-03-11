import React, { useState, useEffect } from 'react';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { WORDS } from './data/words';
import {
  CellState,
  GameState,
  WORD_LENGTH,
  MAX_GUESSES,
  getWordOfTheDay,
  evaluateGuess
} from './utils/gameLogic';

function App() {
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
    <div dir="rtl" className="min-h-screen bg-gray-100 flex flex-col items-center">
      <header className="w-full bg-white shadow-md p-4 mb-4">
        <h1 className="text-3xl font-bold text-center">كلمه</h1>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-between p-4">
        <Grid
          guesses={gameState.guesses}
          currentGuess={gameState.currentGuess}
          solution={gameState.solution}
          evaluations={evaluations}
          isRevealing={isRevealing}
          invalidGuess={invalidGuess}
        />

        {gameState.gameOver && (
          <div className="my-4 text-center">
            {gameState.gameWon ? (
              <p className="text-2xl font-bold text-green-600">أحسنت! لقد فزت!</p>
            ) : (
              <div>
                <p className="text-2xl font-bold text-red-600">حظاً أوفر في المرة القادمة!</p>
                <p className="mt-2">الكلمة كانت: {gameState.solution}</p>
              </div>
            )}
          </div>
        )}

        <Keyboard onKeyPress={handleKeyPress} usedKeys={usedKeys} />
      </main>
    </div>
  );
}

export default App;