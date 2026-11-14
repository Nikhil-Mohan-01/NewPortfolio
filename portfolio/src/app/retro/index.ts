import { MathUtils, ShaderMaterial, Vector2 } from "three";
import type { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { RETRO, presetStrength, type RetroPreset } from "./config";
import { retroFragment, retroVertex } from "./shader";

export function createRetroCamera(composer: EffectComposer, standard: boolean) {
  const settings = { ...RETRO };
  const uniforms = {
    tDiffuse: { value: null },
    cssPixel: { value: new Vector2(1, 1) },
    softness: { value: 0 },
    saturation: { value: 1 },
    contrast: { value: 0 },
    grain: { value: 0 },
    grainFrame: { value: 0 },
    vignette: { value: 0 },
    chromaticOffset: { value: 0 },
    scanlines: { value: 0 },
    aspect: { value: 1 },
  };
  const pass = new ShaderPass(
    new ShaderMaterial({
      name: "Retro night-drive treatment",
      uniforms,
      vertexShader: retroVertex,
      fragmentShader: retroFragment,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  composer.addPass(pass);
  let baselineRatio = 1;
  let width = 1;
  let height = 1;
  const target = new Vector2();
  let grainTime = 0;

  function update(delta = 0, animate = false) {
    const strength = settings.enabled
      ? MathUtils.clamp(settings.strength, 0, 1)
      : 0;
    pass.enabled = strength > 0;
    // Limit target reallocations during a strength fade. At the shipped strength
    // the scale is 0.82; the existing low tier retains its 1× CSS resolution.
    const renderStrength = Math.round(strength * 20) / 20;
    const scale = MathUtils.lerp(
      1,
      MathUtils.clamp(settings.renderScale, 0.7, 1),
      renderStrength,
    );
    const ratio = Math.max(
      baselineRatio * scale,
      standard ? baselineRatio * 0.7 : Math.min(baselineRatio, 1),
    );
    const targetWidth = Math.max(1, Math.floor(width * ratio));
    const targetHeight = Math.max(1, Math.floor(height * ratio));
    if (target.x !== targetWidth || target.y !== targetHeight) {
      target.set(targetWidth, targetHeight);
      // The composer keeps its initial 1× ratio and receives target pixel dimensions.
      composer.setSize(targetWidth, targetHeight);
    }
    uniforms.softness.value =
      strength * settings.softness * (standard ? 1 : 0.5);
    uniforms.saturation.value = MathUtils.lerp(
      1,
      settings.saturation,
      strength,
    );
    uniforms.contrast.value = strength * settings.contrast;
    uniforms.grain.value = strength * MathUtils.clamp(settings.grain, 0, 0.05);
    uniforms.vignette.value =
      strength * MathUtils.clamp(settings.vignette, 0, 0.35);
    uniforms.chromaticOffset.value = standard
      ? strength * MathUtils.clamp(settings.chromaticOffset, 0, 1)
      : 0;
    uniforms.scanlines.value =
      standard && width >= 720
        ? strength * MathUtils.clamp(settings.scanlines, 0, 0.02)
        : 0;
    if (animate && pass.enabled && uniforms.grain.value > 0) {
      // Advance the grain independently. Pausing preserves both the index and its phase.
      grainTime +=
        MathUtils.clamp(delta, 0, 0.05) *
        MathUtils.clamp(settings.grainHz, 0, 30);
      uniforms.grainFrame.value = Math.floor(grainTime) % 65536;
    }
  }

  return {
    settings,
    target,
    setPreset(preset: RetroPreset) {
      settings.enabled = preset !== "clean";
      settings.strength = presetStrength(preset);
    },
    resize(cssWidth: number, cssHeight: number, ratio: number) {
      width = Math.max(1, cssWidth);
      height = Math.max(1, cssHeight);
      baselineRatio = ratio;
      uniforms.cssPixel.value.set(1 / width, 1 / height);
      uniforms.aspect.value = width / height;
      update();
    },
    update,
    dispose() {
      composer.removePass(pass);
      pass.dispose();
    },
  };
}

export type RetroCamera = ReturnType<typeof createRetroCamera>;
