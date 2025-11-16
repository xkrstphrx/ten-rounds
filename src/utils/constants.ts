import type { Phase } from '../types/game';

export const PHASES: Phase[] = [
  {
    type: '2-sets-3',
    description: '2 sets of 3',
    requirements: { sets: [3, 3] }
  },
  {
    type: '1-set-3-1-run-4',
    description: '1 set of 3 + 1 run of 4',
    requirements: { sets: [3], runs: [4] }
  },
  {
    type: '1-set-4-1-run-4',
    description: '1 set of 4 + 1 run of 4',
    requirements: { sets: [4], runs: [4] }
  },
  {
    type: '1-run-7',
    description: '1 run of 7',
    requirements: { runs: [7] }
  },
  {
    type: '1-run-8',
    description: '1 run of 8',
    requirements: { runs: [8] }
  },
  {
    type: '1-run-9',
    description: '1 run of 9',
    requirements: { runs: [9] }
  },
  {
    type: '2-sets-4',
    description: '2 sets of 4',
    requirements: { sets: [4, 4] }
  },
  {
    type: '7-cards-one-color',
    description: '7 cards of one color',
    requirements: { sameColor: 7 }
  },
  {
    type: '1-set-5-1-set-2',
    description: '1 set of 5 + 1 set of 2',
    requirements: { sets: [5, 2] }
  },
  {
    type: '1-set-5-1-set-3',
    description: '1 set of 5 + 1 set of 3',
    requirements: { sets: [5, 3] }
  }
];

export const CARDS_PER_HAND = 10;
export const WILD_CARDS_PER_DECK = 8;
export const SKIP_CARDS_PER_DECK = 4;
