import { describe, expect, it } from "vitest";
import { applyAction } from "./engine";
import { createInitialState, totalTokenCount } from "./setup";
import type { GameState } from "./types";

function setup(playerCount: number, seed = 1) {
  const names = Array.from({ length: playerCount }, (_, i) => `P${i + 1}`);
  return createInitialState(names, seed);
}

describe("createInitialState", () => {
  it("sizes the token bank and nobles by player count", () => {
    const s2 = setup(2);
    expect(s2.tokens.diamond).toBe(4);
    expect(s2.tokens.gold).toBe(5);
    expect(s2.nobles).toHaveLength(3);

    const s3 = setup(3);
    expect(s3.tokens.diamond).toBe(5);
    expect(s3.nobles).toHaveLength(4);

    const s4 = setup(4);
    expect(s4.tokens.diamond).toBe(7);
    expect(s4.nobles).toHaveLength(5);
  });

  it("deals 4 visible cards per tier and keeps the rest in the deck", () => {
    const s = setup(4);
    expect(s.visibleCards[1]).toHaveLength(4);
    expect(s.decks[1]).toHaveLength(36); // 40 - 4
    expect(s.decks[2]).toHaveLength(26); // 30 - 4
    expect(s.decks[3]).toHaveLength(16); // 20 - 4
  });

  it("rejects invalid player counts", () => {
    expect(() => createInitialState(["only one"], 1)).toThrow();
    expect(() => createInitialState(["a", "b", "c", "d", "e"], 1)).toThrow();
  });
});

describe("taking tokens", () => {
  it("takes three different colors and advances the turn", () => {
    const s = setup(2);
    const next = applyAction(s, { type: "TAKE_THREE_DIFFERENT", colors: ["diamond", "sapphire", "emerald"] });
    expect(next.players[0].tokens.diamond).toBe(1);
    expect(next.players[0].tokens.sapphire).toBe(1);
    expect(next.tokens.diamond).toBe(3);
    expect(next.currentPlayerIndex).toBe(1);
    expect(next.turnNumber).toBe(2);
  });

  it("rejects taking three of the same color", () => {
    const s = setup(2);
    expect(() =>
      applyAction(s, { type: "TAKE_THREE_DIFFERENT", colors: ["diamond", "diamond", "emerald"] }),
    ).toThrow();
  });

  it("rejects taking a color the bank doesn't have", () => {
    const s = setup(2);
    const starved: GameState = { ...s, tokens: { ...s.tokens, onyx: 0 } };
    expect(() =>
      applyAction(starved, { type: "TAKE_THREE_DIFFERENT", colors: ["diamond", "sapphire", "onyx"] }),
    ).toThrow();
  });

  it("takes two of the same color only when 4+ remain in the bank", () => {
    const s = setup(2); // 4 of each color for 2 players
    const next = applyAction(s, { type: "TAKE_TWO_SAME", color: "diamond" });
    expect(next.players[0].tokens.diamond).toBe(2);
    expect(next.tokens.diamond).toBe(2);

    // bank is now at 2, below the 4-token threshold required to take two more
    const p2sTurn: GameState = { ...next, currentPlayerIndex: 1 };
    expect(() => applyAction(p2sTurn, { type: "TAKE_TWO_SAME", color: "diamond" })).toThrow();
  });
});

