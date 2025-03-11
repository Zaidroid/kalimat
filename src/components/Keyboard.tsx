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
        <div key={i} className="flex justify-center gap-1 my-1">
          {row.map((key) => {
            const state = usedKeys[key];
            const bgColor = state === 'correct' ? 'bg-green-500' :
                          state === 'present' ? 'bg-yellow-500' :
                          state === 'absent' ? 'bg-gray-500' : 'bg-gray-200';
            
            return (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`
                  ${bgColor} text-2xl font-bold rounded px-3 py-4 min-w-[40px]
                  transition-all duration-150 ease-in-out
                  hover:opacity-90 active:scale-95
                  relative overflow-hidden
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
          className="bg-gray-300 px-4 py-2 rounded text-lg hover:bg-gray-400
                     transition-all duration-150 ease-in-out active:scale-95"
        >
          حذف
        </button>
        <button
          onClick={() => handleKeyPress('Enter')}
          className="bg-gray-300 px-4 py-2 rounded text-lg hover:bg-gray-400
                     transition-all duration-150 ease-in-out active:scale-95"
        >
          إدخال
        </button>
      </div>
    </div>
  );
}