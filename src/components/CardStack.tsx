import type { Card } from "@/game/types";
import { CardView } from "./CardView";

const STRIP_HEIGHT = 16;

/**
 * Renders a fanned stack for cards that share a bonus color: older cards only
 * show a sliver of their top edge, the most recently acquired card is fully
 * visible in front.
 */
export function CardStack({ cards }: { cards: Card[] }) {
  if (cards.length === 0) return null;

  const hiddenCards = cards.slice(0, -1); // oldest -> second-newest
  const topCard = cards[cards.length - 1]; // most recently acquired

  return (
    <div
      style={{
        position: "relative",
        width: "var(--card-w)",
        height: `calc(var(--card-h) + ${hiddenCards.length * STRIP_HEIGHT}px)`,
      }}
    >
      {hiddenCards.map((card, i) => (
        <div
          key={card.id}
          style={{
            position: "absolute",
            top: i * STRIP_HEIGHT,
            left: 0,
            width: "100%",
            height: STRIP_HEIGHT + 8,
            overflow: "hidden",
            borderRadius: "8px 8px 0 0",
            boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
          }}
        >
          <CardView card={card} />
        </div>
      ))}
      <div style={{ position: "absolute", top: hiddenCards.length * STRIP_HEIGHT, left: 0 }}>
        <CardView card={topCard} />
      </div>
    </div>
  );
}
