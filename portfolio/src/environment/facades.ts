import * as THREE from "three";
import { ChunkBatches } from "./batches";
import { STREET, type StreetPalette, type StreetQuality } from "./config";
import type { FacadeMaterials } from "./materials";
import { signUv } from "./textures";

type Archetype =
  "restaurant" | "electronics" | "apartments" | "closed" | "tile";
export type Side = -1 | 1;
type Random = () => number;

const patterns: Archetype[][] = [
  ["restaurant", "apartments", "electronics", "tile", "closed"],
  ["closed", "tile", "apartments", "restaurant", "electronics"],
  ["electronics", "apartments", "closed", "restaurant", "tile"],
  ["apartments", "restaurant", "tile", "closed", "electronics", "closed"],
  ["tile", "electronics", "closed", "apartments", "restaurant"],
];

export interface Fixture {
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  power: number;
}

interface Building {
  kind: Archetype;
  facade: number;
  side: Side;
  center: number;
  width: number;
  sign: number;
  color: string;
}

function facade(
  building: Building,
  batch: ChunkBatches,
  materials: FacadeMaterials,
  palette: StreetPalette,
  quality: StreetQuality,
  random: Random,
): Fixture | undefined {
  const { kind, facade, width, center, side, sign } = building;
  const color = new THREE.Color(building.color);
  const turn = (-side * Math.PI) / 2;
  const floor = STREET.curbHeight - 0.015;
  const shopHeight = 2.85;
  const upper =
    kind === "apartments"
      ? 3 + Math.floor(random() * 4)
      : 2 + Math.floor(random() * 3);
  const story = 2.48 + random() * 0.22;
  const height = shopHeight + story * upper;
  const depth = 5.2 + random() * 5.3;
  const wallColor = new THREE.Color(
    kind === "tile"
      ? palette.tile
      : kind === "apartments" || kind === "closed"
        ? palette.concrete
        : palette.plaster,
  ).multiplyScalar(0.82 + random() * 0.36);
  const masonry = kind === "tile" ? materials.tile : materials.wall;
  const metal = "#2b2d38";
  const shadow = "#141623";
  const mullion = kind === "tile" ? "#514645" : "#414655";

  function transform(
    u: number,
    y: number,
    projection: number,
    w: number,
    h: number,
    d = 0,
  ) {
    return {
      x: side * (facade - projection),
      y: floor + y,
      z: center + side * u,
      width: w,
      height: h,
      depth: d,
      turn,
    };
  }

  function box(
    material: THREE.Material,
    tint: THREE.ColorRepresentation,
    u: number,
    y: number,
    projection: number,
    w: number,
    h: number,
    d: number,
  ) {
    batch.box(material, tint, transform(u, y, projection, w, h, d));
  }

  // The smaller ground-floor volume leaves room for inset glazing and doors.
  box(
    masonry,
    wallColor,
    0,
    (shopHeight + height) / 2,
    -depth / 2,
    width,
    height - shopHeight,
    depth,
  );
  box(
    masonry,
    wallColor,
    0,
    shopHeight / 2,
    -(depth + 0.38) / 2,
    width,
    shopHeight,
    depth - 0.38,
  );
  box(materials.trim, metal, 0, shopHeight, 0.04, width, 0.15, 0.16);
  box(materials.trim, wallColor, 0, height + 0.1, 0, width, 0.34, 0.23);
  box(materials.trim, metal, 0, height + 0.29, 0, width, 0.055, 0.25);
  for (const edge of [-1, 1]) {
    box(
      materials.wall,
      wallColor,
      edge * (width / 2 - 0.12),
      shopHeight / 2,
      -0.14,
      0.24,
      shopHeight,
      0.48,
    );
    box(
      materials.trim,
      metal,
      edge * (width / 2 - 0.19),
      height - 0.28,
      -depth / 2,
      0.08,
      0.09,
      depth,
    );
  }
  if (quality === "standard" && (kind === "tile" || kind === "closed")) {
    box(
      materials.trim,
      "#393942",
      width / 2 - 0.24,
      height * 0.49,
      0.11,
      0.068,
      height * 0.98,
      0.07,
    );
    for (let collar = 1; collar <= upper; collar++) {
      box(
        materials.trim,
        "#53515a",
        width / 2 - 0.24,
        (height * collar) / (upper + 1),
        0.11,
        0.095,
        0.045,
        0.09,
      );
    }
  }
  if (kind === "apartments" && depth > 8) {
    box(
      materials.wall,
      wallColor,
      0,
      height + 1.15,
      -depth * 0.57,
      width * 0.56,
      2.2,
      depth * 0.47,
    );
  }

  const bays = width < 5.25 ? 2 : 3;
  const firstLitBay = Math.floor(random() * bays);
  const firstLitFloor = Math.floor(random() * upper);
  const litCount = Math.round(upper * bays * (kind === "closed" ? 0.18 : 0.28));
  for (let level = 0; level < upper; level++) {
    const y = shopHeight + (level + 0.53) * story;
    for (let bay = 0; bay < bays; bay++) {
      const u =
        ((bay + 0.5) / bays - 0.5) * width +
        (kind === "tile" && level % 2 === 1 ? 0.16 : 0);
      const w = Math.min((width / bays) * 0.66, 1.36);
      const h = kind === "apartments" ? 1.46 : 1.05;
      const patternIndex =
        ((level - firstLitFloor + upper) % upper) * bays +
        ((bay - firstLitBay + bays) % bays);
      const lit =
        kind === "closed" ? patternIndex === 0 : patternIndex < litCount;
      const windowColor = patternIndex % 3 === 0 ? "#9daac2" : palette.warm;
      box(materials.trim, mullion, u, y, 0.033, w + 0.13, h + 0.13, 0.09);
      box(
        lit ? materials.interior : materials.glass,
        lit
          ? new THREE.Color(windowColor).multiplyScalar(0.42 + random() * 0.21)
          : "#273044",
        u,
        y,
        0.08,
        w,
        h,
        0.025,
      );
      box(materials.trim, metal, u, y, 0.099, 0.042, h, 0.028);
      box(
        materials.trim,
        mullion,
        u,
        y - h / 2 - 0.035,
        0.1,
        w + 0.17,
        0.07,
        0.18,
      );
      if (
        quality === "standard" &&
        kind === "apartments" &&
        bay !== bays - 1 &&
        level % 3 !== 2
      ) {
        box(
          materials.wall,
          wallColor,
          u,
          y - h / 2 - 0.12,
          0.18,
          w + 0.34,
          0.16,
          0.46,
        );
        box(materials.trim, metal, u, y - 0.27, 0.38, w + 0.28, 0.07, 0.044);
        for (const post of [-0.43, 0, 0.43]) {
          box(
            materials.trim,
            mullion,
            u + w * post,
            y - 0.54,
            0.38,
            0.03,
            0.56,
            0.04,
          );
        }
      }
      if (
        quality === "standard" &&
        bay === bays - 1 &&
        (level + bays) % 3 === 0
      ) {
        box(
          materials.trim,
          "#525359",
          u + 0.22,
          y - 0.85,
          0.14,
          0.5,
          0.31,
          0.3,
        );
        box(
          materials.trim,
          "#2e323b",
          u + 0.22,
          y - 0.85,
          0.295,
          0.38,
          0.21,
          0.015,
        );
      }
    }
    if (kind === "tile" || kind === "electronics") {
      box(
        materials.wall,
        wallColor,
        0,
        y - story * 0.47,
        0.035,
        width,
        0.055,
        0.1,
      );
    }
  }

  if (kind === "closed" || kind === "apartments") {
    const shutter = kind === "closed" ? width * 0.74 : width * 0.51;
    const u = kind === "closed" ? 0 : -width * 0.14;
    box(materials.trim, "#323743", u, 1.12, -0.18, shutter, 2.23, 0.14);
    const slats = quality === "standard" ? 19 : 10;
    for (let index = 1; index <= slats; index++) {
      box(
        materials.trim,
        "#222632",
        u,
        index * (2.18 / slats),
        -0.098,
        shutter,
        0.025,
        0.03,
      );
    }
    box(
      materials.trim,
      kind === "closed" ? "#4f3e44" : "#3e424c",
      u,
      2.5,
      0.03,
      shutter + 0.13,
      0.33,
      0.12,
    );
    if (kind === "apartments") {
      box(
        materials.trim,
        mullion,
        width * 0.3,
        1.13,
        -0.16,
        width * 0.23,
        2.26,
        0.1,
      );
      box(
        materials.glass,
        "#273449",
        width * 0.3,
        1.41,
        -0.09,
        width * 0.17,
        1.38,
        0.03,
      );
      box(materials.lit, "#83694e", width * 0.3, 2.49, 0.04, 0.21, 0.08, 0.1);
    }
    return;
  }

  const entrySide = random() < 0.5 ? -1 : 1;
  const aperture = width - 0.65;
  const door = entrySide * (aperture / 2 - 0.51);
  const displayWidth = aperture - 1.15;
  const display = -entrySide * 0.55;
  const interior = new THREE.Color(
    kind === "electronics" ? building.color : palette.warm,
  ).lerp(new THREE.Color("#afb5b0"), kind === "electronics" ? 0.43 : 0.22);
  box(materials.trim, mullion, door, 1.12, -0.27, 0.98, 2.24, 0.13);
  box(
    materials.interior,
    interior.clone().multiplyScalar(0.42),
    door,
    1.33,
    -0.195,
    0.79,
    1.57,
    0.035,
  );
  box(materials.trim, metal, door, 1.46, -0.165, 0.82, 0.045, 0.03);
  box(
    materials.trim,
    "#776763",
    door - entrySide * 0.31,
    1.05,
    -0.145,
    0.034,
    0.18,
    0.025,
  );
  box(materials.trim, "#4e4a4e", door, 0.035, -0.01, 1.07, 0.069, 0.45);
  box(materials.trim, shadow, display, 1.34, -0.16, displayWidth, 1.74, 0.2);
  box(
    materials.interior,
    interior.clone().multiplyScalar(kind === "electronics" ? 0.45 : 0.57),
    display,
    1.34,
    -0.052,
    displayWidth - 0.16,
    1.49,
    0.045,
  );
  box(materials.trim, mullion, display, 0.77, -0.008, displayWidth, 0.14, 0.12);
  for (const fraction of [-0.29, 0.17]) {
    box(
      materials.trim,
      metal,
      display + displayWidth * fraction,
      1.34,
      -0.014,
      0.05,
      1.55,
      0.06,
    );
  }

  if (kind === "restaurant") {
    box(
      materials.trim,
      "#46353e",
      display,
      2.37,
      0.22,
      displayWidth + 0.32,
      0.18,
      0.68,
    );
    box(
      materials.trim,
      "#63474c",
      display,
      2.29,
      0.54,
      displayWidth + 0.32,
      0.14,
      0.055,
    );
    box(
      materials.lit,
      interior.clone().multiplyScalar(0.8),
      display,
      2.24,
      0.37,
      displayWidth * 0.72,
      0.035,
      0.045,
    );
    for (const fraction of [-0.35, -0.1, 0.15, 0.38]) {
      box(
        materials.trim,
        "#715453",
        display + displayWidth * fraction,
        1.86,
        -0.022,
        displayWidth * 0.21,
        0.43,
        0.024,
      );
    }
  } else if (kind === "electronics") {
    for (const fraction of [-0.32, -0.03, 0.26]) {
      box(
        materials.trim,
        "#25354e",
        display + fraction * displayWidth,
        1.17,
        0.012,
        displayWidth * 0.22,
        0.52,
        0.05,
      );
      box(
        materials.lit,
        color.clone().lerp(new THREE.Color(palette.cyan), 0.45),
        display + fraction * displayWidth,
        1.21,
        0.043,
        displayWidth * 0.17,
        0.34,
        0.018,
      );
    }
  } else if (quality === "standard") {
    for (let row = 1; row <= 6; row++) {
      for (const edge of [-1, 1]) {
        box(
          materials.trim,
          "#393138",
          edge * (width / 2 - 0.12),
          row * 0.38,
          0.101,
          0.24,
          0.017,
          0.022,
        );
      }
    }
  }

  if (kind !== "electronics") {
    box(
      materials.trim,
      "#54433e",
      display,
      0.95,
      -0.02,
      displayWidth * 0.94,
      0.11,
      0.1,
    );
    box(
      materials.trim,
      "#604c48",
      display - displayWidth * 0.18,
      1.05,
      -0.024,
      0.25,
      0.22,
      0.035,
    );
    box(
      materials.trim,
      "#453a3a",
      display + displayWidth * 0.19,
      1.06,
      -0.023,
      0.3,
      0.23,
      0.04,
    );
  }

  const fasciaWidth = Math.min(width - 0.54, kind === "tile" ? 2.45 : 3.75);
  const fasciaHeight = kind === "tile" ? 0.39 : 0.48;
  const fasciaY = kind === "restaurant" ? 2.72 : 2.56;
  box(
    materials.trim,
    metal,
    0,
    fasciaY,
    0.048,
    fasciaWidth + 0.1,
    fasciaHeight + 0.07,
    0.14,
  );
  batch.panel(
    materials.signs,
    color.clone().multiplyScalar(2.05),
    transform(0, fasciaY, 0.12, fasciaWidth, fasciaHeight),
    signUv(sign, false),
  );
  box(
    materials.lit,
    color.clone().multiplyScalar(1.4),
    0,
    fasciaY - fasciaHeight * 0.51,
    0.113,
    fasciaWidth * 0.91,
    0.022,
    0.025,
  );

  const blade = entrySide * (width / 2 - 0.49);
  const bladeY = 3.65 + random() * 0.75;
  if (kind !== "tile" || random() > 0.6) {
    const bladeHeight = kind === "electronics" ? 1.42 : 1.75;
    box(materials.trim, metal, blade, bladeY, 0.29, 0.14, bladeHeight, 0.59);
    box(
      materials.trim,
      "#42434d",
      blade,
      bladeY - bladeHeight * 0.37,
      0.12,
      0.1,
      0.055,
      0.38,
    );
    for (const face of [-1, 1]) {
      const panel = transform(
        blade + face * 0.073,
        bladeY,
        0.32,
        0.5,
        bladeHeight - 0.12,
      );
      panel.turn = face * side > 0 ? 0 : Math.PI;
      batch.panel(
        materials.signs,
        color.clone().multiplyScalar(2.2),
        panel,
        signUv(sign, true),
      );
    }
    box(
      materials.lit,
      color.clone().multiplyScalar(1.75),
      blade,
      bladeY,
      0.594,
      0.082,
      bladeHeight - 0.14,
      0.018,
    );
  }

  // Procedural illumination follows the source through the loop. The ground patch is an artistic
  // approximation of broken light on damp asphalt, without a mirrored image of the fixture.
  batch.panel(
    materials.spill,
    color.clone().multiplyScalar(0.062),
    transform(blade, bladeY - 0.73, 0.125, 2.65, 3.15),
  );
  const roadPatch = transform(
    display * 0.7,
    -floor + 0.007,
    facade - 1.15,
    5.9,
    1.83,
  );
  batch.panel(
    materials.spill,
    color.clone().multiplyScalar(0.115),
    roadPatch,
    undefined,
    true,
  );
  const pavementPatch = transform(
    display * 0.7,
    0.008,
    facade - 2.17,
    4.0,
    0.71,
  );
  batch.panel(
    materials.spill,
    interior.clone().multiplyScalar(0.16),
    pavementPatch,
    undefined,
    true,
  );
  const fixture = transform(display * 0.75, 1.97, 0.64, 0, 0);
  return {
    x: fixture.x,
    y: fixture.y,
    z: fixture.z,
    color,
    power: kind === "tile" ? 7 : 12,
  };
}

