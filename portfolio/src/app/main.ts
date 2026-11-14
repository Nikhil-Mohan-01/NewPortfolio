import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { CAMERA, createTokyoStreet, type StreetOptions } from "../environment";
import "./style.css";

const container = document.querySelector<HTMLElement>("#street")!;
const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
const camera = new THREE.PerspectiveCamera(
  CAMERA.verticalFov,
  1,
  CAMERA.near,
  CAMERA.far,
);
camera.position.set(CAMERA.x, CAMERA.eyeHeight, 0);
const options: StreetOptions = { paused: motionPreference.matches };

if (import.meta.env.DEV) {
  const { readPreviewOptions } = await import("./preview");
  Object.assign(options, readPreviewOptions(camera));
}

const street = createTokyoStreet(options);
const scene = new THREE.Scene();
scene.background = new THREE.Color(street.fog.color);
scene.fog = new THREE.Fog(street.fog.color, street.fog.near, street.fog.far);
scene.add(street.root);

const standard = options.quality !== "low";
const renderer = new THREE.WebGLRenderer({
  powerPreference: "high-performance",
});
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.append(renderer.domElement);

const target = new THREE.WebGLRenderTarget(1, 1, {
  type: THREE.HalfFloatType,
  samples: standard ? Math.min(2, renderer.capabilities.maxSamples) : 0,
});
const composer = new EffectComposer(renderer, target);
const drawScene = new RenderPass(scene, camera);
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.43, 0.24, 0.74);
bloom.enabled = standard;
const output = new OutputPass();
composer.addPass(drawScene);
composer.addPass(bloom);
composer.addPass(output);

let lastFrame: number | undefined;
let disposePreview: (() => void) | undefined;
if (import.meta.env.DEV) {
  const { installPreviewApi } = await import("./preview");
  disposePreview = installPreviewApi(street, scene, camera, renderer);
}

function resize() {
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / Math.max(clientHeight, 1);
  camera.updateProjectionMatrix();
  const ratio = Math.min(devicePixelRatio, standard ? 1.5 : 1);
  renderer.setPixelRatio(ratio);
  renderer.setSize(clientWidth, clientHeight, false);
  composer.setPixelRatio(ratio);
  composer.setSize(clientWidth, clientHeight);
  if (!document.hidden) composer.render();
}

function frame(time: number) {
  street.update((time - (lastFrame ?? time)) / 1000);
  lastFrame = time;
  composer.render();
}

function visibilityChanged() {
  lastFrame = undefined;
  renderer.setAnimationLoop(document.hidden ? null : frame);
}

function motionChanged() {
  street.paused = motionPreference.matches;
}

window.addEventListener("resize", resize);
document.addEventListener("visibilitychange", visibilityChanged);
motionPreference.addEventListener("change", motionChanged);
resize();
visibilityChanged();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibilityChanged);
    motionPreference.removeEventListener("change", motionChanged);
    disposePreview?.();
    street.dispose();
    drawScene.dispose();
    bloom.dispose();
    output.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  });
}
