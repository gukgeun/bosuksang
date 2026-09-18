import { cardFrameSrc } from "@/game/assets";
import { GEM_COLORS } from "@/game/types";
import type { Card } from "@/game/types";
import { TokenIcon } from "./TokenIcon";

export function CardView({ card, variant = "modal" }: { card: Card; variant?: "board" | "modal" }) {
  const costEntries = GEM_COLORS.map((color) => ({ color, amount: card.cost[color] })).filter(
    (entry) => entry.amount > 0,
  );

  const isBoard = variant === "board";
  const bonusIconSize = isBoard ? 22 : 22;
  const costIconSize = isBoard ? 20 : 20;
  const pointsFontSize = isBoard ? 20 : 20;
  const costFontSize = isBoard ? 11 : 11;

  return (
    <div
      style={
        isBoard
          ? {
              position: "relative",
              width: "100%",
              height: "auto",
              aspectRatio: "5 / 7",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              touchAction: "manipulation",
            }
          : {
              position: "relative",
              width: "var(--card-w)",
              height: "var(--card-h)",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              touchAction: "manipulation",
            }
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG frame, cycled artwork */}
      <img
        src={cardFrameSrc(card)}
        alt={`tier ${card.tier} card`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* bonus gem icon, top-left */}
      <div style={{ position: "absolute", top: "4%", left: "4%" }}>
        <TokenIcon color={card.bonus} size={bonusIconSize} />
      </div>

      {/* points, top-right */}
      {card.points > 0 && (
        <div
          style={{
            position: "absolute",
            top: "2%",
            right: "5%",
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: pointsFontSize,
            color: "#1e293b",
            textShadow: "0 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          {card.points}
        </div>
      )}

      {/* cost pips, bottom-left column */}
      <div
        style={{
          position: "absolute",
          bottom: "4%",
          left: "4%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {costEntries.map((entry) => (
          <div key={entry.color} style={{ position: "relative" }}>
            <TokenIcon color={entry.color} size={costIconSize} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "sans-serif",
                fontWeight: 700,
                fontSize: costFontSize,
                color: entry.color === "diamond" ? "#1e293b" : "#f8fafc",
              }}
            >
              {entry.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
