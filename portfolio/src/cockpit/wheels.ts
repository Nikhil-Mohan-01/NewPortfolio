import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export function batchWheelMeshes(model: THREE.Object3D) {
  model.updateMatrixWorld(true);
  for (const name of ["W1", "W2", "W3", "W4"]) {
    const wheel = model.getObjectByName(name);
    if (!wheel) continue;
    const batches = new Map<
      string,
      THREE.Mesh<THREE.BufferGeometry, THREE.Material>[]
    >();
    const inverse = wheel.matrixWorld.clone().invert();
    wheel.traverse((node) => {
      if (
        !(node instanceof THREE.Mesh) ||
        Array.isArray(node.material) ||
        !node.geometry.index
      )
        return;
      const relative = new THREE.Matrix4().multiplyMatrices(
        inverse,
        node.matrixWorld,
      );
      // Mirrored components keep their original winding and tangent frame.
      if (relative.determinant() <= 0) return;
      const attributes = Object.keys(node.geometry.attributes).sort().join(",");
      const key = `${node.material.id}:${attributes}`;
      const batch = batches.get(key) ?? [];
      batch.push(node);
      batches.set(key, batch);
    });

    for (const meshes of batches.values()) {
      if (meshes.length < 2) continue;
      const copies = meshes.map((mesh) =>
        mesh.geometry
          .clone()
          .applyMatrix4(
            new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld),
          ),
      );
      const combined = mergeGeometries(copies);
      for (const copy of copies) copy.dispose();
      if (!combined) continue;
      const mesh = new THREE.Mesh(combined, meshes[0].material);
      mesh.name = `${name} ${meshes[0].material.name}`;
      wheel.add(mesh);
      // Keep the imported geometry and hierarchy available in memory for this model instance.
      for (const original of meshes) original.visible = false;
    }
  }
}
