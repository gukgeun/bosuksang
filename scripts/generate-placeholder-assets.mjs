// Generates placeholder art so the app is playable before real assets arrive.
// Real files should be dropped in with the exact same paths/names/extension (.png).
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, "..", "public", "assets");

const TIER_BORDER_COLOR = { 1: "#2563eb", 2: "#ca8a04", 3: "#16a34a" };
const TIER_FRAME_COUNT = { 1: 5, 2: 10, 3: 15 };

const TOKEN_COLORS = {
  diamond: "#f8fafc",
  sapphire: "#2563eb",
  emerald: "#16a34a",
  ruby: "#dc2626",
  onyx: "#1f2937",
  gold: "#eab308",
};

const TOKEN_LABEL = {
  diamond: "다이아",
  sapphire: "사파이어",
  emerald: "에메랄드",
  ruby: "루비",
  onyx: "오닉스",
  gold: "골드",
};

async function writeSvgAsPng(path, svg, width, height) {
  mkdirSync(dirname(path), { recursive: true });
  await sharp(Buffer.from(svg), { density: 144 })
    .resize(width, height)
    .png()
    .toFile(path);
}

function cardFrameSvg(tier, frameNumber) {
  const border = TIER_BORDER_COLOR[tier];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280" viewBox="0 0 200 280">
  <rect x="4" y="4" width="192" height="272" rx="12" fill="#f1f5f9" stroke="${border}" stroke-width="8"/>
  <text x="100" y="150" font-family="sans-serif" font-size="16" fill="#64748b" text-anchor="middle">TIER ${tier}</text>
  <text x="100" y="172" font-family="sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">frame ${String(frameNumber).padStart(2, "0")}</text>
</svg>`;
}

function nobleSvg(index) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
  <rect x="4" y="4" width="212" height="212" rx="16" fill="#fef3c7" stroke="#b45309" stroke-width="6"/>
  <text x="110" y="115" font-family="sans-serif" font-size="18" fill="#92400e" text-anchor="middle">귀족 ${String(index).padStart(2, "0")}</text>
</svg>`;
}

function tokenSvg(color) {
  const fill = TOKEN_COLORS[color];
  const textColor = color === "diamond" ? "#1f2937" : "#f8fafc";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="54" fill="${fill}" stroke="#0f172a" stroke-width="4"/>
  <text x="60" y="66" font-family="sans-serif" font-size="14" fill="${textColor}" text-anchor="middle">${TOKEN_LABEL[color]}</text>
</svg>`;
}

async function main() {
  for (const [tier, count] of Object.entries(TIER_FRAME_COUNT)) {
    for (let i = 1; i <= count; i++) {
      await writeSvgAsPng(
        join(PUBLIC_DIR, "cards", `tier${tier}`, `${String(i).padStart(2, "0")}.png`),
        cardFrameSvg(Number(tier), i),
        200,
        280,
      );
    }
  }

  for (let i = 1; i <= 10; i++) {
    await writeSvgAsPng(join(PUBLIC_DIR, "nobles", `${String(i).padStart(2, "0")}.png`), nobleSvg(i), 220, 220);
  }

  for (const color of Object.keys(TOKEN_COLORS)) {
    await writeSvgAsPng(join(PUBLIC_DIR, "tokens", `${color}.png`), tokenSvg(color), 120, 120);
  }

  console.log("Placeholder PNG assets generated under public/assets/");
}

main();
