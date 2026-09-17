import { cardById } from "./data";
import { totalTokenCount } from "./setup";
import { GEM_COLORS } from "./types";
import type { Action, Card, GameState, GemColor, Player, Tier, TokenAmount } from "./types";

const MAX_RESERVED_CARDS = 3;
const MAX_TOKENS_HELD = 10;

// Client-side affordability check (no mutation) — used by the UI to enable/disable
// the purchase button before actually submitting the action.
export function canAffordCard(player: Player, card: Card): boolean {
  let goldNeeded = 0;
  for (const color of GEM_COLORS) {
    const required = Math.max(0, card.cost[color] - player.bonuses[color]);
    const payFromColor = Math.min(player.tokens[color], required);
    goldNeeded += required - payFromColor;
  }
  return goldNeeded <= player.tokens.gold;
}

function clonePlayer(player: Player): Player {
  return {
    ...player,
    tokens: { ...player.tokens },
    bonuses: { ...player.bonuses },
    reservedCards: [...player.reservedCards],
    purchasedCards: [...player.purchasedCards],
    nobles: [...player.nobles],
  };
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(clonePlayer),
    tokens: { ...state.tokens },
    decks: { 1: [...state.decks[1]], 2: [...state.decks[2]], 3: [...state.decks[3]] },
    visibleCards: {
      1: [...state.visibleCards[1]],
      2: [...state.visibleCards[2]],
      3: [...state.visibleCards[3]],
    },
    nobles: [...state.nobles],
  };
}

function requirePhase(state: GameState, phase: GameState["phase"]) {
  if (state.phase !== phase) {
    throw new Error(`지금은 이 행동을 할 수 없습니다 (현재 단계: ${state.phase}).`);
  }
}

function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

function refillVisibleSlot(state: GameState, tier: Tier, slotIndex: number) {
  const deck = state.decks[tier];
  const nextId = deck.shift();
  state.visibleCards[tier][slotIndex] = nextId === undefined ? null : cardById(nextId);
}

export function applyAction(state: GameState, action: Action): GameState {
  if (state.phase === "GAME_OVER") {
    throw new Error("게임이 이미 종료되었습니다.");
  }

  switch (action.type) {
    case "TAKE_THREE_DIFFERENT":
      return takeThreeDifferent(state, action.colors);
    case "TAKE_TWO_SAME":
      return takeTwoSame(state, action.color);
    case "RESERVE_VISIBLE":
      return reserveVisible(state, action.tier, action.slotIndex);
    case "RESERVE_FROM_DECK":
      return reserveFromDeck(state, action.tier);
    case "PURCHASE_VISIBLE":
      return purchaseVisible(state, action.tier, action.slotIndex);
    case "PURCHASE_RESERVED":
      return purchaseReserved(state, action.cardId);
    case "DISCARD_TOKENS":
      return discardTokens(state, action.tokens);
    default:
      throw new Error("알 수 없는 액션입니다.");
  }
}

function takeThreeDifferent(state: GameState, colors: [GemColor, GemColor, GemColor]): GameState {
  requirePhase(state, "AWAITING_ACTION");
  const uniqueColors = new Set(colors);
  if (uniqueColors.size !== 3) {
    throw new Error("서로 다른 색 3개를 골라야 합니다.");
  }
  const next = cloneState(state);
  for (const color of colors) {
    if (next.tokens[color] < 1) {
      throw new Error(`${color} 토큰이 은행에 남아있지 않습니다.`);
    }
    next.tokens[color] -= 1;
    currentPlayer(next).tokens[color] += 1;
  }
  return finalizeAfterAction(next);
}

function takeTwoSame(state: GameState, color: GemColor): GameState {
  requirePhase(state, "AWAITING_ACTION");
  if (state.tokens[color] < 4) {
    throw new Error("해당 색 토큰이 4개 이상 남아있어야 2개를 가져올 수 있습니다.");
  }
  const next = cloneState(state);
  next.tokens[color] -= 2;
  currentPlayer(next).tokens[color] += 2;
  return finalizeAfterAction(next);
}

function reserveVisible(state: GameState, tier: Tier, slotIndex: number): GameState {
  requirePhase(state, "AWAITING_ACTION");
  const card = state.visibleCards[tier][slotIndex];
  if (!card) {
    throw new Error("예약할 카드가 없습니다.");
  }
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.reservedCards.length >= MAX_RESERVED_CARDS) {
    throw new Error("예약 카드는 최대 3장까지 보유할 수 있습니다.");
  }
  player.reservedCards.push(card);
  refillVisibleSlot(next, tier, slotIndex);
  if (next.tokens.gold > 0) {
    next.tokens.gold -= 1;
    player.tokens.gold += 1;
  }
  return finalizeAfterAction(next);
}

function reserveFromDeck(state: GameState, tier: Tier): GameState {
  requirePhase(state, "AWAITING_ACTION");
  if (state.decks[tier].length === 0) {
    throw new Error("해당 티어의 덱이 비어 있습니다.");
  }
  const next = cloneState(state);
  const player = currentPlayer(next);
  if (player.reservedCards.length >= MAX_RESERVED_CARDS) {
    throw new Error("예약 카드는 최대 3장까지 보유할 수 있습니다.");
  }
  const cardId = next.decks[tier].shift()!;
  player.reservedCards.push(cardById(cardId));
  if (next.tokens.gold > 0) {
    next.tokens.gold -= 1;
    player.tokens.gold += 1;
  }
  return finalizeAfterAction(next);
}

