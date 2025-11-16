import { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { Card, CardBack } from './Card';
import type { Card as CardType } from '../types/game';
import { PHASES } from '../utils/constants';

export function Game() {
  const { gameState, drawFromDeck, drawFromDiscard, discardCard, resetGame } = useGame();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = currentPlayer.id === 'player';
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];

  // Computer AI turn
  useEffect(() => {
    if (!isPlayerTurn && gameState.phase === 'playing') {
      const timer = setTimeout(() => {
        if (!gameState.hasDrawn) {
          // Computer draws from deck
          drawFromDeck();
        } else {
          // Computer discards a random card
          const randomIndex = Math.floor(Math.random() * currentPlayer.hand.length);
          const cardToDiscard = currentPlayer.hand[randomIndex];
          discardCard(cardToDiscard.id);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, gameState.hasDrawn, gameState.phase]);

  const handleCardClick = (card: CardType) => {
    if (!isPlayerTurn || !gameState.hasDrawn) return;

    const newSelected = new Set(selectedCards);
    if (newSelected.has(card.id)) {
      newSelected.delete(card.id);
    } else {
      // Only allow selecting one card for discard
      newSelected.clear();
      newSelected.add(card.id);
    }
    setSelectedCards(newSelected);
  };

  const handleDiscard = () => {
    if (selectedCards.size === 1) {
      const cardId = Array.from(selectedCards)[0];
      discardCard(cardId);
      setSelectedCards(new Set());
    }
  };

  const currentPhase = PHASES[currentPlayer.currentPhase];
  const humanPlayer = gameState.players.find(p => !p.isComputer);
  const computerPlayer = gameState.players.find(p => p.isComputer);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Phase 10</h1>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
            >
              New Game
            </button>
          </div>
          <div className="text-white">
            <p className="text-sm md:text-base">Round {gameState.round}</p>
            <p className="text-sm md:text-base">
              Current Phase: {currentPhase.description}
            </p>
          </div>
        </div>

        {/* Computer's area */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {computerPlayer?.name} - Phase {(computerPlayer?.currentPhase || 0) + 1}
            </h2>
            <span className="text-white text-sm">
              {computerPlayer?.hand.length} cards
            </span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {computerPlayer?.hand.map((_, index) => (
              <CardBack key={index} small />
            ))}
          </div>
        </div>

        {/* Game area - Deck and Discard */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-4">
          <div className="flex justify-center items-center gap-8">
            <div className="text-center">
              <p className="text-white mb-2 text-sm md:text-base">Draw Pile</p>
              <CardBack 
                onClick={isPlayerTurn && !gameState.hasDrawn ? drawFromDeck : undefined}
              />
              <p className="text-white mt-2 text-xs">{gameState.deck.length} cards</p>
            </div>
            
            <div className="text-center">
              <p className="text-white mb-2 text-sm md:text-base">Discard Pile</p>
              {topDiscard ? (
                <Card 
                  card={topDiscard}
                  onClick={isPlayerTurn && !gameState.hasDrawn ? drawFromDiscard : undefined}
                />
              ) : (
                <div className="w-16 h-24 border-2 border-dashed border-white/30 rounded-lg" />
              )}
            </div>
          </div>
        </div>

        {/* Player's area */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg md:text-xl font-bold text-white">
              {humanPlayer?.name} - Phase {(humanPlayer?.currentPhase || 0) + 1}
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isPlayerTurn ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
            }`}>
              {isPlayerTurn ? 'Your Turn' : 'Wait'}
            </span>
          </div>

          {/* Player's hand */}
          <div className="flex gap-2 overflow-x-auto pb-4">
            {humanPlayer?.hand.map((card) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
                selected={selectedCards.has(card.id)}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDiscard}
              disabled={!isPlayerTurn || !gameState.hasDrawn || selectedCards.size !== 1}
              className={`
                flex-1 px-4 py-3 rounded-lg font-semibold text-white
                ${isPlayerTurn && gameState.hasDrawn && selectedCards.size === 1
                  ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
                  : 'bg-gray-500 cursor-not-allowed opacity-50'}
              `}
            >
              Discard Selected
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-white text-sm">
              {!gameState.hasDrawn && isPlayerTurn && (
                <span>Draw a card from the draw pile or discard pile</span>
              )}
              {gameState.hasDrawn && isPlayerTurn && (
                <span>Select a card to discard</span>
              )}
              {!isPlayerTurn && (
                <span>Computer is taking their turn...</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
