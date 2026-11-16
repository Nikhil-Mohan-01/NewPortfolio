// Distances are metres along −Z from the starting driver position.
export const DRIVE_ROUTE = {
  length: 180,
  scrollPixels: 4500,
  smoothingSeconds: 0.11,
  guidanceSeconds: 0.54,
  stops: [26, 80, 138],
  panel: {
    x: 2.05,
    y: 1.65,
    ahead: 8.8,
    width: 2.75,
    height: 1.45,
    yawDegrees: -64,
    fadeSeconds: 0.24,
  },
} as const;
