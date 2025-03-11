import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Grid } from './components/Grid.tsx';
import { Keyboard } from './components/Keyboard.tsx';
import { ThemeProvider, useTheme } from './components/ThemeContext.tsx';
import { ThemeToggle } from './components/ThemeToggle.tsx';
import { WORDS } from './data/words';
import { translations } from './data/translations';
import {
  CellState,
  GameState,
  WORD_LENGTH,
  MAX_GUESSES,
  getWordOfTheDay,
  evaluateGuess,
  saveStats,
  loadStats,
  generateShareText,
} from './utils/gameLogic';

// Lazy-load modals for better performance
const Statistics = lazy(() => import('./components/Statistics.tsx'));
const Instructions = lazy(() => import('./components/Instructions.tsx'));

function GameContent() {
  const { theme } = useTheme();

  const [gameState, setGameState] = useState<GameState>(() => {
    const { state, evaluations } = loadGameState();
    return state || {
      guesses: [],
      currentGuess: '',
      gameWon: false,
      gameOver: false,
      solution: getWordOfTheDay(),
    };
  });
  const [evaluations, setEvaluations] = useState<CellState[][]>(
    loadGameState().evaluations || []
  );
  const [usedKeys, setUsedKeys] = useState<Record<string, CellState>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [invalidGuess, setInvalidGuess] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Update solution and reset game state when mode changes
  const solution = isRandomMode
    ? WORDS[Math.floor(Math.random() * WORDS.length)]
    : getWordOfTheDay();
  useEffect(() => {
    setGameState((prev) => ({
      ...prev,
      guesses: [],
      currentGuess: '',
      gameWon: false,
      gameOver: false,
      solution,
    }));
    setEvaluations([]);
    setUsedKeys({});
  }, [isRandomMode, solution]);

  useEffect(() => {
    if (gameState.gameOver) {
      // Delay showing stats to allow game state to stabilize
      const timer = setTimeout(() => {
        setShowStats(true);
        saveStats(gameState.gameWon, gameState.guesses.length);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameOver]);

  const handleShare = () => {
    const shareText = generateShareText(
      gameState.guesses,
      evaluations,
      gameState.solution,
      gameState.gameWon
    );
    if (navigator.share) {
      navigator.share({
        title: translations.ar.shareTitle,
        text: shareText,
      }).catch((err) => {
        console.error('Share failed:', err);
        navigator.clipboard.writeText(shareText);
        setFeedback(translations.ar.copiedToClipboard);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      setFeedback(translations.ar.copiedToClipboard);
    }
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleKeyPress = (key: string) => {
    if (gameState.gameOver) return;

    if (key === 'Enter') {
      if (gameState.currentGuess.length !== WORD_LENGTH) {
        setInvalidGuess(true);
        setFeedback(translations.ar.invalidGuessLength);
        setTimeout(() => {
          setInvalidGuess(false);
          setFeedback('');
        }, 600);
        return;
      }

      if (!WORDS.includes(gameState.currentGuess)) {
        setInvalidGuess(true);
        setFeedback(translations.ar.invalidGuessNotInList);
        setTimeout(() => {
          setInvalidGuess(false);
          setFeedback('');
        }, 600);
        return;
      }

      const evaluation = evaluateGuess(gameState.currentGuess, gameState.solution);
      const newEvaluations = [...evaluations, evaluation];
      const newGuesses = [...gameState.guesses, gameState.currentGuess];

      const newUsedKeys = { ...usedKeys };
      [...gameState.currentGuess].forEach((letter, i) => {
        const currentState = newUsedKeys[letter];
        const newState = evaluation[i];
        if (
          newState === 'correct' ||
          (newState === 'present' && currentState !== 'correct') ||
          (!currentState && newState === 'absent')
        ) {
          newUsedKeys[letter] = newState;
        }
      });

      setIsRevealing(true);
      setTimeout(() => setIsRevealing(false), 250 * WORD_LENGTH);

      setEvaluations(newEvaluations);
      setUsedKeys(newUsedKeys);

      setGameState((prev) => ({
        ...prev,
        guesses: newGuesses,
        currentGuess: '',
        gameWon: gameState.currentGuess === gameState.solution,
        gameOver:
          gameState.currentGuess === gameState.solution || newGuesses.length === MAX_GUESSES,
      }));
    } else if (key === 'Backspace') {
      setGameState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess.slice(0, -1),
      }));
    } else if (gameState.currentGuess.length < WORD_LENGTH) {
      setGameState((prev) => ({
        ...prev,
        currentGuess: prev.currentGuess + key,
      }));
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center transition-colors duration-300"
    >
      <header className="w-full bg-white dark:bg-gray-800 shadow-md p-4 mb-4 transition-colors duration-300">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowInstructions(true)}
              className="text-gray-900 dark:text-gray-100 hover:underline"
              aria-label={translations.ar.howToPlay}
            >
              {translations.ar.howToPlay}
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="text-gray-900 dark:text-gray-100 hover:underline"
              aria-label={translations.ar.stats}
            >
              {translations.ar.stats}
            </button>
            <button
              onClick={() => setIsRandomMode(!isRandomMode)}
              className="text-gray-900 dark:text-gray-100 hover:underline"
              aria-label={
                isRandomMode ? translations.ar.dailyMode : translations.ar.randomMode
              }
            >
              {isRandomMode ? translations.ar.dailyMode : translations.ar.randomMode}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            {translations.ar.title}
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-between p-4">
        {feedback && (
          <div className="mb-4 text-center text-red-600 dark:text-red-500">
            {feedback}
          </div>
        )}
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
              <p className="text-2xl font-bold text-green-600 dark:text-green-500">
                {translations.ar.winMessage}
              </p>
            ) : (
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500">
                  {translations.ar.loseMessage}
                </p>
                <p className="mt-2 text-gray-800 dark:text-gray-300">
                  {translations.ar.solutionMessage} {gameState.solution}
                </p>
              </div>
            )}
            <button
              onClick={handleShare}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              {translations.ar.shareResult}
            </button>
          </div>
        )}

        <Keyboard onKeyPress={handleKeyPress} usedKeys={usedKeys} />

        {showInstructions && (
          <Suspense fallback={<div className="text-center">جارٍ التحميل...</div>}>
            <Instructions handleClose={() => setShowInstructions(false)} />
          </Suspense>
        )}
        {showStats && (
          <Suspense fallback={<div className="text-center">جارٍ التحميل...</div>}>
            <Statistics
              stats={loadStats()}
              solution={gameState.solution}
              gameWon={gameState.gameWon}
              handleClose={() => setShowStats(false)}
            />
          </Suspense>
        )}
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
