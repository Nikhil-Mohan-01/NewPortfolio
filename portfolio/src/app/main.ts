import * as THREE from "three";
import { CAMERA, DEFAULT_FOG, STREET } from "../environment/config";
import { createRoadKit } from "../environment/road";
import "./style.css";

const container = document.querySelector<HTMLElement>("#street")!;
const scene = new THREE.Scene();
scene.background = new THREE.Color(DEFAULT_FOG.color);
scene.fog = new THREE.Fog(DEFAULT_FOG.color, DEFAULT_FOG.near, DEFAULT_FOG.far);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.append(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  CAMERA.verticalFov,
  1,
  CAMERA.near,
  CAMERA.far,
);
camera.position.set(CAMERA.x, CAMERA.eyeHeight, 0);
scene.add(new THREE.HemisphereLight("#b9ceff", "#4c3b49", 1.9));
const road = createRoadKit(3401);

for (let index = 0; index < STREET.chunkCount; index++) {
  const chunk = new THREE.Group();
  chunk.position.z = (2 - index) * STREET.chunkLength;
  road.addTo(chunk);
  scene.add(chunk);
}

function resize() {
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / Math.max(clientHeight, 1);
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setSize(clientWidth, clientHeight, false);
  renderer.render(scene, camera);
}

window.addEventListener("resize", resize);
resize();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener("resize", resize);
    road.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  });
}
