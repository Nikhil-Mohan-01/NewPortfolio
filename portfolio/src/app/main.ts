import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { R34 } from "../cockpit/config";
import { mountCarLighting } from "../cockpit/lighting";
import { CAMERA, createTokyoStreet, type StreetOptions } from "../environment";
import { createConsoleFlight } from "./console/flight";
import { mountConsoleScreen, type OpenApp } from "./console/screen";
import { createDriverLook } from "./driver-look/controller";
import { mountResetControls } from "./driver-look/reset-controls";
import { DRIVE_ROUTE } from "./drive/config";
import type { ScrollDrive } from "./drive/scroll";
import { createRetroCamera } from "./retro";

interface SceneEvents {
  open: OpenApp;
  failure: () => void;
  drive: ScrollDrive;
  shade: (opacity: number) => void;
}

export async function mountScene(container: HTMLElement, events: SceneEvents) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const camera = new THREE.PerspectiveCamera(
    CAMERA.verticalFov,
    1,
    CAMERA.near,
    CAMERA.far,
  );
  camera.position.set(CAMERA.x, CAMERA.eyeHeight, 0);
  const options: StreetOptions = { routeLength: DRIVE_ROUTE.length };
  const preview = import.meta.env.DEV ? await import("./preview") : undefined;
  const cockpitRequested = !preview?.showStreetOnly();
  if (preview) {
    Object.assign(options, preview.readPreviewOptions());
    if (!cockpitRequested) preview.applyCameraOverrides(camera);
  }

  const renderer = new THREE.WebGLRenderer({
    powerPreference: "high-performance",
  });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  container.append(renderer.domElement);
  const street = createTokyoStreet(options);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(street.fog.color);
  scene.fog = new THREE.Fog(street.fog.color, street.fog.near, street.fog.far);
  scene.add(street.root);

  const standard = options.quality !== "low";
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
  const disposePreview = preview?.installPreviewApi(
    street,
    scene,
    camera,
    renderer,
    retro,
  );

  const lifetime = new AbortController();
  const listeners = { signal: lifetime.signal };
  let active = false;
  let interactive = false;
  let lastFrame: number | undefined;
  let driverLook: ReturnType<typeof createDriverLook> | undefined;
  let resetControls: ReturnType<typeof mountResetControls> | undefined;
  let consoleScreen: ReturnType<typeof mountConsoleScreen> | undefined;
  let disposeCarLighting: (() => void) | undefined;
  let cockpit:
    Awaited<ReturnType<typeof import("../cockpit/model").loadR34>> | undefined;
  const flight = createConsoleFlight(camera, motion, events.shade);

  function resize() {
    if (!active) return;
    const { clientWidth, clientHeight } = container;
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
    const ratio = Math.min(devicePixelRatio, standard ? 1.5 : 1);
    renderer.setPixelRatio(ratio);
    renderer.setSize(clientWidth, clientHeight, false);
    retro.resize(clientWidth, clientHeight, ratio);
    resetControls?.resize();
    consoleScreen?.resize();
    if (!document.hidden) composer.render();
  }

  function frame(time: number) {
    const delta = (time - (lastFrame ?? time)) / 1000;
    lastFrame = time;
    const previous = street.distance;
    if (interactive && !flight.holdsScene) events.drive.update(delta);
    street.setDistance(events.drive.distance, delta);
    flight.update(delta);
    if (!active) return;
    driverLook?.update(delta);
    resetControls?.update();
    consoleScreen?.update();
    retro.update(
      delta,
      !flight.holdsScene && previous !== street.distance && !motion.matches,
    );
    composer.render();
  }

  function syncLoop() {
    lastFrame = undefined;
    renderer.setAnimationLoop(active && !document.hidden ? frame : null);
  }

  window.addEventListener("resize", resize, listeners);
  document.addEventListener("visibilitychange", syncLoop, listeners);
  renderer.domElement.addEventListener(
    "webglcontextlost",
    events.failure,
    listeners,
  );

  if (cockpitRequested) {
    void import("../cockpit/model")
      .then(({ loadR34 }) => loadR34(lifetime.signal))
      .then((model) => {
        if (lifetime.signal.aborted) {
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
        preview?.applyCameraOverrides(camera);
        camera.updateProjectionMatrix();
        driverLook = createDriverLook(camera, renderer.domElement, motion);
        driverLook.setEnabled(interactive);
        resetControls = mountResetControls(
          container,
          renderer.domElement,
          camera,
          model.root,
          driverLook.reset,
        );
        consoleScreen = mountConsoleScreen(
          container,
          renderer.domElement,
          camera,
          model.root,
          events.open,
        );
        resize();
      })
      .catch((error: unknown) => {
        if (!lifetime.signal.aborted) {
          console.warn(`R34 cockpit unavailable at ${R34.modelPath}.`, error);
          events.failure();
        }
      });
  }

  return {
    setActive(next: boolean) {
      if (active === next) return;
      active = next;
      resize();
      syncLoop();
    },
    setInteraction(next: boolean) {
      interactive = next;
      driverLook?.setEnabled(next);
    },
    enter(done: () => void) {
      return consoleScreen ? flight.enter(consoleScreen.center, done) : false;
    },
    exit(done: () => void) {
      return flight.exit(done);
    },
    restoreDriver() {
      flight.restore();
      resetControls?.update();
      consoleScreen?.update();
    },
    dispose() {
      lifetime.abort();
      active = false;
      syncLoop();
      consoleScreen?.dispose();
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
    },
  };
}

export type DriveScene = Awaited<ReturnType<typeof mountScene>>;
