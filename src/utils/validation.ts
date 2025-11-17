import type { Card } from '../types/game';

export function isSet(cards: Card[]): boolean {
  if (cards.length < 2) return false;
  
  const values = cards.map(c => {
    if (c.wild === 'wild') return null; // Wild can be anything
    return c.value;
  }).filter(v => v !== null);
  
  if (values.length === 0) return false; // Can't have all wilds
  
  const uniqueValues = new Set(values);
  return uniqueValues.size === 1; // All non-wild cards must have same value
}

export function isRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  
  const wildCount = cards.filter(c => c.wild === 'wild').length;
  const numberedCards = cards
    .filter(c => c.value !== undefined)
    .sort((a, b) => (a.value || 0) - (b.value || 0));
  
  if (numberedCards.length === 0) return false;
  
  // Check if numbered cards form a sequence with gaps that can be filled by wilds
  let expectedValue = numberedCards[0].value!;
  let wildsNeeded = 0;
  
  for (let i = 0; i < numberedCards.length; i++) {
    const card = numberedCards[i];
    if (card.value === expectedValue) {
      expectedValue++;
    } else if (card.value! > expectedValue) {
      wildsNeeded += card.value! - expectedValue;
      expectedValue = card.value! + 1;
    } else {
      return false; // Duplicate value in run
    }
  }
  
  return wildsNeeded <= wildCount;
}

export function isSameColor(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  
  const colors = cards
    .filter(c => c.suit !== undefined)
    .map(c => c.suit);
  
  if (colors.length === 0) return false;
  
  const uniqueColors = new Set(colors);
  return uniqueColors.size === 1;
}

export function canCompletePhase(
  cards: Card[],
  phaseRequirements: { sets?: number[], runs?: number[], sameColor?: number }
): boolean {
  const { sets, runs, sameColor } = phaseRequirements;
  
  if (sets) {
    // Try to find required sets
    let remainingCards = [...cards];
    for (const setSize of sets) {
      const foundSet = findSet(remainingCards, setSize);
      if (!foundSet) return false;
      remainingCards = remainingCards.filter(c => !foundSet.includes(c));
    }
  }
  
  if (runs) {
    // Try to find required runs
    let remainingCards = [...cards];
    for (const runSize of runs) {
      const foundRun = findRun(remainingCards, runSize);
      if (!foundRun) return false;
      remainingCards = remainingCards.filter(c => !foundRun.includes(c));
    }
  }
  
  if (sameColor) {
    return isSameColor(cards) && cards.length >= sameColor;
  }
  
  return true;
}

function findSet(cards: Card[], size: number): Card[] | null {
  // Try all combinations to find a valid set
  const combinations = getCombinations(cards, size);
  for (const combo of combinations) {
    if (isSet(combo)) {
      return combo;
    }
  }
  return null;
}

function findRun(cards: Card[], size: number): Card[] | null {
  // Simple implementation - try all combinations
  const combinations = getCombinations(cards, size);
  for (const combo of combinations) {
    if (isRun(combo)) {
      return combo;
    }
  }
  return null;
}

function getCombinations<T>(array: T[], size: number): T[][] {
  if (size === 1) return array.map(item => [item]);
  if (size > array.length) return [];
  
  const result: T[][] = [];
  for (let i = 0; i <= array.length - size; i++) {
    const head = array[i];
    const tailCombs = getCombinations(array.slice(i + 1), size - 1);
    for (const tail of tailCombs) {
      result.push([head, ...tail]);
    }
  }
  return result;
}
