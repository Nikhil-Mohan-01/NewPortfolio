import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { R34 } from "./config";

function modelResources(root: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    geometries.add(object.geometry);
    const meshMaterials: THREE.Material[] = Array.isArray(object.material)
      ? object.material
      : [object.material];
    for (const material of meshMaterials) {
      materials.add(material);
      for (const property of Object.values(material)) {
        if (property instanceof THREE.Texture) textures.add(property);
      }
    }
  });

  return {
    materials,
    dispose() {
      const bitmaps = new Set<ImageBitmap>();
      for (const texture of textures) {
        if (
          !THREE.Cache.enabled &&
          typeof ImageBitmap !== "undefined" &&
          texture.image instanceof ImageBitmap
        ) {
          bitmaps.add(texture.image);
        }
        texture.dispose();
      }
      for (const image of bitmaps) image.close();
      for (const material of materials) material.dispose();
      for (const geometry of geometries) geometry.dispose();
    },
  };
}

export async function loadR34(signal: AbortSignal) {
  const url = new URL(
    import.meta.env.BASE_URL + R34.modelPath,
    document.baseURI,
  );
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.arrayBuffer();
  if (
    data.byteLength < 12 ||
    new DataView(data).getUint32(0, true) !== 0x46546c67
  ) {
    throw new Error("Expected a binary glTF file");
  }
  signal.throwIfAborted();

  const { scene: model } = await new GLTFLoader().parseAsync(
    data,
    new URL(".", url).href,
  );
  const resources = modelResources(model);
  if (signal.aborted) {
    resources.dispose();
    signal.throwIfAborted();
  }

  // This loader owns an independent model instance. Each of these source materials is
  // shared only by geometry that should receive the same adjustment.
  for (const material of resources.materials) {
    if (
      !(material instanceof THREE.MeshPhysicalMaterial) ||
      material.transmission === 0
    )
      continue;
    const glass = material.name.endsWith("Window_Material1");
    material.transmission = 0;
    material.opacity = glass ? 0.05 : 0.3;
    material.depthWrite = false;
    material.forceSinglePass = true;
  }

  const helpers: THREE.Object3D[] = [];
  model.traverse((node) => {
    if (node instanceof THREE.Light || node instanceof THREE.Camera)
      helpers.push(node);
  });
  for (const helper of helpers) helper.removeFromParent();

  const root = new THREE.Group();
  root.name = "R34 cockpit";
  root.scale.setScalar(R34.normalization.scale);
  root.position.set(...R34.normalization.position);
  root.rotation.y = R34.normalization.yaw;
  root.add(model);
  return {
    root,
    dispose() {
      root.removeFromParent();
      root.clear();
      resources.dispose();
    },
  };
}
