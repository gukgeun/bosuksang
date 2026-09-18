import type { Card, Tier, TokenColor } from "./types";
import { CARD_TIER_INDEX } from "./data";

// Number of reusable artwork frames the user supplies per tier. Update these
// if more/fewer frame images are added later.
export const TIER_FRAME_COUNT: Record<Tier, number> = { 1: 15, 2: 10, 3: 5 };

export const TIER_BORDER_COLOR: Record<Tier, string> = {
  1: "#16a34a", // green
  2: "#ca8a04", // yellow/gold
  3: "#2563eb", // blue
};

const ASSET_EXT = "webp";

export function cardFrameSrc(card: Card): string {
  const count = TIER_FRAME_COUNT[card.tier];
  const frameNumber = (CARD_TIER_INDEX[card.id] % count) + 1;
  return `/assets/cards/tier${card.tier}/${String(frameNumber).padStart(2, "0")}.${ASSET_EXT}`;
}

export function nobleImageSrc(nobleId: number): string {
  return `/assets/nobles/${String(nobleId + 1).padStart(2, "0")}.${ASSET_EXT}`;
}

export function tokenImageSrc(color: TokenColor): string {
  return `/assets/tokens/${color}.${ASSET_EXT}`;
}
