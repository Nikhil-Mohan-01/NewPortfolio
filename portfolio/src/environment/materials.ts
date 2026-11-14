import * as THREE from "three";
import { seededRandom } from "./road";
import { glazingTexture, signTextures, spillTexture } from "./textures";

export function createFacadeMaterials(seed: number) {
  const atlas = signTextures();
  const spillMap = spillTexture(seed);
  const random = seededRandom(seed + 42);
  const pattern = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const mottling = Math.sin(x * 0.2 + Math.cos(y * 0.2) * 2) * 11;
      const tone = 215 + mottling - random() * 31 - y * 0.32;
      pattern.set([tone, tone, tone, 255], (y * 64 + x) * 4);
    }
  }
  const plaster = new THREE.DataTexture(pattern, 64, 64);
  plaster.generateMipmaps = true;
  plaster.magFilter = THREE.LinearFilter;
  plaster.minFilter = THREE.LinearMipmapLinearFilter;
  plaster.needsUpdate = true;

  const wall = new THREE.MeshStandardMaterial({
    map: plaster,
    roughness: 0.94,
  });
  const tilePattern = pattern.slice();
  for (let y = 0; y < 64; y++) {
    for (let x = 0; x < 64; x++) {
      const joint = y % 8 === 0 || (x + (Math.floor(y / 8) % 2) * 4) % 8 === 0;
      if (joint) {
        const index = (y * 64 + x) * 4;
        const value = tilePattern[index] * 0.64;
        tilePattern.set([value, value, value], index);
      }
    }
  }
  const tileMap = new THREE.DataTexture(tilePattern, 64, 64);
  tileMap.generateMipmaps = true;
  tileMap.magFilter = THREE.LinearFilter;
  tileMap.minFilter = THREE.LinearMipmapLinearFilter;
  tileMap.needsUpdate = true;
  const tile = new THREE.MeshStandardMaterial({
    map: tileMap,
    roughness: 0.88,
  });
  const trim = new THREE.MeshStandardMaterial({
    roughness: 0.82,
    metalness: 0.12,
  });
  const glass = new THREE.MeshStandardMaterial({
    roughness: 0.34,
    metalness: 0.18,
  });
  const lit = new THREE.MeshBasicMaterial();
  const glazing = glazingTexture();
  const interior = new THREE.MeshBasicMaterial({ map: glazing });
  const signs = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true });
  const spill = new THREE.MeshBasicMaterial({
    map: spillMap,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Keep additive spill from adding the fog color itself at the vanishing point.
  spill.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <fog_fragment>",
      `#ifdef USE_FOG
        #ifdef FOG_EXP2
          float spillFade = 1.0 - exp( -fogDensity * fogDensity * vFogDepth * vFogDepth );
        #else
          float spillFade = smoothstep( fogNear, fogFar, vFogDepth );
        #endif
        gl_FragColor.a *= 1.0 - spillFade;
      #endif`,
    );
  };

  return {
    wall,
    tile,
    trim,
    glass,
    lit,
    interior,
    signs,
    spill,
    dispose() {
      for (const item of [
        atlas,
        spillMap,
        plaster,
        tileMap,
        wall,
        tile,
        trim,
        glass,
        lit,
        glazing,
        interior,
        signs,
        spill,
      ]) {
        item.dispose();
      }
    },
  };
}

export type FacadeMaterials = ReturnType<typeof createFacadeMaterials>;
