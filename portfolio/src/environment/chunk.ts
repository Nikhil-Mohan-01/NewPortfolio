import * as THREE from "three";
import { ChunkBatches } from "./batches";
import type { StreetPalette, StreetQuality } from "./config";
import { buildFrontages } from "./facades";
import type { FacadeMaterials } from "./materials";
import { createRoadKit, seededRandom } from "./road";

export function createChunk(
  index: number,
  seed: number,
  palette: StreetPalette,
  quality: StreetQuality,
  road: ReturnType<typeof createRoadKit>,
  materials: FacadeMaterials,
  box: THREE.BoxGeometry,
) {
  const root = new THREE.Group();
  root.name = `Tokyo street section ${index + 1}`;
  road.addTo(root);

  const batches = new ChunkBatches();
  const geometries: THREE.BufferGeometry[] = [];
  const fixtures = buildFrontages(
    batches,
    materials,
    palette,
    quality,
    index,
    seededRandom(seed + Math.imul(index + 1, 2654435761)),
  );
  batches.addTo(root, box, geometries);
  return {
    root,
    fixtures,
    dispose() {
      for (const geometry of geometries) geometry.dispose();
      for (const child of root.children) {
        if (child instanceof THREE.InstancedMesh) child.dispose();
      }
    },
  };
}

export type StreetChunk = ReturnType<typeof createChunk>;