function payForCard(player: Player, card: Card, bank: TokenAmount): { player: Player; bank: TokenAmount } {
  const newPlayerTokens = { ...player.tokens };
  const newBank = { ...bank };
  let goldNeeded = 0;

  for (const color of GEM_COLORS) {
    const required = Math.max(0, card.cost[color] - player.bonuses[color]);
    const payFromColor = Math.min(newPlayerTokens[color], required);
    newPlayerTokens[color] -= payFromColor;
    newBank[color] += payFromColor;
    goldNeeded += required - payFromColor;
  }

  if (goldNeeded > newPlayerTokens.gold) {
    throw new Error("보유한 보석과 골드로 이 카드를 구매할 수 없습니다.");
  }
  newPlayerTokens.gold -= goldNeeded;
  newBank.gold += goldNeeded;

  const newBonuses = { ...player.bonuses, [card.bonus]: player.bonuses[card.bonus] + 1 };

  return {
    player: {
      ...player,
      tokens: newPlayerTokens,
      bonuses: newBonuses,
      points: player.points + card.points,
      purchasedCards: [...player.purchasedCards, card],
    },
    bank: newBank,
  };
}

function purchaseVisible(state: GameState, tier: Tier, slotIndex: number): GameState {
  requirePhase(state, "AWAITING_ACTION");
  const card = state.visibleCards[tier][slotIndex];
  if (!card) {
    throw new Error("구매할 카드가 없습니다.");
  }
  const next = cloneState(state);
  const { player, bank } = payForCard(currentPlayer(next), card, next.tokens);
  next.players[next.currentPlayerIndex] = player;
  next.tokens = bank;
  refillVisibleSlot(next, tier, slotIndex);
  return finalizeAfterAction(next);
}

function purchaseReserved(state: GameState, cardId: number): GameState {
  requirePhase(state, "AWAITING_ACTION");
  const next = cloneState(state);
  const playerBefore = currentPlayer(next);
  const cardIndex = playerBefore.reservedCards.findIndex((c) => c.id === cardId);
  if (cardIndex === -1) {
    throw new Error("예약 목록에 없는 카드입니다.");
  }
  const card = playerBefore.reservedCards[cardIndex];
  const { player, bank } = payForCard(playerBefore, card, next.tokens);
  player.reservedCards = player.reservedCards.filter((_, i) => i !== cardIndex);
  next.players[next.currentPlayerIndex] = player;
  next.tokens = bank;
  return finalizeAfterAction(next);
}

function discardTokens(state: GameState, discard: Partial<TokenAmount>): GameState {
  requirePhase(state, "AWAITING_DISCARD");
  const next = cloneState(state);
  const player = currentPlayer(next);

  const discardTotal = Object.values(discard).reduce((sum: number, n) => sum + (n ?? 0), 0);
  const currentTotal = totalTokenCount(player);
  if (currentTotal - discardTotal !== MAX_TOKENS_HELD) {
    throw new Error(`토큰을 정확히 ${currentTotal - MAX_TOKENS_HELD}개 버려야 합니다.`);
  }

  for (const [color, amount] of Object.entries(discard) as [keyof TokenAmount, number | undefined][]) {
    const n = amount ?? 0;
    if (n < 0 || n > player.tokens[color]) {
      throw new Error("보유하지 않은 토큰을 버릴 수 없습니다.");
    }
    player.tokens[color] -= n;
    next.tokens[color] += n;
  }

  return advanceTurn(next);
}

function checkNobleVisit(state: GameState): GameState {
  const player = currentPlayer(state);
  const eligibleIndex = state.nobles.findIndex((noble) =>
    GEM_COLORS.every((color) => player.bonuses[color] >= noble.requirement[color]),
  );
  if (eligibleIndex === -1) {
    return state;
  }
  const next = cloneState(state);
  const [noble] = next.nobles.splice(eligibleIndex, 1);
  const nextPlayer = currentPlayer(next);
  nextPlayer.nobles.push(noble);
  nextPlayer.points += noble.points;
  return next;
}

function finalizeAfterAction(state: GameState): GameState {
  const afterNoble = checkNobleVisit(state);
  const player = currentPlayer(afterNoble);
  if (totalTokenCount(player) > MAX_TOKENS_HELD) {
    return { ...afterNoble, phase: "AWAITING_DISCARD" };
  }
  return advanceTurn(afterNoble);
}

function determineWinnerIds(players: Player[]): string[] {
  const maxPoints = Math.max(...players.map((p) => p.points));
  const topByPoints = players.filter((p) => p.points === maxPoints);
  const minCards = Math.min(...topByPoints.map((p) => p.purchasedCards.length));
  return topByPoints.filter((p) => p.purchasedCards.length === minCards).map((p) => p.id);
}

function advanceTurn(state: GameState): GameState {
  const player = currentPlayer(state);
  let lastRound = state.lastRound;
  let finalTurnPlayerIndex = state.finalTurnPlayerIndex;

  if (!lastRound && player.points >= 15) {
    lastRound = true;
    finalTurnPlayerIndex = state.currentPlayerIndex;
  }

  const nextIndex = (state.currentPlayerIndex + 1) % state.players.length;

  if (lastRound && nextIndex === finalTurnPlayerIndex) {
    return {
      ...state,
      lastRound,
      finalTurnPlayerIndex,
      phase: "GAME_OVER",
      winnerIds: determineWinnerIds(state.players),
    };
  }

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    turnNumber: state.turnNumber + 1,
    phase: "AWAITING_ACTION",
    lastRound,
    finalTurnPlayerIndex,
  };
}
