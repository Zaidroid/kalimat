import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Grid } from './components/Grid';
import { Keyboard } from './components/Keyboard';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { ThemeToggle } from './components/ThemeToggle';
import { WORDS } from './data/words';
import { DICT } from './data/dict'; // Import dict.ts
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
  loadGameState,
  saveGameState,
} from './utils/gameLogic';

const Statistics = lazy(() => import('./components/Statistics').then(module => ({ default: module.Statistics })));
const Instructions = lazy(() => import('./components/Instructions').then(module => ({ default: module.Instructions })));

function GameContent() {
  const { theme } = useTheme();

  const [gameState, setGameState] = useState<GameState>(() => {
    const { state, evaluations: savedEvals } = loadGameState();
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
  const [localCache, setLocalCache] = useState<Set<string>>(new Set());
  const [dictionary, setDictionary] = useState<Set<string>>(new Set());
  const [isValidatingApi, setIsValidatingApi] = useState(false);

  // Load local cache and initialize dictionary from DICT on mount
  useEffect(() => {
    const cachedWords = localStorage.getItem('validWordsCache');
    if (cachedWords) {
      console.log('Loaded localCache from storage:', cachedWords);
      setLocalCache(new Set(JSON.parse(cachedWords)));
    }

    console.log('Initializing dictionary from DICT...');
    console.log('DICT sample (first 10):', DICT.slice(0, 10));
    const fiveLetterWords = DICT.filter((word) => word.length === WORD_LENGTH);
    console.log('Filtered 5-letter words sample (first 10):', fiveLetterWords.slice(0, 10));
    setDictionary(new Set(fiveLetterWords));
    console.log(`Loaded ${fiveLetterWords.length} 5-letter words into dictionary`);
  }, []);

  // Save a word to the local cache
  const saveToCache = (word: string) => {
    const newCache = new Set(localCache);
    newCache.add(word);
    setLocalCache(newCache);
    localStorage.setItem('validWordsCache', JSON.stringify(Array.from(newCache)));
    console.log(`Added "${word}" to localCache. New size: ${newCache.size}`);
  };

  // API call to DictionaryAPI.dev
  const checkWordWithApi = async (word: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/ar/${word}`);
      console.log(`API Response Status for "${word}": ${response.status}`);
      return response.ok; // True if status is 200-299 (word exists)
    } catch (error) {
      console.error('API Error:', error);
      return false; // Fail gracefully on network/API errors
    }
  };

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
      const timer = setTimeout(() => {
        setShowStats(true);
        saveStats(gameState.gameWon, gameState.guesses.length);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameOver]);

  useEffect(() => {
    if (gameState.guesses.length > 0) {
      saveGameState(gameState, evaluations);
    }
  }, [gameState, evaluations]);

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
    if (gameState.gameOver || isValidatingApi) return;

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

      const processGuess = () => {
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
      };

      // Multi-tier validation with debug logs
      console.log(`Validating word: "${gameState.currentGuess}"`);
      console.log(`WORDS length: ${WORDS.length}, Sample:`, WORDS.slice(0, 5));
      console.log(`localCache size: ${localCache.size}`);
      console.log(`dictionary size: ${dictionary.size}`);

      if (WORDS.includes(gameState.currentGuess)) {
        console.log(`"${gameState.currentGuess}" found in WORDS`);
        processGuess();
      } else if (localCache.has(gameState.currentGuess)) {
        console.log(`"${gameState.currentGuess}" found in localCache`);
        processGuess();
      } else if (dictionary.has(gameState.currentGuess)) {
        console.log(`"${gameState.currentGuess}" found in dictionary`);
        saveToCache(gameState.currentGuess);
        setFeedback('تم قبول الكلمة الجديدة!');
        setTimeout(() => setFeedback(''), 2000);
        processGuess();
      } else {
        // Extra step: Check DictionaryAPI.dev
        setIsValidatingApi(true);
        setFeedback('جارٍ التحقق من الكلمة عبر الإنترنت...');
        checkWordWithApi(gameState.currentGuess)
          .then((isValid) => {
            setIsValidatingApi(false);
            if (isValid) {
              console.log(`"${gameState.currentGuess}" validated by API`);
              saveToCache(gameState.currentGuess);
              setFeedback('تم قبول الكلمة الجديدة عبر الإنترنت!');
              setTimeout(() => setFeedback(''), 2000);
              processGuess();
            } else {
              console.log(`"${gameState.currentGuess}" rejected by API`);
              setInvalidGuess(true);
              setFeedback(translations.ar.invalidGuessNotInList);
              setTimeout(() => {
                setInvalidGuess(false);
                setFeedback('');
              }, 600);
            }
          })
          .catch(() => {
            setIsValidatingApi(false);
            console.log(`API check failed for "${gameState.currentGuess}"`);
            setInvalidGuess(true);
            setFeedback('تعذر التحقق من الكلمة، ربما ليست صحيحة');
            setTimeout(() => {
              setInvalidGuess(false);
              setFeedback('');
            }, 600);
          });
      }
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
              className="text-gray-900 dark:text-gray-100 p-2"
              aria-label={translations.ar.howToPlay}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowStats(true)}
              className="text-gray-900 dark:text-gray-100 p-2"
              aria-label={translations.ar.stats}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button
              onClick={() => setIsRandomMode(!isRandomMode)}
              className="text-gray-900 dark:text-gray-100 p-2"
              aria-label={
                isRandomMode ? translations.ar.dailyMode : translations.ar.randomMode
              }
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isRandomMode 
                         ? "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                         : "M19.48 17.839a2 2 0 11-2.979 2.667 2 2 0 012.98-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zM19.48 11.952a2 2 0 11-2.979 2.667 2 2 0 012.98-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zM19.48 6.065a2 2 0 11-2.979 2.667 2 2 0 012.98-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667zm-6.987 0a2 2 0 11-2.979 2.667 2 2 0 012.979-2.667z"} />
              </svg>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
            {translations.ar.title}
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-between p-4 pb-2">
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
    <div className="my-2 text-center">
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
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
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
