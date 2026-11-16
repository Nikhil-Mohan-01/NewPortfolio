// Distances are metres along −Z from the starting driver position.
export const DRIVE_ROUTE = {
  length: 180,
  scrollPixels: 4500,
  smoothingSeconds: 0.11,
  guidanceSeconds: 0.54,
  stops: [26, 80, 138],
  panel: {
    x: 2.19,
    y: 1.75,
    ahead: 5.0,
    width: 3.35,
    height: 1.58,
    yawDegrees: -78,
    fadeSeconds: 0.24,
  },
} as const;
