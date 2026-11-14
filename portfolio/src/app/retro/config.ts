export interface RetroSettings {
  enabled: boolean;
  strength: number;
  renderScale: number;
  softness: number;
  saturation: number;
  contrast: number;
  grain: number;
  grainHz: number;
  vignette: number;
  chromaticOffset: number;
  scanlines: number;
}

export type RetroPreset = "clean" | "subtle" | "retro";

// Component values are full-strength targets. Strength interpolates from Clean.
export const RETRO: Readonly<RetroSettings> = {
  enabled: true,
  strength: 0.65,
  renderScale: 0.72,
  softness: 0.78,
  saturation: 0.87,
  contrast: 0.2,
  grain: 0.026,
  grainHz: 22,
  vignette: 0.2,
  chromaticOffset: 0.68,
  scanlines: 0,
};

export function presetStrength(preset: RetroPreset) {
  if (preset === "clean") return 0;
  return preset === "subtle" ? 0.34 : RETRO.strength;
}
