import { useState } from 'react';
import type { GameState, Player, Card } from '../types/game';
import { createDeck, drawCards } from '../utils/deck';
import { CARDS_PER_HAND, PHASES } from '../utils/constants';
import { organizePhaseCards, canPlayOnSet, canPlayOnRun, canPlayOnColor, calculateHandScore } from '../utils/validation';

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
        hasCompletedPhase: false,
        score: 0
      },
      {
        id: 'computer',
        name: 'Computer',
        hand: [],
        completedPhases: [],
        currentPhase: 0,
        isComputer: true,
        hasCompletedPhase: false,
        score: 0
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
      
      // Check if hand is empty after discard - triggers round end
      if (newHand.length === 0) {
        // Calculate scores for remaining cards and advance phases
        const updatedPlayers = state.players.map((p, i) => {
          const finalHand = i === state.currentPlayerIndex ? newHand : p.hand;
          return {
            ...p,
            hand: finalHand,
            score: p.score + calculateHandScore(finalHand),
            // Advance phase if completed
            currentPhase: p.hasCompletedPhase ? p.currentPhase + 1 : p.currentPhase,
            completedPhases: p.hasCompletedPhase 
              ? [...p.completedPhases, p.currentPhase]
              : p.completedPhases
          };
        });
        
        return {
          ...state,
          discardPile: [...state.discardPile, cardToDiscard],
          players: updatedPlayers,
          phase: 'round-end'
        };
      }
      
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
      const currentPlayer = state.players[state.currentPlayerIndex];
      const currentPhase = PHASES[currentPlayer.currentPhase];
      
      // Organize cards into sets/runs/colors based on phase requirements
      const layedDownCards = organizePhaseCards(selectedCards, currentPhase.requirements);
      
      return {
        ...state,
        players: state.players.map((p, i) =>
          i === state.currentPlayerIndex
            ? { 
                ...p, 
                hasCompletedPhase: true,
                layedDownCards,
                hand: p.hand.filter(c => !selectedCards.find(sc => sc.id === c.id))
              }
            : p
        )
      };
    });
  }

  function playCardOnPhase(cardId: string, targetPlayerId: string, groupType: 'set' | 'run' | 'color', groupIndex: number) {
    setGameState(state => {
      if (!state.hasDrawn) return state;
      
      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer.hasCompletedPhase) return state;
      
      const card = currentPlayer.hand.find(c => c.id === cardId);
      if (!card) return state;
      
      const targetPlayer = state.players.find(p => p.id === targetPlayerId);
      if (!targetPlayer?.layedDownCards) return state;
      
      const targetGroup = targetPlayer.layedDownCards[groupType === 'set' ? 'sets' : groupType === 'run' ? 'runs' : 'colors'][groupIndex];
      if (!targetGroup) return state;
      
      // Check if card can be played on the target group
      let canPlay = false;
      if (groupType === 'set') {
        canPlay = canPlayOnSet(card, targetGroup);
      } else if (groupType === 'run') {
        canPlay = canPlayOnRun(card, targetGroup);
      } else if (groupType === 'color') {
        canPlay = canPlayOnColor(card, targetGroup);
      }
      
      if (!canPlay) return state;
      
      // Add card to target group and remove from hand
      return {
        ...state,
        players: state.players.map((p, i) => {
          // Always remove card from current player's hand
          const newHand = i === state.currentPlayerIndex 
            ? p.hand.filter(c => c.id !== cardId)
            : p.hand;
          
          // Add card to target player's layed down cards
          if (p.id === targetPlayerId && p.layedDownCards) {
            const newLayedDownCards = { ...p.layedDownCards };
            if (groupType === 'set') {
              newLayedDownCards.sets = [...newLayedDownCards.sets];
              newLayedDownCards.sets[groupIndex] = [...newLayedDownCards.sets[groupIndex], card];
            } else if (groupType === 'run') {
              newLayedDownCards.runs = [...newLayedDownCards.runs];
              newLayedDownCards.runs[groupIndex] = [...newLayedDownCards.runs[groupIndex], card];
            } else if (groupType === 'color') {
              newLayedDownCards.colors = [...newLayedDownCards.colors];
              newLayedDownCards.colors[groupIndex] = [...newLayedDownCards.colors[groupIndex], card];
            }
            return { ...p, hand: newHand, layedDownCards: newLayedDownCards };
          }
          
          return { ...p, hand: newHand };
        })
      };
    });
  }

  function endRound() {
    setGameState(state => {
      // Calculate scores for remaining cards
      const updatedPlayers = state.players.map(p => ({
        ...p,
        score: p.score + calculateHandScore(p.hand),
        // Advance phase if completed
        currentPhase: p.hasCompletedPhase ? p.currentPhase + 1 : p.currentPhase,
        completedPhases: p.hasCompletedPhase 
          ? [...p.completedPhases, p.currentPhase]
          : p.completedPhases
      }));
      
      return {
        ...state,
        players: updatedPlayers,
        phase: 'round-end'
      };
    });
  }

  function startNextRound() {
    setGameState(state => {
      const deck = createDeck();
      
      // Reset players for new round but keep scores and phases
      const resetPlayers: Player[] = state.players.map(p => ({
        ...p,
        hand: [] as Card[],
        hasCompletedPhase: false,
        layedDownCards: undefined
      }));
      
      // Deal cards to players
      let remainingDeck = deck;
      for (const player of resetPlayers) {
        const { cards, remainingDeck: newDeck } = drawCards(remainingDeck, CARDS_PER_HAND);
        player.hand = cards;
        remainingDeck = newDeck;
      }
      
      // Initialize discard pile with one card
      const { cards: discardCards, remainingDeck: finalDeck } = drawCards(remainingDeck, 1);
      
      return {
        ...state,
        players: resetPlayers,
        deck: finalDeck,
        discardPile: discardCards,
        currentPlayerIndex: 0,
        phase: 'playing',
        round: state.round + 1,
        hasDrawn: false
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
    playCardOnPhase,
    endRound,
    startNextRound,
    resetGame
  };
}
