import { tokenImageSrc } from "@/game/assets";
import type { TokenColor } from "@/game/types";

export function TokenIcon({ color, size = 24 }: { color: TokenColor; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- static local SVG, no need for next/image optimization
  return <img src={tokenImageSrc(color)} alt={color} width={size} height={size} style={{ display: "block" }} />;
}
