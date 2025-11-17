import { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { Card, CardBack } from './Card';
import type { Card as CardType } from '../types/game';
import { PHASES } from '../utils/constants';
import { canCompletePhase } from '../utils/validation';

export function Game() {
  const { gameState, drawFromDeck, drawFromDiscard, discardCard, completePhase, playCardOnPhase, startNextRound, resetGame } = useGame();
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [isPhaseMode, setIsPhaseMode] = useState(false);
  const [playOnMode, setPlayOnMode] = useState<{ playerId: string, groupType: 'set' | 'run' | 'color', groupIndex: number } | null>(null);
  
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isPlayerTurn = currentPlayer.id === 'player';
  const topDiscard = gameState.discardPile[gameState.discardPile.length - 1];
  const humanPlayer = gameState.players.find(p => !p.isComputer);
  const currentPhase = PHASES[currentPlayer.currentPhase];

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
      if (isPhaseMode) {
        // In phase mode, allow multiple card selection
        newSelected.add(card.id);
      } else if (playOnMode) {
        // In play-on mode, only allow selecting one card
        newSelected.clear();
        newSelected.add(card.id);
      } else {
        // In discard mode, only allow selecting one card
        newSelected.clear();
        newSelected.add(card.id);
      }
    }
    setSelectedCards(newSelected);
  };

  const handleDiscard = () => {
    if (selectedCards.size === 1) {
      const cardId = Array.from(selectedCards)[0];
      discardCard(cardId);
      setSelectedCards(new Set());
      setIsPhaseMode(false);
      setPlayOnMode(null);
    }
  };

  const handleCompletePhase = () => {
    const selectedCardObjects = humanPlayer!.hand.filter(c => selectedCards.has(c.id));
    completePhase(selectedCardObjects);
    setSelectedCards(new Set());
    setIsPhaseMode(false);
  };
  
  const handlePlayOnPhase = () => {
    if (selectedCards.size === 1 && playOnMode) {
      const cardId = Array.from(selectedCards)[0];
      playCardOnPhase(cardId, playOnMode.playerId, playOnMode.groupType, playOnMode.groupIndex);
      setSelectedCards(new Set());
      setPlayOnMode(null);
    }
  };

  const canSubmitPhase = () => {
    if (!humanPlayer || humanPlayer.hasCompletedPhase) return false;
    const selectedCardObjects = humanPlayer.hand.filter(c => selectedCards.has(c.id));
    return canCompletePhase(selectedCardObjects, currentPhase.requirements);
  };

  const computerPlayer = gameState.players.find(p => p.isComputer);

  // Round end screen
  if (gameState.phase === 'round-end') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Round {gameState.round} Complete!</h1>
          
          <div className="space-y-4 mb-6">
            {gameState.players.map(player => (
              <div key={player.id} className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-white">{player.name}</h2>
                  <span className="text-white text-lg">Score: {player.score}</span>
                </div>
                <div className="text-white text-sm">
                  <p>Phase {player.currentPhase + 1}</p>
                  <p>{player.hasCompletedPhase ? '✓ Phase completed this round' : '✗ Phase not completed'}</p>
                  <p>Cards remaining: {player.hand.length}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={startNextRound}
              className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-lg"
            >
              Next Round
            </button>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-lg"
            >
              New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="text-white flex justify-between">
            <div>
              <p className="text-sm md:text-base">Round {gameState.round}</p>
              <p className="text-sm md:text-base">
                Current Phase: {currentPhase.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm">Your Score: {humanPlayer?.score || 0}</p>
              <p className="text-sm">Computer Score: {computerPlayer?.score || 0}</p>
            </div>
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
          
          {/* Computer's laid down cards */}
          {computerPlayer?.layedDownCards && (
            <div className="mt-4">
              <p className="text-white text-sm mb-2">Laid Down Cards:</p>
              <div className="space-y-2">
                {computerPlayer.layedDownCards.sets.map((set, idx) => (
                  <div key={`set-${idx}`}>
                    <p className="text-white text-xs mb-1">Set {idx + 1}:</p>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {set.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          small
                          onClick={playOnMode ? () => setPlayOnMode({ playerId: computerPlayer.id, groupType: 'set', groupIndex: idx }) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {computerPlayer.layedDownCards.runs.map((run, idx) => (
                  <div key={`run-${idx}`}>
                    <p className="text-white text-xs mb-1">Run {idx + 1}:</p>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {run.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          small
                          onClick={playOnMode ? () => setPlayOnMode({ playerId: computerPlayer.id, groupType: 'run', groupIndex: idx }) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {computerPlayer.layedDownCards.colors.map((color, idx) => (
                  <div key={`color-${idx}`}>
                    <p className="text-white text-xs mb-1">Color Group {idx + 1}:</p>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {color.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          small
                          onClick={playOnMode ? () => setPlayOnMode({ playerId: computerPlayer.id, groupType: 'color', groupIndex: idx }) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

          {/* Player's laid down cards */}
          {humanPlayer?.layedDownCards && (
            <div className="mb-4">
              <p className="text-white text-sm mb-2">Your Laid Down Cards:</p>
              <div className="space-y-2">
                {humanPlayer.layedDownCards.sets.map((set, idx) => (
                  <div key={`set-${idx}`}>
                    <p className="text-white text-xs mb-1">Set {idx + 1}:</p>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {set.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          small
                          onClick={playOnMode ? () => setPlayOnMode({ playerId: humanPlayer.id, groupType: 'set', groupIndex: idx }) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {humanPlayer.layedDownCards.runs.map((run, idx) => (
                  <div key={`run-${idx}`}>
                    <p className="text-white text-xs mb-1">Run {idx + 1}:</p>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {run.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          small
                          onClick={playOnMode ? () => setPlayOnMode({ playerId: humanPlayer.id, groupType: 'run', groupIndex: idx }) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {humanPlayer.layedDownCards.colors.map((color, idx) => (
                  <div key={`color-${idx}`}>
                    <p className="text-white text-xs mb-1">Color Group {idx + 1}:</p>
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {color.map(card => (
                        <Card 
                          key={card.id} 
                          card={card} 
                          small
                          onClick={playOnMode ? () => setPlayOnMode({ playerId: humanPlayer.id, groupType: 'color', groupIndex: idx }) : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            {isPlayerTurn && gameState.hasDrawn && !humanPlayer?.hasCompletedPhase && (
              <button
                onClick={() => {
                  setIsPhaseMode(!isPhaseMode);
                  setSelectedCards(new Set());
                  setPlayOnMode(null);
                }}
                className={`
                  px-4 py-3 rounded-lg font-semibold text-white
                  ${isPhaseMode
                    ? 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700'
                    : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800'}
                `}
              >
                {isPhaseMode ? 'Cancel Phase' : 'Select for Phase'}
              </button>
            )}
            
            {isPlayerTurn && gameState.hasDrawn && humanPlayer?.hasCompletedPhase && !isPhaseMode && (
              <button
                onClick={() => {
                  setPlayOnMode(playOnMode ? null : { playerId: humanPlayer.id, groupType: 'set', groupIndex: 0 });
                  setSelectedCards(new Set());
                }}
                className={`
                  px-4 py-3 rounded-lg font-semibold text-white
                  ${playOnMode
                    ? 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'
                    : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800'}
                `}
              >
                {playOnMode ? 'Cancel Play On' : 'Play on Phase'}
              </button>
            )}
            
            {isPhaseMode ? (
              <button
                onClick={handleCompletePhase}
                disabled={!canSubmitPhase()}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-semibold text-white
                  ${canSubmitPhase()
                    ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'}
                `}
              >
                Complete Phase {canSubmitPhase() ? '✓' : ''}
              </button>
            ) : playOnMode ? (
              <button
                onClick={handlePlayOnPhase}
                disabled={selectedCards.size !== 1}
                className={`
                  flex-1 px-4 py-3 rounded-lg font-semibold text-white
                  ${selectedCards.size === 1
                    ? 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'}
                `}
              >
                Play Selected Card
              </button>
            ) : (
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
            )}
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <p className="text-white text-sm">
              {!gameState.hasDrawn && isPlayerTurn && (
                <span>Draw a card from the draw pile or discard pile</span>
              )}
              {gameState.hasDrawn && isPlayerTurn && !isPhaseMode && !playOnMode && (
                <span>
                  {humanPlayer?.hasCompletedPhase 
                    ? 'Select a card to discard, or click "Play on Phase" to add cards to laid-down sets/runs'
                    : 'Select a card to discard, or click "Select for Phase" to complete your phase'}
                </span>
              )}
              {gameState.hasDrawn && isPlayerTurn && isPhaseMode && (
                <span>
                  Select cards for your phase: {currentPhase.description}
                  {canSubmitPhase() && ' - Ready to complete!'}
                </span>
              )}
              {gameState.hasDrawn && isPlayerTurn && playOnMode && (
                <span>
                  Click on a set/run/color group to select it, then select a card from your hand to play on it
                </span>
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
