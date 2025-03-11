import React from 'react';

const KEYS = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك'],
  ['ظ', 'ط', 'ذ', 'د', 'ز', 'ر', 'و', 'ة', 'ى', 'ئ']
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  usedKeys: Record<string, 'correct' | 'present' | 'absent'>;
}

export function Keyboard({ onKeyPress, usedKeys }: KeyboardProps) {
  const handleKeyPress = (key: string) => {
    onKeyPress(key);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2">
      {KEYS.map((row, i) => (
        <div key={i} className="flex flex-wrap justify-center gap-1 my-1">
          {row.map((key) => {
            const state = usedKeys[key];
            const bgColor = state === 'correct' ? 'bg-green-500 dark:bg-green-600' :
                          state === 'present' ? 'bg-yellow-500 dark:bg-yellow-600' :
                          state === 'absent' ? 'bg-gray-500 dark:bg-gray-600' : 
                          'bg-gray-200 dark:bg-gray-700';
            
            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`
                  ${bgColor} text-xl sm:text-2xl font-bold rounded 
                  px-1 sm:px-3 py-3 sm:py-4 
                  min-w-[30px] sm:min-w-[40px]
                  transition-all duration-150 ease-in-out
                  hover:opacity-90 active:scale-95
                  relative overflow-hidden
                  text-gray-900 dark:text-white
                  before:content-[''] before:absolute before:w-full before:h-full
                  before:bg-white before:opacity-0 before:transition-opacity
                  active:before:opacity-20 active:before:animate-ripple
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
          className="bg-red-500 dark:bg-red-600 text-white px-3 sm:px-4 py-3 rounded-lg text-base sm:text-lg 
                     font-semibold shadow-md hover:bg-red-600 dark:hover:bg-red-700
                     transition-all duration-150 ease-in-out active:scale-95 min-w-[80px]"
        >
          حذف
        </button>
        <button
          onClick={() => handleKeyPress('Enter')}
          className="bg-blue-500 dark:bg-blue-600 text-white px-3 sm:px-4 py-3 rounded-lg text-base sm:text-lg 
                     font-semibold shadow-md hover:bg-blue-600 dark:hover:bg-blue-700
                     transition-all duration-150 ease-in-out active:scale-95 min-w-[80px]"
        >
          إدخال
        </button>
      </div>
    </div>
  );
}
