import React from 'react';
import { CellState } from '../utils/gameLogic';

// Arabic keyboard layout following standard layout patterns
const KEYS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'ل', 'ى', 'ة', 'و', 'ز', 'ظ', 'ذ'],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  usedKeys: Record<string, CellState>;
}

/**
 * Displays the virtual keyboard for entering guesses.
 */
export const Keyboard = React.memo(({ onKeyPress, usedKeys }: KeyboardProps) => {
  const handleKeyPress = (key: string) => {
    onKeyPress(key);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-1">
      {KEYS.map((row, i) => (
        <div key={i} className="flex justify-center gap-[2px] my-[2px]">
          {row.map((key) => {
            const state = usedKeys[key];
            const bgColor =
              state === 'correct'
                ? 'bg-green-500 dark:bg-green-600'
                : state === 'present'
                ? 'bg-yellow-500 dark:bg-yellow-600'
                : state === 'absent'
                ? 'bg-gray-500 dark:bg-gray-600'
                : 'bg-gray-200 dark:bg-gray-700';

            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKeyPress(key)}
                className={`
                  ${bgColor} text-base sm:text-lg font-bold rounded 
                  w-[8.33%] min-w-[28px] h-[40px] sm:h-[48px]
                  flex items-center justify-center
                  transition-all duration-150 ease-in-out
                  hover:opacity-90 active:scale-95
                  text-gray-900 dark:text-white
                `}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
      <div className="flex justify-center gap-2 mt-2">
        <button
          onClick={() => handleKeyPress('Backspace')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKeyPress('Backspace')}
          className="bg-red-500 dark:bg-red-600 text-white py-2 rounded text-sm sm:text-base
                     font-semibold shadow-md hover:bg-red-600 dark:hover:bg-red-700
                     transition-all duration-150 ease-in-out active:scale-95 w-[25%]"
        >
          حذف
        </button>
        <button
          onClick={() => handleKeyPress('Enter')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleKeyPress('Enter')}
          className="bg-blue-500 dark:bg-blue-600 text-white py-2 rounded text-sm sm:text-base
                     font-semibold shadow-md hover:bg-blue-600 dark:hover:bg-blue-700
                     transition-all duration-150 ease-in-out active:scale-95 w-[25%]"
        >
          إدخال
        </button>
      </div>
    </div>
  );
});
