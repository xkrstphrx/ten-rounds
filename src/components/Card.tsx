import type { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  small?: boolean;
}

export function Card({ card, onClick, selected, small }: CardProps) {
  const getCardColor = () => {
    if (card.wild) {
      return card.wild === 'wild' ? 'bg-purple-500' : 'bg-gray-700';
    }
    
    switch (card.suit) {
      case 'red': return 'bg-red-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-400';
      default: return 'bg-gray-500';
    }
  };

  const getCardText = () => {
    if (card.wild === 'wild') return 'W';
    if (card.wild === 'skip') return 'S';
    return card.value?.toString() || '?';
  };

  const sizeClasses = small 
    ? 'w-12 h-16 text-sm' 
    : 'w-16 h-24 text-xl';

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses}
        ${getCardColor()}
        text-white font-bold rounded-lg shadow-lg
        flex items-center justify-center
        transition-all duration-200
        ${onClick ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}
        ${selected ? 'ring-4 ring-white transform -translate-y-2' : ''}
      `}
    >
      {getCardText()}
    </button>
  );
}

interface CardBackProps {
  onClick?: () => void;
  small?: boolean;
}

export function CardBack({ onClick, small }: CardBackProps) {
  const sizeClasses = small 
    ? 'w-12 h-16' 
    : 'w-16 h-24';

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses}
        bg-gradient-to-br from-indigo-900 to-purple-900
        rounded-lg shadow-lg
        flex items-center justify-center
        transition-all duration-200
        ${onClick ? 'hover:scale-105 active:scale-95 cursor-pointer' : 'cursor-default'}
        border-2 border-purple-400
      `}
    >
      <div className="text-purple-400 text-2xl">🃏</div>
    </button>
  );
}
