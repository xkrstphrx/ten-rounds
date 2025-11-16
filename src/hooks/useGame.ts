import { useState } from 'react';
import type { GameState, Player, Card } from '../types/game';
import { createDeck, drawCards } from '../utils/deck';
import { CARDS_PER_HAND } from '../utils/constants';

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(initializeGame());

  function initializeGame(): GameState {
    const deck = createDeck();
    const players: Player[] = [
      {
        id: 'player',
        name: 'You',
        hand: [],
        completedPhases: [],
        currentPhase: 0,
        isComputer: false,
        hasCompletedPhase: false
      },
      {
        id: 'computer',
        name: 'Computer',
        hand: [],
        completedPhases: [],
        currentPhase: 0,
        isComputer: true,
        hasCompletedPhase: false
      }
    ];

    // Deal cards to players
    let remainingDeck = deck;
    for (const player of players) {
      const { cards, remainingDeck: newDeck } = drawCards(remainingDeck, CARDS_PER_HAND);
      player.hand = cards;
      remainingDeck = newDeck;
    }

    // Initialize discard pile with one card
    const { cards: discardCards, remainingDeck: finalDeck } = drawCards(remainingDeck, 1);

    return {
      players,
      deck: finalDeck,
      discardPile: discardCards,
      currentPlayerIndex: 0,
      phase: 'playing',
      round: 1,
      hasDrawn: false
    };
  }

  function drawFromDeck() {
    setGameState(state => {
      if (state.hasDrawn) return state;

      const { cards, remainingDeck } = drawCards(state.deck, 1);
      
      // If deck is empty, reshuffle discard pile
      let newDeck = remainingDeck;
      if (newDeck.length === 0 && state.discardPile.length > 1) {
        const topDiscard = state.discardPile[state.discardPile.length - 1];
        newDeck = createDeck().slice(0, state.discardPile.length - 1);
        return {
          ...state,
          deck: newDeck,
          discardPile: [topDiscard],
          players: state.players.map((p, i) =>
            i === state.currentPlayerIndex
              ? { ...p, hand: [...p.hand, ...cards] }
              : p
          ),
          hasDrawn: true
        };
      }

      return {
        ...state,
        deck: newDeck,
        players: state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { ...p, hand: [...p.hand, ...cards] }
            : p
        ),
        hasDrawn: true
      };
    });
  }

  function drawFromDiscard() {
    setGameState(state => {
      if (state.hasDrawn || state.discardPile.length === 0) return state;

      const drawnCard = state.discardPile[state.discardPile.length - 1];
      const newDiscardPile = state.discardPile.slice(0, -1);

      return {
        ...state,
        discardPile: newDiscardPile,
        players: state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { ...p, hand: [...p.hand, drawnCard] }
            : p
        ),
        hasDrawn: true
      };
    });
  }

  function discardCard(cardId: string) {
    setGameState(state => {
      if (!state.hasDrawn) return state;

      const currentPlayer = state.players[state.currentPlayerIndex];
      const cardToDiscard = currentPlayer.hand.find(c => c.id === cardId);
      
      if (!cardToDiscard) return state;

      const newHand = currentPlayer.hand.filter(c => c.id !== cardId);
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

      return {
        ...state,
        discardPile: [...state.discardPile, cardToDiscard],
        players: state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { ...p, hand: newHand }
            : p
        ),
        currentPlayerIndex: nextPlayerIndex,
        hasDrawn: false
      };
    });
  }

  function completePhase(selectedCards: Card[]) {
    setGameState(state => {
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { 
                ...p, 
                hasCompletedPhase: true,
                hand: p.hand.filter(c => !selectedCards.find(sc => sc.id === c.id))
              }
            : p
        )
      };
    });
  }

  function resetGame() {
    setGameState(initializeGame());
  }

  return {
    gameState,
    drawFromDeck,
    drawFromDiscard,
    discardCard,
    completePhase,
    resetGame
  };
}
