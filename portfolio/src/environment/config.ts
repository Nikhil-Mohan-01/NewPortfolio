export const STREET = {
  laneWidth: 3.6,
  pavementWidth: 0.76,
  curbHeight: 0.13,
  chunkLength: 32,
  chunkCount: 8,
  recycleBehind: 60,
  maxDelta: 0.05,
} as const;

export const CAMERA = {
  x: 0,
  eyeHeight: 1.15,
  verticalFov: 60,
  near: 0.045,
  far: 160,
} as const;

export const DEFAULT_FOG = { color: "#111426", near: 25, far: 138 };

export type StreetQuality = "standard" | "low";

export const DEFAULT_PALETTE = {
  asphalt: "#11151d",
  concrete: "#333641",
  plaster: "#3c4353",
  tile: "#59504e",
  pink: "#ff4fa0",
  violet: "#9868ff",
  blue: "#4d8eff",
  cyan: "#69dceb",
  warm: "#ffd39a",
};

export type StreetPalette = typeof DEFAULT_PALETTE;
