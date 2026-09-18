"use client";

import { useState } from "react";
import { canAffordCard } from "@/game/engine";
import { GEM_COLORS, TOKEN_COLORS } from "@/game/types";
import type { Action, GameState, GemColor, Tier, TokenAmount } from "@/game/types";
import { CardView } from "./CardView";
import { NobleView } from "./NobleView";
import { PlayerModal } from "./PlayerModal";
import { PlayerPanel } from "./PlayerPanel";
import { TokenIcon } from "./TokenIcon";

const TIERS: Tier[] = [3, 2, 1];

function totalHeld(tokens: TokenAmount): number {
  return GEM_COLORS.reduce((sum, c) => sum + tokens[c], tokens.gold);
}

export function GameBoard({
  state,
  mySeatIndex,
  onAction,
}: {
  state: GameState;
  mySeatIndex: number;
  onAction: (action: Action) => Promise<void>;
}) {
  const [selectedColors, setSelectedColors] = useState<GemColor[]>([]);
  const [discardPlan, setDiscardPlan] = useState<Partial<TokenAmount>>({});
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [openPlayerSeat, setOpenPlayerSeat] = useState<number | null>(null);

  const me = state.players[mySeatIndex];
  const isMyTurn = state.currentPlayerIndex === mySeatIndex;
  const canAct = isMyTurn && state.phase === "AWAITING_ACTION" && !submitting;

  async function dispatch(action: Action) {
    setSubmitting(true);
    setLocalError(null);
    try {
      await onAction(action);
      setSelectedColors([]);
      setDiscardPlan({});
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "행동을 처리할 수 없습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleColor(color: GemColor) {
    if (!canAct) return;
    setSelectedColors((prev) => {
      if (prev.includes(color)) return prev.filter((c) => c !== color);
      if (prev.length >= 3) return prev;
      return [...prev, color];
    });
  }

  const overflow = me ? totalHeld(me.tokens) - 10 : 0;
  const discardTotal = GEM_COLORS.reduce((sum, c) => sum + (discardPlan[c] ?? 0), discardPlan.gold ?? 0);
  const winnerNames = state.players
    .filter((p) => state.winnerIds?.includes(p.id))
    .map((p) => p.name)
    .join(", ");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, gap: 4 }}>
      <div style={{ flexShrink: 0, fontWeight: 700, fontSize: 13, textAlign: "center" }}>
        {isMyTurn ? "당신의 차례입니다!" : `${state.players[state.currentPlayerIndex].name}님의 차례`}
      </div>

      {localError && <p style={{ color: "crimson", flexShrink: 0, fontSize: 13, textAlign: "center" }}>{localError}</p>}

      <div
        className="playmat"
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "1fr clamp(90px, 10vw, 130px)",
          gridTemplateRows: "auto 1fr auto",
          gridTemplateAreas: '"tokens nobles" "cards nobles" "players players"',
          gap: 6,
        }}
      >
        <div style={{ gridArea: "tokens", display: "flex", flexDirection: "column", gap: 4, minHeight: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#e8c874" }}>토큰</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {TOKEN_COLORS.map((color) => (
              <div
                key={color}
                className="tap-target"
                onClick={() => color !== "gold" && toggleColor(color)}
                style={{
                  position: "relative",
                  cursor: color !== "gold" && canAct ? "pointer" : "default",
                  outline: selectedColors.includes(color as GemColor) ? "3px solid #ca8a04" : "none",
                }}
              >
                <TokenIcon color={color} size={34} />
                <span
                  style={{
                    position: "absolute",
                    bottom: -3,
                    right: -3,
                    background: "#0f172a",
                    color: "#fff",
                    borderRadius: 8,
                    fontSize: 10,
                    padding: "0 4px",
                  }}
                >
                  {state.tokens[color]}
                </span>
              </div>
            ))}
            <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
              <button
                className="card-action-btn"
                disabled={!canAct || selectedColors.length !== 3}
                onClick={() =>
                  dispatch({ type: "TAKE_THREE_DIFFERENT", colors: selectedColors as [GemColor, GemColor, GemColor] })
                }
              >
                다른 색 3개
              </button>
              <button
                className="card-action-btn"
                disabled={!canAct || selectedColors.length !== 1 || state.tokens[selectedColors[0]] < 4}
                onClick={() => dispatch({ type: "TAKE_TWO_SAME", color: selectedColors[0] })}
              >
                같은 색 2개
              </button>
            </div>
          </div>
        </div>

        <div style={{ gridArea: "cards", display: "flex", flexDirection: "column", gap: 4, minHeight: 0 }}>
          {TIERS.map((tier) => (
            <div key={tier} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#e8c874" }}>
                TIER {tier} · 덱 {state.decks[tier].length}장
              </span>
              <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 8, alignItems: "stretch", justifyContent: "center" }}>
                {state.visibleCards[tier].map((card, slotIndex) =>
                  card ? (
                    <div
                      key={card.id}
                      style={{ height: "100%", display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}
                    >
                      <div style={{ flex: 1, minHeight: 0 }}>
                        <CardView card={card} variant="board" />
                      </div>
                      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                        <button
                          className="card-action-btn"
                          disabled={!canAct || !me || !canAffordCard(me, card)}
                          onClick={() => dispatch({ type: "PURCHASE_VISIBLE", tier, slotIndex })}
                        >
                          구매
                        </button>
                        <button
                          className="card-action-btn"
                          disabled={!canAct || (me?.reservedCards.length ?? 0) >= 3}
                          onClick={() => dispatch({ type: "RESERVE_VISIBLE", tier, slotIndex })}
                        >
                          예약
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={slotIndex} style={{ height: "100%", aspectRatio: "5 / 7" }} />
                  ),
                )}
                <button
                  className="card-action-btn"
                  disabled={!canAct || state.decks[tier].length === 0 || (me?.reservedCards.length ?? 0) >= 3}
                  onClick={() => dispatch({ type: "RESERVE_FROM_DECK", tier })}
                  style={{ flexShrink: 0, alignSelf: "center" }}
                >
                  덱에서
                  <br />
                  예약
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            gridArea: "nobles",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minHeight: 0,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "#e8c874" }}>귀족카드</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, overflowY: "auto", alignItems: "center" }}>
            {state.nobles.map((noble) => (
              <NobleView key={noble.id} noble={noble} />
            ))}
          </div>
        </div>

        <div
          style={{
            gridArea: "players",
            display: "grid",
            gridTemplateColumns: `repeat(${state.players.length}, 1fr)`,
            gap: 8,
            minHeight: 0,
          }}
        >
          {state.players.map((player, i) => (
            <PlayerPanel
              key={player.id}
              player={player}
              isMe={i === mySeatIndex}
              isCurrentTurn={i === state.currentPlayerIndex}
              onOpen={() => setOpenPlayerSeat(i)}
            />
          ))}
        </div>
      </div>

      {openPlayerSeat !== null && (
        <PlayerModal
          player={state.players[openPlayerSeat]}
          isMe={openPlayerSeat === mySeatIndex}
          isMyTurn={isMyTurn && openPlayerSeat === mySeatIndex}
          onClose={() => setOpenPlayerSeat(null)}
          onAction={(action) => dispatch(action)}
        />
      )}

      {state.phase === "AWAITING_DISCARD" && isMyTurn && me && (
        <div className="modal-backdrop">
          <div className="modal-panel">
            <h3 style={{ margin: "0 0 8px" }}>토큰을 {overflow}개 버려야 합니다</h3>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {TOKEN_COLORS.map((color) => (
                <div key={color} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <TokenIcon color={color} size={40} />
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <button
                      className="stepper-btn"
                      onClick={() =>
                        setDiscardPlan((prev) => ({ ...prev, [color]: Math.max(0, (prev[color] ?? 0) - 1) }))
                      }
                    >
                      -
                    </button>
                    <span style={{ minWidth: 16, textAlign: "center" }}>{discardPlan[color] ?? 0}</span>
                    <button
                      className="stepper-btn"
                      onClick={() =>
                        setDiscardPlan((prev) => ({
                          ...prev,
                          [color]: Math.min(me.tokens[color], (prev[color] ?? 0) + 1),
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              disabled={submitting || discardTotal !== overflow}
              onClick={() => dispatch({ type: "DISCARD_TOKENS", tokens: discardPlan })}
              style={{ marginTop: 10 }}
            >
              버리기 확정 ({discardTotal}/{overflow})
            </button>
          </div>
        </div>
      )}

      {state.phase === "GAME_OVER" && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ textAlign: "center" }}>
            <h2>게임 종료!</h2>
            <p>승자: {winnerNames}</p>
          </div>
        </div>
      )}
    </div>
  );
}
