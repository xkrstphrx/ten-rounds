export type Suit = 'red' | 'blue' | 'green' | 'yellow';
export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type WildType = 'wild' | 'skip';

export interface Card {
  id: string;
  suit?: Suit;
  value?: CardValue;
  wild?: WildType;
}

export type PhaseType = 
  | '2-sets-3' 
  | '1-set-3-1-run-4'
  | '1-set-4-1-run-4'
  | '1-run-7'
  | '1-run-8'
  | '1-run-9'
  | '2-sets-4'
  | '7-cards-one-color'
  | '1-set-5-1-set-2'
  | '1-set-5-1-set-3';

export interface Phase {
  type: PhaseType;
  description: string;
  requirements: {
    sets?: number[];
    runs?: number[];
    sameColor?: number;
  };
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  completedPhases: number[];
  currentPhase: number;
  isComputer: boolean;
  hasCompletedPhase: boolean;
  score: number;
  layedDownCards?: {
    sets: Card[][];
    runs: Card[][];
    colors: Card[][];
  };
}

export type GamePhase = 'setup' | 'playing' | 'round-end' | 'game-over';

export interface GameState {
  players: Player[];
  deck: Card[];
  discardPile: Card[];
  currentPlayerIndex: number;
  phase: GamePhase;
  round: number;
  hasDrawn: boolean;
  winner?: string;
}
