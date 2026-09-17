import { canAffordCard } from "@/game/engine";
import { GEM_COLORS } from "@/game/types";
import type { Action, Player } from "@/game/types";
import { CardStack } from "./CardStack";
import { CardView } from "./CardView";
import { NobleView } from "./NobleView";
import { TokenIcon } from "./TokenIcon";

export function PlayerModal({
  player,
  isMe,
  isMyTurn,
  onClose,
  onAction,
}: {
  player: Player;
  isMe: boolean;
  isMyTurn: boolean;
  onClose: () => void;
  onAction: (action: Action) => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h2 style={{ margin: 0 }}>
            {player.name}
            {isMe ? " (나)" : ""} · {player.points}점
          </h2>
          <button onClick={onClose}>닫기</button>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          {GEM_COLORS.map((color) => (
            <div key={color} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <TokenIcon color={color} size={24} />
              <span style={{ fontSize: 13 }}>
                보너스 {player.bonuses[color]} · 토큰 {player.tokens[color]}
              </span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <TokenIcon color="gold" size={24} />
            <span style={{ fontSize: 13 }}>골드 {player.tokens.gold}</span>
          </div>
        </div>

        {player.nobles.length > 0 && (
          <>
            <h3 style={{ margin: "16px 0 8px" }}>보유 귀족</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {player.nobles.map((noble) => (
                <NobleView key={noble.id} noble={noble} />
              ))}
            </div>
          </>
        )}

        <h3 style={{ margin: "16px 0 8px" }}>보유 카드 ({player.purchasedCards.length})</h3>
        {player.purchasedCards.length === 0 ? (
          <p style={{ fontSize: 13, color: "#64748b" }}>아직 구매한 카드가 없습니다.</p>
        ) : (
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-end" }}>
            {GEM_COLORS.map((color) => {
              const cardsOfColor = player.purchasedCards.filter((card) => card.bonus === color);
              if (cardsOfColor.length === 0) return null;
              return (
                <div key={color} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <TokenIcon color={color} size={18} />
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{cardsOfColor.length}장</span>
                  </div>
                  <CardStack cards={cardsOfColor} />
                </div>
              );
            })}
          </div>
        )}

        {isMe && (
          <>
            <h3 style={{ margin: "16px 0 8px" }}>내 예약 카드 ({player.reservedCards.length}/3)</h3>
            {player.reservedCards.length === 0 ? (
              <p style={{ fontSize: 13, color: "#64748b" }}>예약한 카드가 없습니다.</p>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {player.reservedCards.map((card) => (
                  <div key={card.id} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                    <CardView card={card} />
                    <button
                      className="card-action-btn"
                      disabled={!isMyTurn || !canAffordCard(player, card)}
                      onClick={() => onAction({ type: "PURCHASE_RESERVED", cardId: card.id })}
                    >
                      구매
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
