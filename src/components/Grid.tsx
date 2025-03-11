import React from 'react';
import { CellState } from '../utils/gameLogic';

interface GridProps {
  guesses: string[];
  currentGuess: string;
  solution: string;
  evaluations: CellState[][];
  isRevealing?: boolean;
  invalidGuess?: boolean;
}

export function Grid({ guesses, currentGuess, solution, evaluations, isRevealing, invalidGuess }: GridProps) {
  const rows = Array(6).fill(null);

  return (
    <div className={`grid grid-rows-6 gap-2 p-2 ${invalidGuess ? 'animate-shake' : ''}`}>
      {rows.map((_, i) => {
        const isCurrentGuess = i === guesses.length;
        const guess = isCurrentGuess ? currentGuess : guesses[i];
        const evaluation = evaluations[i];

        return (
          <div key={i} className="grid grid-cols-5 gap-2">
            {Array(5).fill(null).map((_, j) => {
              const letter = guess?.[j] ?? '';
              let cellState = 'empty';
              if (evaluation) {
                cellState = evaluation[j];
              }

              const isRevealed = !isRevealing || i < guesses.length - 1;
              const shouldReveal = isRevealing && i === guesses.length - 1;
              const revealDelay = shouldReveal ? `${j * 50}ms` : '0ms';

              const bgColor = cellState === 'correct' ? 'bg-green-500' :
                            cellState === 'present' ? 'bg-yellow-500' :
                            cellState === 'absent' ? 'bg-gray-500' : 'bg-white';
              const border = cellState === 'empty' ? 'border-2 border-gray-300' : '';
              const textColor = cellState === 'empty' ? 'text-black' : 'text-white';

              return (
                <div
                  key={j}
                  style={{ 
                    transitionDelay: revealDelay,
                    animationDelay: revealDelay 
                  }}
                  className={`
                    ${bgColor} ${border} ${textColor}
                    w-14 h-14 flex items-center justify-center
                    text-2xl font-bold rounded-md
                    transition-all duration-150 ease-in-out
                    transform-gpu perspective-1000
                    ${letter && !shouldReveal ? 'animate-pop' : ''}
                    ${shouldReveal ? 'animate-flip' : ''}
                  `}
                >
                  <span className="select-none filter drop-shadow-sm">
                    {letter}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}