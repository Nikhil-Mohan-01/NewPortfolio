import * as THREE from "three";
import { STREET } from "./config";

export function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function asphaltTexture(seed: number) {
  const random = seededRandom(seed);
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 256;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = (x / canvas.width) * Math.PI * 2;
      const v = (y / canvas.height) * Math.PI * 2;
      const mottle = Math.sin(u * 2 + Math.cos(v * 3)) * Math.cos(v * 5 + u);
      const grain = (random() - 0.5) * 34;
      const value = 125 + mottle * 30 + grain;
      const index = (y * canvas.width + x) * 4;
      image.data.set([value, value, value, 255], index);
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.y = 4;
  texture.anisotropy = 4;
  return texture;
}

export function createRoadKit(seed: number, asphalt = "#11151d") {
  const { laneWidth, pavementWidth, curbHeight, chunkLength } = STREET;
  const texture = asphaltTexture(seed);
  const road = new THREE.PlaneGeometry(laneWidth, chunkLength);
  road.rotateX(-Math.PI / 2);
  road.translate(0, 0, -chunkLength / 2);
  const kerb = new THREE.BoxGeometry(0.115, curbHeight, chunkLength);
  const pavement = new THREE.BoxGeometry(
    pavementWidth + 0.22,
    curbHeight - 0.018,
    chunkLength,
  );
  const paint = new THREE.PlaneGeometry(0.038, chunkLength);
  paint.rotateX(-Math.PI / 2);
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(asphalt).multiplyScalar(2.25),
    map: texture,
    roughnessMap: texture,
    roughness: 0.89,
  });
  const kerbMaterial = new THREE.MeshStandardMaterial({
    color: "#4b4b52",
    roughness: 0.95,
  });
  const pavementMaterial = new THREE.MeshStandardMaterial({
    color: "#3b3b45",
    map: texture,
    roughness: 0.93,
  });
  const paintMaterial = new THREE.MeshStandardMaterial({
    color: "#464650",
    map: texture,
    roughness: 1,
  });

  return {
    addTo(chunk: THREE.Group) {
      chunk.add(new THREE.Mesh(road, roadMaterial));
      for (const side of [-1, 1]) {
        const curbMesh = new THREE.Mesh(kerb, kerbMaterial);
        curbMesh.position.set(
          side * (laneWidth / 2 + 0.0575),
          curbHeight / 2,
          -chunkLength / 2,
        );
        const pavementMesh = new THREE.Mesh(pavement, pavementMaterial);
        pavementMesh.position.set(
          side * (laneWidth / 2 + 0.115 + (pavementWidth + 0.22) / 2),
          (curbHeight - 0.018) / 2,
          -chunkLength / 2,
        );
        const paintMesh = new THREE.Mesh(paint, paintMaterial);
        paintMesh.position.set(
          side * (laneWidth / 2 - 0.12),
          0.002,
          -chunkLength / 2,
        );
        chunk.add(curbMesh, pavementMesh, paintMesh);
      }
    },
    dispose() {
      for (const resource of [
        texture,
        road,
        kerb,
        pavement,
        paint,
        roadMaterial,
        kerbMaterial,
        pavementMaterial,
        paintMaterial,
      ]) {
        resource.dispose();
      }
    },
  };
}
