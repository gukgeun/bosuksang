import { nobleImageSrc } from "@/game/assets";
import { GEM_COLORS } from "@/game/types";
import type { Noble } from "@/game/types";
import { TokenIcon } from "./TokenIcon";

export function NobleView({ noble }: { noble: Noble }) {
  const requirementEntries = GEM_COLORS.map((color) => ({ color, amount: noble.requirement[color] })).filter(
    (entry) => entry.amount > 0,
  );

  return (
    <div
      style={{
        position: "relative",
        width: "var(--noble-w)",
        height: "var(--noble-w)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        touchAction: "manipulation",
      }}
      title={noble.name}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG artwork, unique per noble */}
      <img
        src={nobleImageSrc(noble.id)}
        alt={noble.name}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      <div
        style={{
          position: "absolute",
          top: 4,
          right: 6,
          fontFamily: "sans-serif",
          fontWeight: 700,
          fontSize: 16,
          color: "#78350f",
        }}
      >
        {noble.points}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 4,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {requirementEntries.map((entry) => (
          <div key={entry.color} style={{ position: "relative" }}>
            <TokenIcon color={entry.color} size={20} />
            <span
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "sans-serif",
                fontWeight: 700,
                fontSize: 11,
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
