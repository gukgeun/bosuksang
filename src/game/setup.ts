import { CARDS, NOBLES, cardById } from "./data";
import { createRng, shuffle } from "./rng";
import { GEM_COLORS } from "./types";
import type { GameState, Player, Tier, VisibleSlot } from "./types";

const TOKEN_COUNT_BY_PLAYERS: Record<number, number> = { 2: 4, 3: 5, 4: 7 };
const NOBLE_COUNT_BY_PLAYERS: Record<number, number> = { 2: 3, 3: 4, 4: 5 };
const TIERS: Tier[] = [1, 2, 3];

export function createInitialState(playerNames: string[], seed: number = Date.now()): GameState {
  const playerCount = playerNames.length;
  if (playerCount < 2 || playerCount > 4) {
    throw new Error("플레이어는 2~4명이어야 합니다.");
  }

  const rng = createRng(seed);

  const decks: Record<Tier, number[]> = { 1: [], 2: [], 3: [] };
  const visibleCards: Record<Tier, VisibleSlot[]> = { 1: [], 2: [], 3: [] };

  for (const tier of TIERS) {
    const shuffledIds = shuffle(
      CARDS.filter((card) => card.tier === tier).map((card) => card.id),
      rng,
    );
    visibleCards[tier] = shuffledIds.slice(0, 4).map((id) => cardById(id));
    decks[tier] = shuffledIds.slice(4);
  }

  const nobles = shuffle(
    NOBLES.map((noble) => noble.id),
    rng,
  )
    .slice(0, NOBLE_COUNT_BY_PLAYERS[playerCount])
    .map((id) => NOBLES.find((noble) => noble.id === id)!);

  const tokenCount = TOKEN_COUNT_BY_PLAYERS[playerCount];
  const tokens = {
    diamond: tokenCount,
    sapphire: tokenCount,
    emerald: tokenCount,
    ruby: tokenCount,
    onyx: tokenCount,
    gold: 5,
  };

  const players: Player[] = playerNames.map((name, index) => ({
    id: `p${index + 1}`,
    name,
    tokens: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0 },
    bonuses: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0 },
    reservedCards: [],
    purchasedCards: [],
    nobles: [],
    points: 0,
  }));

  return {
    players,
    currentPlayerIndex: 0,
    tokens,
    decks,
    visibleCards,
    nobles,
    turnNumber: 1,
    phase: "AWAITING_ACTION",
    lastRound: false,
    finalTurnPlayerIndex: null,
    winnerIds: null,
  };
}

export function totalTokenCount(player: Player): number {
  return GEM_COLORS.reduce((sum, color) => sum + player.tokens[color], player.tokens.gold);
}
