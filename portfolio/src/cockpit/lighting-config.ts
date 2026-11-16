// Coordinates are metres in the car's original axes. Its bonnet points along local +Z.
export const CAR_LIGHTING = {
  headlights: {
    mount: [0.62, 0.675, 2.15],
    color: "#fff0d8",
    intensityCd: 1400,
    downDegrees: 4.3,
    halfAngleDegrees: 24,
    penumbra: 0.84,
    rangeMetres: 43,
    castShadow: false,
  },
  cabin: {
    mount: [0, 1.14, -0.14],
    target: [0, 0.72, 0.36],
    halfAngleDegrees: 62,
    color: "#ffe5c7",
    intensityCd: 0.72,
    rangeMetres: 1.06,
  },
} as const;
