import * as THREE from "three";
import type { StreetOptions, TokyoStreet } from "../environment";

import type { RetroCamera } from "./retro";

const params = new URLSearchParams(location.search);

function bounded(key: string, fallback: number, min: number, max: number) {
  const value = Number(params.get(key) ?? fallback);
  return Number.isFinite(value)
    ? THREE.MathUtils.clamp(value, min, max)
    : fallback;
}

export function showStreetOnly() {
  return params.get("view") === "street";
}

export function applyCameraOverrides(camera: THREE.PerspectiveCamera) {
  camera.rotation.y = THREE.MathUtils.degToRad(
    bounded("yaw", THREE.MathUtils.radToDeg(camera.rotation.y), -70, 70),
  );
  camera.rotation.x = THREE.MathUtils.degToRad(
    bounded("pitch", THREE.MathUtils.radToDeg(camera.rotation.x), -30, 30),
  );
  camera.position.x = bounded("x", camera.position.x, -0.7, 0.7);
  camera.position.y = bounded("eye", camera.position.y, 0.8, 2.1);
  camera.position.z = bounded("z", camera.position.z, -0.15, 0.9);
  camera.fov = bounded("fov", camera.fov, 45, 73);
}

export function readPreviewOptions(): StreetOptions {
  return {
    speed: bounded("speed", 6, 0, 64),
    quality: params.get("quality") === "low" ? "low" : "standard",
    seed: bounded("seed", 3401, 0, 4294967295),
    ...(params.get("paused") === "1" ? { paused: true } : {}),
  };
}

export function installPreviewApi(
  street: TokyoStreet,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  retro: RetroCamera,
) {
  const preset = params.get("filter");
  if (preset === "clean" || preset === "subtle" || preset === "retro") {
    retro.setPreset(preset);
  }
  retro.settings.strength = bounded("strength", retro.settings.strength, 0, 1);
  const { info } = renderer;
  let last = { calls: 0, triangles: 0, geometries: 0, textures: 0 };
  const preview = {
    street,
    camera,
    scene,
    retro,
    get stats() {
      return last;
    },
  };
  Object.assign(window, { streetPreview: preview });
  scene.onAfterRender = () => {
    last = {
      calls: info.render.calls,
      triangles: info.render.triangles,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
    };
  };
  return () => {
    Reflect.deleteProperty(window, "streetPreview");
  };
}
