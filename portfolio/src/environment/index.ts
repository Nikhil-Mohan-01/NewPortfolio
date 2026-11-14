import * as THREE from "three";
import { createChunk } from "./chunk";
import {
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
  /** Travel speed in metres per second. Use 3–10 for normal preview tuning. */
  speed?: number;
  paused?: boolean;
  seed?: number;
  quality?: StreetQuality;
  fog?: Partial<typeof DEFAULT_FOG>;
  palette?: Partial<StreetPalette>;
  lightingIntensity?: number;
}

export function createTokyoStreet(options: StreetOptions = {}) {
  const {
    speed = 6,
    paused = false,
    seed = 3401,
    quality = "standard",
    lightingIntensity = 1,
  } = options;
  const palette = { ...DEFAULT_PALETTE, ...options.palette };
  const fog = { ...DEFAULT_FOG, ...options.fog };

  const root = new THREE.Group();
  root.name = "Looping Tokyo street";
  const road = createRoadKit(seed, palette.asphalt);
  const materials = createFacadeMaterials(seed);
  const box = new THREE.BoxGeometry();
  const stride = STREET.chunkLength;
  const loopLength = STREET.chunkCount * stride;
  const recycleAt = STREET.recycleBehind + stride;
  const firstChunkZ = 2 * stride + 11;
  const chunks = Array.from({ length: STREET.chunkCount }, (_, index) => {
    const chunk = createChunk(
      index,
      seed,
      palette,
      quality,
      road,
      materials,
      box,
    );
    chunk.root.position.z = firstChunkZ - index * stride;
    root.add(chunk.root);
    return chunk;
  });

  const lighting = createStreetLights(
    root,
    chunks,
    quality === "standard" ? 6 : 4,
  );
  lighting.update(0, lightingIntensity, true);
  let disposed = false;
  let travel = 0;
  let currentIntensity = lightingIntensity;

  return {
    root,
    fog,
    speed,
    paused,
    lightingIntensity,
    update(deltaSeconds: number) {
      if (disposed) return;
      const delta =
        this.paused ||
        this.speed <= 0 ||
        !Number.isFinite(this.speed) ||
        !Number.isFinite(deltaSeconds)
          ? 0
          : THREE.MathUtils.clamp(deltaSeconds, 0, STREET.maxDelta);
      if (delta === 0) {
        if (currentIntensity !== this.lightingIntensity) {
          currentIntensity = this.lightingIntensity;
          lighting.update(0, currentIntensity);
        }
        return;
      }
      currentIntensity = this.lightingIntensity;
      travel = (travel + this.speed * delta) % loopLength;
      // All sections derive their positions from one phase to keep road joins aligned.
      // Each section wraps after its front edge crosses the rear view envelope.
      for (let index = 0; index < chunks.length; index++) {
        const z = firstChunkZ - index * stride + travel;
        chunks[index].root.position.z =
          recycleAt -
          THREE.MathUtils.euclideanModulo(recycleAt - z, loopLength);
      }
      lighting.update(delta, currentIntensity);
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