describe("reserving cards", () => {
  it("reserves a visible card, refills the slot, and grants gold if available", () => {
    const s = setup(2);
    const targetCard = s.visibleCards[1][0]!;
    const next = applyAction(s, { type: "RESERVE_VISIBLE", tier: 1, slotIndex: 0 });
    expect(next.players[0].reservedCards).toHaveLength(1);
    expect(next.players[0].reservedCards[0].id).toBe(targetCard.id);
    expect(next.players[0].tokens.gold).toBe(1);
    expect(next.tokens.gold).toBe(4);
    expect(next.visibleCards[1][0]).not.toBeNull();
    expect(next.visibleCards[1][0]!.id).not.toBe(targetCard.id);
  });

  it("caps reserved cards at 3", () => {
    const s = setup(2);
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, reservedCards: [s.visibleCards[2][0]!, s.visibleCards[2][1]!, s.visibleCards[2][2]!] } : p)),
    };
    expect(() => applyAction(rigged, { type: "RESERVE_VISIBLE", tier: 1, slotIndex: 0 })).toThrow();
  });

  it("does not grant gold when the bank has none left", () => {
    const s = setup(2);
    const noGold: GameState = { ...s, tokens: { ...s.tokens, gold: 0 } };
    const next = applyAction(noGold, { type: "RESERVE_VISIBLE", tier: 1, slotIndex: 0 });
    expect(next.players[0].tokens.gold).toBe(0);
  });
});

describe("purchasing cards", () => {
  it("buys a visible card using tokens+bonuses and grants points/bonus", () => {
    const s = setup(2);
    const card = s.visibleCards[1][0]!;
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, tokens: { ...card.cost, gold: 0 } } : p)),
    };
    const next = applyAction(rigged, { type: "PURCHASE_VISIBLE", tier: 1, slotIndex: 0 });
    const buyer = next.players[0];
    expect(buyer.purchasedCards.some((c) => c.id === card.id)).toBe(true);
    expect(buyer.bonuses[card.bonus]).toBe(1);
    expect(buyer.points).toBe(card.points);
    // tokens spent went back to the bank
    for (const color of Object.keys(card.cost) as (keyof typeof card.cost)[]) {
      expect(buyer.tokens[color]).toBe(0);
    }
  });

  it("covers a shortfall with gold tokens", () => {
    const s = setup(2);
    const card = s.visibleCards[3].find((c) => c !== null)!;
    const shortColor = (Object.entries(card.cost).find(([, n]) => n > 0)![0]) as keyof typeof card.cost;
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) =>
        i === 0 ? { ...p, tokens: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 99 } } : p,
      ),
    };
    const slotIndex = s.visibleCards[3].findIndex((c) => c?.id === card.id);
    const next = applyAction(rigged, { type: "PURCHASE_VISIBLE", tier: 3, slotIndex });
    const buyer = next.players[0];
    expect(buyer.purchasedCards.some((c) => c.id === card.id)).toBe(true);
    const totalCost = Object.values(card.cost).reduce((a, b) => a + b, 0);
    expect(buyer.tokens.gold).toBe(99 - totalCost);
    void shortColor;
  });

  it("throws when the player cannot afford the card", () => {
    const s = setup(2);
    const slotIndex = s.visibleCards[3].findIndex((c) => c !== null);
    expect(() => applyAction(s, { type: "PURCHASE_VISIBLE", tier: 3, slotIndex })).toThrow();
  });

  it("purchases a reserved card and removes it from the reserve list", () => {
    const s = setup(2);
    const card = s.visibleCards[1][0]!;
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) =>
        i === 0 ? { ...p, reservedCards: [card], tokens: { ...card.cost, gold: 0 } } : p,
      ),
    };
    const next = applyAction(rigged, { type: "PURCHASE_RESERVED", cardId: card.id });
    expect(next.players[0].reservedCards).toHaveLength(0);
    expect(next.players[0].purchasedCards.some((c) => c.id === card.id)).toBe(true);
  });
});

describe("noble visits", () => {
  it("automatically awards a noble once bonus requirements are met", () => {
    const s = setup(2);
    const noble = s.nobles[0];
    const cardMeetingBonus = s.visibleCards[1][0]!;
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, bonuses: { ...noble.requirement } } : p)),
    };
    // trigger finalizeAfterAction via a cheap purchase (bonuses already satisfy the noble
    // before the purchase even resolves, since checkNobleVisit reads post-action bonuses)
    const withTokens: GameState = {
      ...rigged,
      players: rigged.players.map((p, i) => (i === 0 ? { ...p, tokens: { ...cardMeetingBonus.cost, gold: 0 } } : p)),
    };
    const next = applyAction(withTokens, { type: "PURCHASE_VISIBLE", tier: 1, slotIndex: 0 });
    expect(next.players[0].nobles.some((n) => n.id === noble.id)).toBe(true);
    expect(next.nobles.some((n) => n.id === noble.id)).toBe(false);
  });
});

