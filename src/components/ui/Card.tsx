import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, selected = false }) => {
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md transition-all duration-300
        ${onClick ? 'cursor-pointer hover:shadow-lg transform hover:-translate-y-1' : ''}
        ${selected ? 'ring-2 ring-purple-600 shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;