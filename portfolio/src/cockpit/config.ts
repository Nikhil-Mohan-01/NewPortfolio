// Measured from the supplied GLB. Its Y axis is already up, and the bonnet points along +Z.
// The 100× scale produces a 4.60 m body. The front tire minima define the road contact plane.
export const R34 = {
  modelPath: "models/r34/r34.glb",
  normalization: {
    scale: 100,
    yaw: Math.PI,
    position: [0, 0.001777, 0.055],
  },
  camera: {
    // The driver sits to the right (+X). This eye is ahead of the headrest and above the hub.
    eye: [0.35, 1.06, 0.39],
    yaw: 0.09,
    pitch: -0.065,
    verticalFov: 56,
    near: 0.025,
    far: 160,
  },
} as const;