describe("token discard flow", () => {
  it("forces a discard when a player exceeds 10 tokens and resumes after discarding", () => {
    const s = setup(4);
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, tokens: { ...p.tokens, diamond: 9 } } : p)),
    };
    const next = applyAction(rigged, { type: "TAKE_THREE_DIFFERENT", colors: ["ruby", "onyx", "sapphire"] });
    expect(totalTokenCount(next.players[0])).toBe(12);
    expect(next.phase).toBe("AWAITING_DISCARD");
    expect(next.currentPlayerIndex).toBe(0);

    const discarded = applyAction(next, { type: "DISCARD_TOKENS", tokens: { diamond: 2 } });
    expect(totalTokenCount(discarded.players[0])).toBe(10);
    expect(discarded.phase).toBe("AWAITING_ACTION");
    expect(discarded.currentPlayerIndex).toBe(1);
  });

  it("rejects a discard that does not land exactly on 10 tokens", () => {
    const s = setup(4);
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, tokens: { ...p.tokens, diamond: 9 } } : p)),
    };
    const next = applyAction(rigged, { type: "TAKE_THREE_DIFFERENT", colors: ["ruby", "onyx", "sapphire"] });
    expect(() => applyAction(next, { type: "DISCARD_TOKENS", tokens: { diamond: 1 } })).toThrow();
  });

  it("rejects discarding tokens the player doesn't have", () => {
    const s = setup(4);
    const rigged: GameState = {
      ...s,
      phase: "AWAITING_DISCARD" as const,
      players: s.players.map((p, i) => (i === 0 ? { ...p, tokens: { ...p.tokens, diamond: 11 } } : p)),
    };
    expect(() => applyAction(rigged, { type: "DISCARD_TOKENS", tokens: { onyx: 1 } })).toThrow();
  });
});

describe("win condition", () => {
  it("ends the game once every other player has had an equal number of final turns", () => {
    const s = setup(2);
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) => (i === 0 ? { ...p, points: 15 } : p)),
    };
    const afterP0 = applyAction(rigged, { type: "TAKE_THREE_DIFFERENT", colors: ["diamond", "sapphire", "emerald"] });
    expect(afterP0.lastRound).toBe(true);
    expect(afterP0.finalTurnPlayerIndex).toBe(0);
    expect(afterP0.currentPlayerIndex).toBe(1);
    expect(afterP0.phase).toBe("AWAITING_ACTION");

    const afterP1 = applyAction(afterP0, { type: "TAKE_THREE_DIFFERENT", colors: ["ruby", "onyx", "diamond"] });
    expect(afterP1.phase).toBe("GAME_OVER");
    expect(afterP1.winnerIds).toEqual(["p1"]);
  });

  it("breaks ties by fewest purchased development cards", () => {
    const s = setup(2);
    const dummyCard = s.visibleCards[1][0]!;
    const rigged: GameState = {
      ...s,
      players: s.players.map((p, i) =>
        i === 0
          ? { ...p, points: 15, purchasedCards: [dummyCard, dummyCard] }
          : { ...p, points: 15, purchasedCards: [dummyCard] },
      ),
    };
    const afterP0 = applyAction(rigged, { type: "TAKE_THREE_DIFFERENT", colors: ["diamond", "sapphire", "emerald"] });
    const afterP1 = applyAction(afterP0, { type: "TAKE_THREE_DIFFERENT", colors: ["ruby", "onyx", "diamond"] });
    expect(afterP1.phase).toBe("GAME_OVER");
    expect(afterP1.winnerIds).toEqual(["p2"]); // fewer purchased cards wins the tie
  });
});
