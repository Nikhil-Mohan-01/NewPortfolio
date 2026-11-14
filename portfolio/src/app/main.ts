import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { createChunk } from "../environment/chunk";
import {
  CAMERA,
  DEFAULT_FOG,
  DEFAULT_PALETTE,
  STREET,
} from "../environment/config";
import { createStreetLights } from "../environment/lighting";
import { createFacadeMaterials } from "../environment/materials";
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

const composer = new EffectComposer(renderer);
const drawScene = new RenderPass(scene, camera);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.43, 0.24, 0.74);
const output = new OutputPass();
composer.addPass(drawScene);
composer.addPass(bloom);
composer.addPass(output);

const road = createRoadKit(3401, DEFAULT_PALETTE.asphalt);
const facadeMaterials = createFacadeMaterials(3401);
const box = new THREE.BoxGeometry();
const chunks = Array.from({ length: STREET.chunkCount }, (_, index) => {
  const chunk = createChunk(
    index,
    3401,
    DEFAULT_PALETTE,
    "standard",
    road,
    facadeMaterials,
    box,
  );
  chunk.root.position.z = (2 - index) * STREET.chunkLength + 7;
  scene.add(chunk.root);
  return chunk;
});
createStreetLights(scene, chunks, 6).update(0, 1, true);

function resize() {
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / Math.max(clientHeight, 1);
  camera.updateProjectionMatrix();
  const ratio = Math.min(devicePixelRatio, 1.5);
  renderer.setPixelRatio(ratio);
  renderer.setSize(clientWidth, clientHeight, false);
  composer.setPixelRatio(ratio);
  composer.setSize(clientWidth, clientHeight);
  composer.render();
}

if (import.meta.env.DEV) {
  const yaw = Number(new URLSearchParams(location.search).get("yaw"));
  camera.rotation.y = THREE.MathUtils.degToRad(
    THREE.MathUtils.clamp(yaw, -70, 70),
  );
}

window.addEventListener("resize", resize);
resize();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener("resize", resize);
    for (const chunk of chunks) chunk.dispose();
    box.dispose();
    road.dispose();
    facadeMaterials.dispose();
    bloom.dispose();
    output.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  });
}
