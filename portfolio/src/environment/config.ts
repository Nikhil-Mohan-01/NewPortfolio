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
