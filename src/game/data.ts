import type { Card, GemAmount, Noble, Tier } from "./types";

function cost(diamond: number, sapphire: number, emerald: number, ruby: number, onyx: number): GemAmount {
  return { diamond, sapphire, emerald, ruby, onyx };
}

interface CardDef {
  tier: Tier;
  bonus: Card["bonus"];
  points: number;
  cost: GemAmount;
}

// prettier-ignore
const CARD_DEFS: CardDef[] = [
  // Tier 1 (40)
  { tier: 1, bonus: "onyx", points: 0, cost: cost(1, 1, 1, 1, 0) },
  { tier: 1, bonus: "onyx", points: 0, cost: cost(1, 1, 1, 2, 0) },
  { tier: 1, bonus: "onyx", points: 0, cost: cost(2, 0, 1, 2, 0) },
  { tier: 1, bonus: "onyx", points: 0, cost: cost(0, 1, 0, 3, 1) },
  { tier: 1, bonus: "onyx", points: 0, cost: cost(0, 0, 2, 1, 0) },
  { tier: 1, bonus: "onyx", points: 0, cost: cost(2, 0, 2, 0, 0) },
  { tier: 1, bonus: "onyx", points: 0, cost: cost(0, 0, 3, 0, 0) },
  { tier: 1, bonus: "onyx", points: 1, cost: cost(0, 4, 0, 0, 0) },
  { tier: 1, bonus: "sapphire", points: 0, cost: cost(1, 0, 1, 1, 1) },
  { tier: 1, bonus: "sapphire", points: 0, cost: cost(1, 0, 1, 2, 1) },
  { tier: 1, bonus: "sapphire", points: 0, cost: cost(1, 0, 2, 2, 0) },
  { tier: 1, bonus: "sapphire", points: 0, cost: cost(0, 1, 3, 1, 0) },
  { tier: 1, bonus: "sapphire", points: 0, cost: cost(1, 2, 0, 0, 0) },
  { tier: 1, bonus: "sapphire", points: 0, cost: cost(2, 0, 2, 0, 0) },
  { tier: 1, bonus: "sapphire", points: 0, cost: cost(0, 3, 0, 0, 0) },
  { tier: 1, bonus: "sapphire", points: 1, cost: cost(0, 0, 0, 4, 0) },
  { tier: 1, bonus: "diamond", points: 0, cost: cost(0, 1, 1, 1, 1) },
  { tier: 1, bonus: "diamond", points: 0, cost: cost(0, 1, 2, 1, 1) },
  { tier: 1, bonus: "diamond", points: 0, cost: cost(0, 2, 2, 0, 1) },
  { tier: 1, bonus: "diamond", points: 0, cost: cost(1, 1, 0, 0, 3) },
  { tier: 1, bonus: "diamond", points: 0, cost: cost(0, 1, 0, 2, 0) },
  { tier: 1, bonus: "diamond", points: 0, cost: cost(2, 2, 0, 0, 0) },
  { tier: 1, bonus: "diamond", points: 0, cost: cost(0, 0, 3, 0, 0) },
  { tier: 1, bonus: "diamond", points: 1, cost: cost(0, 0, 4, 0, 0) },
  { tier: 1, bonus: "emerald", points: 0, cost: cost(1, 1, 0, 1, 1) },
  { tier: 1, bonus: "emerald", points: 0, cost: cost(1, 1, 0, 1, 2) },
  { tier: 1, bonus: "emerald", points: 0, cost: cost(2, 1, 0, 2, 0) },
  { tier: 1, bonus: "emerald", points: 0, cost: cost(1, 0, 1, 3, 0) },
  { tier: 1, bonus: "emerald", points: 0, cost: cost(0, 0, 0, 1, 2) },
  { tier: 1, bonus: "emerald", points: 0, cost: cost(0, 2, 0, 2, 0) },
  { tier: 1, bonus: "emerald", points: 0, cost: cost(0, 0, 0, 3, 0) },
  { tier: 1, bonus: "emerald", points: 1, cost: cost(0, 0, 0, 0, 4) },
  { tier: 1, bonus: "ruby", points: 0, cost: cost(1, 1, 1, 0, 1) },
  { tier: 1, bonus: "ruby", points: 0, cost: cost(2, 1, 1, 0, 1) },
  { tier: 1, bonus: "ruby", points: 0, cost: cost(2, 0, 1, 0, 2) },
  { tier: 1, bonus: "ruby", points: 0, cost: cost(1, 3, 0, 0, 1) },
  { tier: 1, bonus: "ruby", points: 0, cost: cost(0, 0, 2, 1, 0) },
  { tier: 1, bonus: "ruby", points: 0, cost: cost(0, 2, 0, 0, 2) },
  { tier: 1, bonus: "ruby", points: 0, cost: cost(0, 0, 0, 0, 3) },
  { tier: 1, bonus: "ruby", points: 1, cost: cost(0, 0, 0, 0, 4) },

  // Tier 2 (30)
  { tier: 2, bonus: "onyx", points: 1, cost: cost(3, 2, 2, 0, 0) },
  { tier: 2, bonus: "onyx", points: 1, cost: cost(3, 2, 0, 0, 2) },
  { tier: 2, bonus: "onyx", points: 2, cost: cost(0, 1, 4, 2, 0) },
  { tier: 2, bonus: "onyx", points: 2, cost: cost(0, 0, 5, 3, 0) },
  { tier: 2, bonus: "onyx", points: 2, cost: cost(5, 0, 0, 0, 0) },
  { tier: 2, bonus: "onyx", points: 3, cost: cost(0, 0, 0, 0, 6) },
  { tier: 2, bonus: "sapphire", points: 1, cost: cost(0, 2, 2, 3, 0) },
  { tier: 2, bonus: "sapphire", points: 1, cost: cost(0, 3, 2, 0, 3) },
  { tier: 2, bonus: "sapphire", points: 2, cost: cost(5, 0, 3, 0, 0) },
  { tier: 2, bonus: "sapphire", points: 2, cost: cost(2, 4, 0, 1, 0) },
  { tier: 2, bonus: "sapphire", points: 2, cost: cost(0, 0, 5, 0, 0) },
  { tier: 2, bonus: "sapphire", points: 3, cost: cost(0, 0, 0, 6, 0) },
  { tier: 2, bonus: "diamond", points: 1, cost: cost(0, 0, 3, 2, 2) },
  { tier: 2, bonus: "diamond", points: 1, cost: cost(2, 0, 0, 3, 3) },
  { tier: 2, bonus: "diamond", points: 2, cost: cost(0, 0, 1, 4, 2) },
  { tier: 2, bonus: "diamond", points: 2, cost: cost(0, 3, 0, 5, 0) },
  { tier: 2, bonus: "diamond", points: 2, cost: cost(0, 0, 0, 0, 5) },
  { tier: 2, bonus: "diamond", points: 3, cost: cost(0, 0, 0, 0, 6) },
  { tier: 2, bonus: "emerald", points: 1, cost: cost(3, 0, 0, 3, 2) },
  { tier: 2, bonus: "emerald", points: 1, cost: cost(2, 3, 0, 0, 2) },
  { tier: 2, bonus: "emerald", points: 2, cost: cost(0, 2, 0, 0, 4) },
  { tier: 2, bonus: "emerald", points: 2, cost: cost(0, 0, 5, 3, 0) },
  { tier: 2, bonus: "emerald", points: 2, cost: cost(0, 5, 0, 0, 0) },
  { tier: 2, bonus: "emerald", points: 3, cost: cost(0, 0, 6, 0, 0) },
  { tier: 2, bonus: "ruby", points: 1, cost: cost(2, 0, 0, 2, 3) },
  { tier: 2, bonus: "ruby", points: 1, cost: cost(2, 0, 3, 0, 3) },
  { tier: 2, bonus: "ruby", points: 2, cost: cost(1, 0, 0, 4, 2) },
  { tier: 2, bonus: "ruby", points: 2, cost: cost(0, 0, 0, 3, 5) },
  { tier: 2, bonus: "ruby", points: 2, cost: cost(0, 0, 0, 0, 5) },
  { tier: 2, bonus: "ruby", points: 3, cost: cost(0, 0, 0, 6, 0) },

  // Tier 3 (20)
  { tier: 3, bonus: "onyx", points: 3, cost: cost(3, 3, 5, 3, 0) },
  { tier: 3, bonus: "onyx", points: 4, cost: cost(0, 0, 0, 7, 0) },
  { tier: 3, bonus: "onyx", points: 4, cost: cost(3, 0, 0, 6, 3) },
  { tier: 3, bonus: "onyx", points: 5, cost: cost(3, 0, 0, 7, 0) },
  { tier: 3, bonus: "sapphire", points: 3, cost: cost(3, 0, 3, 3, 5) },
  { tier: 3, bonus: "sapphire", points: 4, cost: cost(7, 0, 0, 0, 0) },
  { tier: 3, bonus: "sapphire", points: 4, cost: cost(6, 3, 0, 0, 3) },
  { tier: 3, bonus: "sapphire", points: 5, cost: cost(7, 0, 0, 0, 3) },
  { tier: 3, bonus: "diamond", points: 3, cost: cost(0, 3, 3, 3, 5) },
  { tier: 3, bonus: "diamond", points: 4, cost: cost(0, 0, 0, 0, 7) },
  { tier: 3, bonus: "diamond", points: 4, cost: cost(3, 6, 0, 0, 3) },
  { tier: 3, bonus: "diamond", points: 5, cost: cost(0, 7, 0, 0, 3) },
  { tier: 3, bonus: "emerald", points: 3, cost: cost(5, 3, 0, 3, 3) },
  { tier: 3, bonus: "emerald", points: 4, cost: cost(0, 7, 0, 0, 0) },
  { tier: 3, bonus: "emerald", points: 4, cost: cost(3, 3, 6, 0, 0) },
  { tier: 3, bonus: "emerald", points: 5, cost: cost(0, 0, 7, 3, 0) },
  { tier: 3, bonus: "ruby", points: 3, cost: cost(3, 3, 3, 0, 5) },
  { tier: 3, bonus: "ruby", points: 4, cost: cost(0, 0, 7, 0, 0) },
  { tier: 3, bonus: "ruby", points: 4, cost: cost(3, 0, 3, 6, 0) },
  { tier: 3, bonus: "ruby", points: 5, cost: cost(0, 3, 7, 0, 0) },
];

