export type GemColor = "diamond" | "sapphire" | "emerald" | "ruby" | "onyx";
export type TokenColor = GemColor | "gold";
export type Tier = 1 | 2 | 3;

export type GemAmount = Record<GemColor, number>;
export type TokenAmount = Record<TokenColor, number>;

export interface Card {
  id: number;
  tier: Tier;
  bonus: GemColor;
  points: number;
  cost: GemAmount;
}

export interface Noble {
  id: number;
  name: string;
  points: number;
  requirement: GemAmount;
}

export interface Player {
  id: string;
  name: string;
  tokens: TokenAmount;
  bonuses: GemAmount;
  reservedCards: Card[];
  purchasedCards: Card[];
  nobles: Noble[];
  points: number;
}

export type VisibleSlot = Card | null;

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  tokens: TokenAmount;
  decks: Record<Tier, number[]>;
  visibleCards: Record<Tier, VisibleSlot[]>;
  nobles: Noble[];
  turnNumber: number;
  phase: "AWAITING_ACTION" | "AWAITING_DISCARD" | "GAME_OVER";
  lastRound: boolean;
  finalTurnPlayerIndex: number | null;
  winnerIds: string[] | null;
}

export type Action =
  | { type: "TAKE_THREE_DIFFERENT"; colors: [GemColor, GemColor, GemColor] }
  | { type: "TAKE_TWO_SAME"; color: GemColor }
  | { type: "RESERVE_VISIBLE"; tier: Tier; slotIndex: number }
  | { type: "RESERVE_FROM_DECK"; tier: Tier }
  | { type: "PURCHASE_VISIBLE"; tier: Tier; slotIndex: number }
  | { type: "PURCHASE_RESERVED"; cardId: number }
  | { type: "DISCARD_TOKENS"; tokens: Partial<TokenAmount> };

export const GEM_COLORS: GemColor[] = ["diamond", "sapphire", "emerald", "ruby", "onyx"];
export const TOKEN_COLORS: TokenColor[] = [...GEM_COLORS, "gold"];
