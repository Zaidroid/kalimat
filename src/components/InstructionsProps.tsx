import React from 'react';

interface InstructionsProps {
  handleClose: () => void;
}

export function Instructions({ handleClose }: InstructionsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full h-3/4 overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">كيفية اللعب</h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-gray-800 dark:text-gray-200">
          <p>خمن الكلمة في 6 محاولات.</p>
          
          <p>يجب أن يكون كل تخمين كلمة صالحة مكونة من 5 أحرف. اضغط على زر الإدخال للتحقق.</p>
          
          <p>بعد كل تخمين، سيتغير لون المربعات لإظهار مدى قرب تخمينك من الكلمة.</p>
          
          <div className="border-t border-b border-gray-300 dark:border-gray-700 py-4 my-4">
            <p className="font-medium mb-2">أمثلة:</p>
            
            <div className="flex items-center mb-2 gap-1">
              <div className="w-10 h-10 bg-green-500 dark:bg-green-600 rounded flex items-center justify-center text-white font-bold">م</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">د</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ر</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">س</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ة</div>
            </div>
            <p>الحرف م في المكان الصحيح.</p>
            
            <div className="flex items-center mb-2 mt-4 gap-1">
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">م</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ك</div>
              <div className="w-10 h-10 yellow-500 dark:bg-yellow-600 bg-yellow-500 rounded flex items-center justify-center text-white font-bold">ت</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ب</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ة</div>
            </div>
            <p>الحرف ت موجود في الكلمة ولكن في مكان خاطئ.</p>
            
            <div className="flex items-center mb-2 mt-4 gap-1">
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">س</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ي</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ا</div>
              <div className="w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded flex items-center justify-center">ر</div>
              <div className="w-10 h-10 bg-gray-500 dark:bg-gray-600 rounded flex items-center justify-center text-white font-bold">ة</div>
            </div>
            <p>الحرف ة غير موجود في الكلمة.</p>
          </div>
          
          <p>هناك كلمة جديدة كل يوم!</p>
        </div>
      </div>
    </div>
  );
}
