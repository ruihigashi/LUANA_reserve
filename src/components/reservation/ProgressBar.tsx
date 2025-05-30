import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                ${index < currentStep
                  ? 'bg-purple-600 text-white'
                  : index === currentStep
                    ? 'bg-pink-200 border-2 border-purple-600 text-purple-800'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span
              className={`
                mt-2 text-sm font-medium transition-colors duration-500
                ${index <= currentStep
                  ? 'text-purple-800'
                  : 'text-gray-500'
                }
              `}
            >
              {index === 0 && 'メニュー選択'}
              {index === 1 && '日時選択'}
              {index === 2 && 'お客様情報入力'}
              {index === 3 && 'お客様情報確認'}
            </span>
          </div>
        ))}
      </div>

      <div className="relative mt-4">
        <div className="h-1 bg-gray-200 rounded">
          <div
            className="h-1 bg-purple-600 rounded transition-all duration-500"
            style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;