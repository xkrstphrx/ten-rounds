import type { Card, Suit, CardValue } from '../types/game';
import { WILD_CARDS_PER_DECK, SKIP_CARDS_PER_DECK } from './constants';

let cardIdCounter = 0;

export function createDeck(): Card[] {
  const deck: Card[] = [];
  const suits: Suit[] = ['red', 'blue', 'green', 'yellow'];
  const values: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Create two sets of numbered cards (2 decks)
  for (let i = 0; i < 2; i++) {
    for (const suit of suits) {
      for (const value of values) {
        deck.push({
          id: `card-${cardIdCounter++}`,
          suit,
          value
        });
      }
    }
  }

  // Add wild cards
  for (let i = 0; i < WILD_CARDS_PER_DECK; i++) {
    deck.push({
      id: `wild-${cardIdCounter++}`,
      wild: 'wild'
    });
  }

  // Add skip cards
  for (let i = 0; i < SKIP_CARDS_PER_DECK; i++) {
    deck.push({
      id: `skip-${cardIdCounter++}`,
      wild: 'skip'
    });
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function drawCards(deck: Card[], count: number): { cards: Card[], remainingDeck: Card[] } {
  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { cards, remainingDeck };
}
