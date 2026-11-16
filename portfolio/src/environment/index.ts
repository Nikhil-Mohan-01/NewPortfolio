import * as THREE from "three";
import { createChunk } from "./chunk";
import {
  CAMERA,
  DEFAULT_FOG,
  DEFAULT_PALETTE,
  STREET,
  type StreetPalette,
  type StreetQuality,
} from "./config";
import { createStreetLights } from "./lighting";
import { createFacadeMaterials } from "./materials";
import { createRoadKit } from "./road";

export { CAMERA } from "./config";
export type { StreetPalette, StreetQuality } from "./config";

export interface StreetOptions {
  routeLength?: number;
  seed?: number;
  quality?: StreetQuality;
  fog?: Partial<typeof DEFAULT_FOG>;
  palette?: Partial<StreetPalette>;
  lightingIntensity?: number;
}

export function createTokyoStreet(options: StreetOptions = {}) {
  const {
    routeLength = 0,
    seed = 3401,
    quality = "standard",
    lightingIntensity = 1,
  } = options;
  const palette = { ...DEFAULT_PALETTE, ...options.palette };
  const fog = { ...DEFAULT_FOG, ...options.fog };

  const root = new THREE.Group();
  root.name = "Tokyo street route";
  const road = createRoadKit(seed, palette.asphalt);
  const materials = createFacadeMaterials(seed);
  const box = new THREE.BoxGeometry();
  const stride = STREET.chunkLength;
  // Each chunk has a permanent seed and route coordinate. The extra chunks cover
  // the finite travel range while retaining the original front and rear margins.
  const firstChunkZ = 2 * stride + 11;
  const count = STREET.chunkCount + Math.ceil(routeLength / stride);
  const chunks = Array.from({ length: count }, (_, index) => {
    const chunk = createChunk(
      index,
      seed,
      palette,
      quality,
      road,
      materials,
      box,
    );
    root.add(chunk.root);
    return chunk;
  });
  let travel = -1;

  function place(distance: number) {
    const next = THREE.MathUtils.clamp(distance, 0, routeLength);
    if (travel === next) return;
    travel = next;
    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index].root;
      const z = firstChunkZ - index * stride + travel;
      chunk.position.z = z;
      chunk.visible = z >= -CAMERA.far && z - stride <= STREET.recycleBehind;
    }
  }

  place(0);
  const lighting = createStreetLights(
    root,
    chunks,
    quality === "standard" ? 6 : 4,
  );
  lighting.update(0, lightingIntensity, true);
  let disposed = false;
  return {
    root,
    fog,
    get distance() {
      return travel;
    },
    setDistance(distance: number, delta: number) {
      if (disposed) return;
      place(distance);
      lighting.update(Math.min(delta, STREET.maxDelta), lightingIntensity);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.removeFromParent();
      for (const chunk of chunks) chunk.dispose();
      root.clear();
      materials.dispose();
      road.dispose();
      box.dispose();
    },
  };
}

export type TokyoStreet = ReturnType<typeof createTokyoStreet>;
