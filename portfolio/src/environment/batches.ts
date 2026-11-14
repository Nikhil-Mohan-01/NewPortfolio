import * as THREE from "three";

export interface Transform {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  turn?: number;
}

interface PaintedBox {
  transform: Transform;
  color: THREE.Color;
}

interface PaintedPanel {
  transform: Transform;
  color: THREE.Color;
  uv: readonly [number, number, number, number];
  ground: boolean;
}

export class ChunkBatches {
  private boxes = new Map<THREE.Material, PaintedBox[]>();
  private panels = new Map<THREE.Material, PaintedPanel[]>();

  box(
    material: THREE.Material,
    color: THREE.ColorRepresentation,
    transform: Transform,
  ) {
    const batch = this.boxes.get(material) ?? [];
    batch.push({ transform, color: new THREE.Color(color) });
    this.boxes.set(material, batch);
  }

  panel(
    material: THREE.Material,
    color: THREE.Color,
    transform: Transform,
    uv: PaintedPanel["uv"] = [0, 0, 1, 1],
    ground = false,
  ) {
    const batch = this.panels.get(material) ?? [];
    batch.push({ transform, color, uv, ground });
    this.panels.set(material, batch);
  }

  addTo(
    group: THREE.Group,
    unitBox: THREE.BoxGeometry,
    owned: THREE.BufferGeometry[],
  ) {
    const object = new THREE.Object3D();
    for (const [material, batch] of this.boxes) {
      const mesh = new THREE.InstancedMesh(unitBox, material, batch.length);
      batch.forEach(({ transform: t, color }, index) => {
        object.position.set(t.x, t.y, t.z);
        object.scale.set(t.width, t.height, t.depth);
        object.rotation.set(0, t.turn ?? 0, 0);
        object.updateMatrix();
        mesh.setMatrixAt(index, object.matrix);
        mesh.setColorAt(index, color);
      });
      mesh.computeBoundingSphere();
      group.add(mesh);
    }

    for (const [material, batch] of this.panels) {
      const positions: number[] = [];
      const colors: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];
      const point = new THREE.Vector3();
      batch.forEach(({ transform: t, color, uv, ground }, index) => {
        object.position.set(t.x, t.y, t.z);
        object.scale.set(t.width, t.height, 1);
        object.rotation.set(ground ? -Math.PI / 2 : 0, t.turn ?? 0, 0, "YXZ");
        object.updateMatrix();
        const [u0, v0, u1, v1] = uv;
        const corners = [
          [0.5, 0.5, u1, v1],
          [-0.5, 0.5, u0, v1],
          [-0.5, -0.5, u0, v0],
          [0.5, -0.5, u1, v0],
        ];
        for (const [x, y, u, v] of corners) {
          point.set(x, y, 0).applyMatrix4(object.matrix);
          positions.push(point.x, point.y, point.z);
          colors.push(color.r, color.g, color.b);
          uvs.push(u, v);
        }
        const start = index * 4;
        indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
      });
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
      geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geometry.setIndex(indices);
      owned.push(geometry);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.renderOrder = material.transparent ? 1 : 0;
      group.add(mesh);
    }
  }
}