export function buildFrontages(
  batch: ChunkBatches,
  materials: FacadeMaterials,
  palette: StreetPalette,
  quality: StreetQuality,
  index: number,
  random: Random,
) {
  const fixtures: Fixture[] = [];
  for (const side of [-1, 1] as const) {
    const sideOffset = side === -1 ? 0 : 2;
    const pattern = patterns[(index + sideOffset) % patterns.length];
    const gap = 0.28;
    const frontage =
      (STREET.chunkLength - gap * pattern.length) / pattern.length;
    const seams = Array.from(
      { length: pattern.length - 1 },
      () => (random() - 0.5) * 0.96,
    );
    let start = 0;
    pattern.forEach((kind, bay) => {
      const end = (bay + 1) * (frontage + gap) + (seams[bay] ?? 0);
      const offset = (index + sideOffset + bay * 3) % 8;
      const accents = [
        palette.pink,
        palette.blue,
        palette.violet,
        palette.pink,
        palette.blue,
        palette.cyan,
        palette.violet,
        palette.warm,
      ];
      const color =
        kind === "electronics"
          ? offset % 2 === 0
            ? palette.blue
            : palette.violet
          : accents[offset];
      const sign =
        (kind === "electronics" ? 8 : kind === "tile" ? 16 : 0) +
        ((index + (side === 1 ? 4 : 0)) % 8);
      const light = facade(
        {
          kind,
          side,
          color,
          sign,
          width: end - start - gap,
          center: -(start + end) / 2,
          facade: 2.57 + random() * 0.3,
        },
        batch,
        materials,
        palette,
        quality,
        random,
      );
      if (light) fixtures.push(light);
      start = end;
    });
  }
  return fixtures;
}