export const CARDS: Card[] = CARD_DEFS.map((def, index) => ({
  id: index,
  tier: def.tier,
  bonus: def.bonus,
  points: def.points,
  cost: def.cost,
}));

export function cardsByTier(tier: Tier): Card[] {
  return CARDS.filter((card) => card.tier === tier);
}

const CARD_BY_ID = new Map(CARDS.map((card) => [card.id, card]));

export function cardById(id: number): Card {
  const card = CARD_BY_ID.get(id);
  if (!card) throw new Error(`알 수 없는 카드 id: ${id}`);
  return card;
}

// Position of each card within its own tier (0-based) — used to cycle through
// a smaller set of reused artwork frames per tier.
export const CARD_TIER_INDEX: Record<number, number> = (() => {
  const counters: Record<Tier, number> = { 1: 0, 2: 0, 3: 0 };
  const map: Record<number, number> = {};
  for (const card of CARDS) {
    map[card.id] = counters[card.tier]++;
  }
  return map;
})();

interface NobleDef {
  name: string;
  requirement: GemAmount;
}

const NOBLE_DEFS: NobleDef[] = [
  { name: "대상단주", requirement: cost(0, 0, 4, 4, 0) },
  { name: "북방 채굴왕", requirement: cost(0, 4, 4, 0, 0) },
  { name: "궁정 보석사", requirement: cost(4, 4, 0, 0, 0) },
  { name: "왕실 조달상", requirement: cost(4, 0, 0, 0, 4) },
  { name: "사막의 대상", requirement: cost(0, 0, 0, 4, 4) },
  { name: "항구의 무역상", requirement: cost(0, 3, 3, 3, 0) },
  { name: "고원의 세공사", requirement: cost(3, 0, 3, 3, 0) },
  { name: "떠돌이 감정관", requirement: cost(3, 3, 0, 0, 3) },
  { name: "황실 전속상인", requirement: cost(0, 0, 3, 3, 3) },
  { name: "옛 유물상", requirement: cost(3, 3, 3, 0, 0) },
];

export const NOBLES: Noble[] = NOBLE_DEFS.map((def, index) => ({
  id: index,
  name: def.name,
  points: 3,
  requirement: def.requirement,
}));

const NOBLE_BY_ID = new Map(NOBLES.map((noble) => [noble.id, noble]));

export function nobleById(id: number): Noble {
  const noble = NOBLE_BY_ID.get(id);
  if (!noble) throw new Error(`알 수 없는 귀족 id: ${id}`);
  return noble;
}
