import { GEM_COLORS } from "@/game/types";
import type { Player } from "@/game/types";
import { TokenIcon } from "./TokenIcon";

export function PlayerPanel({
  player,
  isMe,
  isCurrentTurn,
  onOpen,
}: {
  player: Player;
  isMe: boolean;
  isCurrentTurn: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      className="player-box"
      onClick={onOpen}
      style={{
        border: isCurrentTurn ? "2px solid #ca8a04" : "1px solid #cbd5e1",
        background: isCurrentTurn ? "#fffbeb" : "#f8fafc",
        minHeight: 0,
        height: "100%",
      }}
    >
      <div style={{ fontWeight: 700, display: "flex", justifyContent: "space-between", width: "100%" }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {player.name}
          {isMe ? " (나)" : ""}
        </span>
        <span>{player.points}점</span>
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {GEM_COLORS.map((color) => (
          <div key={color} style={{ position: "relative", opacity: player.bonuses[color] > 0 ? 1 : 0.25 }}>
            <TokenIcon color={color} size={18} />
            <span
              style={{
                position: "absolute",
                bottom: -3,
                right: -3,
                background: "#0f172a",
                color: "#fff",
                borderRadius: 8,
                fontSize: 9,
                padding: "0 3px",
              }}
            >
              {player.bonuses[color]}
            </span>
          </div>
        ))}
        <div style={{ position: "relative" }}>
          <TokenIcon color="gold" size={18} />
          <span
            style={{
              position: "absolute",
              bottom: -3,
              right: -3,
              background: "#0f172a",
              color: "#fff",
              borderRadius: 8,
              fontSize: 9,
              padding: "0 3px",
            }}
          >
            {player.tokens.gold}
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "#475569" }}>
        예약 {player.reservedCards.length}/3 · 귀족 {player.nobles.length} · 카드 {player.purchasedCards.length}
      </div>
    </button>
  );
}
