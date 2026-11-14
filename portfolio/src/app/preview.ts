import * as THREE from "three";
import type { StreetOptions, TokyoStreet } from "../environment";

export function readPreviewOptions(
  camera: THREE.PerspectiveCamera,
): StreetOptions {
  const params = new URLSearchParams(location.search);
  const bounded = (key: string, fallback: number, min: number, max: number) => {
    const value = Number(params.get(key) ?? fallback);
    return Number.isFinite(value)
      ? THREE.MathUtils.clamp(value, min, max)
      : fallback;
  };
  camera.rotation.y = THREE.MathUtils.degToRad(bounded("yaw", 0, -70, 70));
  camera.position.x = bounded("x", camera.position.x, -0.7, 0.7);
  camera.position.y = bounded("eye", camera.position.y, 0.8, 2.1);
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
) {
  const { info } = renderer;
  let last = { calls: 0, triangles: 0, geometries: 0, textures: 0 };
  const preview = {
    street,
    camera,
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
