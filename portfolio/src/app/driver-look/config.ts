export const DRIVER_LOOK = {
  yawLimitDegrees: 60,
  pitchLimitDegrees: 45,
  sensitivityDegreesPerPixel: 0.16,
  dragThresholdPixels: 5,
  smoothingSeconds: 0.075,
  resetSeconds: 0.3,
  keyboardStepDegrees: 3,
  console: {
    // Source units under the normalized R34 group, sampled on the blank lower radio panel.
    position: [-0.000368, 0.006338, 0.004753],
    outward: [-0.09, 0.4, -0.91],
    horizontal: [-0.996, 0, 0.09],
    standoff: 0.00008,
    halfWidth: 0.00053,
    hitSizePixels: 44,
  },
} as const;
