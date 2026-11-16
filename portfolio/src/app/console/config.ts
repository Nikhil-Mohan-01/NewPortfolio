export const CONSOLE = {
  // GLB car-local units, sampled at the centre of the existing upper radio display.
  center: [0.00015, 0.00913, 0.00581],
  right: [-0.995, 0, 0.1],
  up: [-0.035, 0.937, 0.347],
  halfWidth: 0.00106,
  halfHeight: 0.00051,
  pixels: [248, 132],
  // The waypoint passes above the wheel, then the camera approaches from the cabin side.
  approach: [0.16, 1.11, 0.24],
  screenEye: [0.033, 1.027, -0.213],
  enterSeconds: 0.56,
  exitSeconds: 0.46,
} as const;
