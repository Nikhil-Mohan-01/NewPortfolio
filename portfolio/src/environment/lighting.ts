import * as THREE from "three";
import type { StreetChunk } from "./chunk";
import type { Fixture } from "./facades";

interface Candidate {
  chunk: StreetChunk;
  fixture: Fixture;
  distance: number;
}

export function createStreetLights(
  root: THREE.Object3D,
  chunks: StreetChunk[],
  count: number,
) {
  const fill = new THREE.HemisphereLight("#d4dcf4", "#a596a8", 1.75);
  const sky = new THREE.DirectionalLight("#aebfff", 0.6);
  sky.position.set(-2, 7, 2);
  root.add(fill, sky);

  const sources = chunks.flatMap((chunk) =>
    chunk.fixtures.map((fixture): Candidate => ({
      chunk,
      fixture,
      distance: 0,
    })),
  );
  const slots = Array.from({ length: count }, () => {
    const light = new THREE.PointLight("#ffffff", 0, 5.1, 2);
    root.add(light);
    return { light, source: undefined as Candidate | undefined, weight: 0 };
  });

  return {
    update(delta: number, intensity: number, immediate = false) {
      for (const source of sources) {
        const z = source.chunk.root.position.z + source.fixture.z;
        source.distance = Math.abs(z + 2);
      }
      sources.sort((a, b) => a.distance - b.distance);
      fill.intensity = 1.75 * intensity;
      sky.intensity = 0.82 * intensity;

      for (const slot of slots) {
        const keep =
          !!slot.source &&
          sources.indexOf(slot.source) < count &&
          slot.source.distance < 24;
        slot.weight = keep
          ? Math.min(1, slot.weight + delta * 3.4)
          : Math.max(0, slot.weight - delta * 5);
        if (slot.weight === 0) slot.source = undefined;
      }
      for (const slot of slots) {
        if (!slot.source) {
          for (let index = 0; index < count; index++) {
            const next = sources[index];
            if (
              next &&
              next.distance < 24 &&
              !slots.some(({ source }) => source === next)
            ) {
              slot.source = next;
              if (immediate) slot.weight = 1;
              break;
            }
          }
        }
        slot.light.intensity = 0;
        if (!slot.source) continue;
        const { chunk, fixture, distance } = slot.source;
        const spatialFade = 1 - THREE.MathUtils.smoothstep(distance, 11, 24);
        slot.light.position.set(
          fixture.x,
          fixture.y,
          fixture.z + chunk.root.position.z,
        );
        slot.light.color.copy(fixture.color);
        slot.light.intensity =
          fixture.power * slot.weight * spatialFade * intensity;
      }
    },
  };
}
