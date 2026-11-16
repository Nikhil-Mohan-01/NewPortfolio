import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { R34 } from "../cockpit/config";
import { mountCarLighting } from "../cockpit/lighting";
import { CAMERA, createTokyoStreet, type StreetOptions } from "../environment";
import { createDriverLook } from "./driver-look/controller";
import { mountResetControls } from "./driver-look/reset-controls";
import { mountMusicControls } from "./music/controls";
import { createRetroCamera } from "./retro";
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
let cockpitRequested = true;
let tuneCockpit: (() => void) | undefined;
const options: StreetOptions = { paused: motionPreference.matches };

if (import.meta.env.DEV) {
  const { readPreviewOptions, applyCameraOverrides, showStreetOnly } =
    await import("./preview");
  cockpitRequested = !showStreetOnly();
  Object.assign(options, readPreviewOptions());
  if (!cockpitRequested) applyCameraOverrides(camera);
  tuneCockpit = () => applyCameraOverrides(camera);
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
const disposeMusic = mountMusicControls(container);

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
const retro = createRetroCamera(composer, standard);

let driverLook: ReturnType<typeof createDriverLook> | undefined;
let resetControls: ReturnType<typeof mountResetControls> | undefined;
let disposeCarLighting: (() => void) | undefined;
let lastFrame: number | undefined;
let disposePreview: (() => void) | undefined;
if (import.meta.env.DEV) {
  const { installPreviewApi } = await import("./preview");
  disposePreview = installPreviewApi(street, scene, camera, renderer, retro);
}

function resize() {
  const { clientWidth, clientHeight } = container;
  camera.aspect = clientWidth / Math.max(clientHeight, 1);
  camera.updateProjectionMatrix();
  const ratio = Math.min(devicePixelRatio, standard ? 1.5 : 1);
  renderer.setPixelRatio(ratio);
  renderer.setSize(clientWidth, clientHeight, false);
  retro.resize(clientWidth, clientHeight, ratio);
  resetControls?.resize();
  if (!document.hidden) composer.render();
}

function frame(time: number) {
  const delta = (time - (lastFrame ?? time)) / 1000;
  street.update(delta);
  driverLook?.update(delta);
  resetControls?.update();
  lastFrame = time;
  retro.update(
    delta,
    !street.paused && street.speed > 0 && !motionPreference.matches,
  );
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

const cockpitLoad = new AbortController();
let cockpit:
  Awaited<ReturnType<typeof import("../cockpit/model").loadR34>> | undefined;

if (cockpitRequested) {
  void import("../cockpit/model")
    .then(({ loadR34 }) => loadR34(cockpitLoad.signal))
    .then((model) => {
      if (cockpitLoad.signal.aborted) {
        model.dispose();
        return;
      }
      cockpit = model;
      disposeCarLighting = mountCarLighting(model.root);
      scene.add(model.root);
      const view = R34.camera;
      camera.position.set(...view.eye);
      camera.rotation.set(view.pitch, view.yaw, 0, "YXZ");
      camera.fov = view.verticalFov;
      camera.near = view.near;
      camera.far = view.far;
      tuneCockpit?.();
      camera.updateProjectionMatrix();
      driverLook = createDriverLook(
        camera,
        renderer.domElement,
        motionPreference,
      );
      resetControls = mountResetControls(
        container,
        renderer.domElement,
        camera,
        model.root,
        driverLook.reset,
      );
      resetControls.resize();
    })
    .catch((error: unknown) => {
      if (!cockpitLoad.signal.aborted) {
        console.warn(
          `R34 cockpit unavailable at ${R34.modelPath}. Showing the street.`,
          error,
        );
      }
    });
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    renderer.setAnimationLoop(null);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", visibilityChanged);
    motionPreference.removeEventListener("change", motionChanged);
    cockpitLoad.abort();
    disposeMusic();
    resetControls?.dispose();
    driverLook?.dispose();
    disposeCarLighting?.();
    cockpit?.dispose();
    disposePreview?.();
    street.dispose();
    drawScene.dispose();
    bloom.dispose();
    retro.dispose();
    output.dispose();
    composer.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  });
}
