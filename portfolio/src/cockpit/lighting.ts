import {
  DataTexture,
  Group,
  LinearFilter,
  MathUtils,
  SpotLight,
  type Object3D,
} from "three";
import { R34 } from "./config";
import { CAR_LIGHTING } from "./lighting-config";

export function mountCarLighting(car: Object3D) {
  const rig = new Group();
  rig.name = "R34 light rig";
  // The GLB wrapper scales source units by 100. Below this rig one unit is one metre.
  rig.scale.setScalar(1 / R34.normalization.scale);
  const beam = CAR_LIGHTING.headlights;
  const [mountX, mountY, mountZ] = beam.mount;
  const aimDrop =
    Math.tan(MathUtils.degToRad(beam.downDegrees)) * beam.rangeMetres;
  const lights: SpotLight[] = [];
  const beamMask = createBeamMask();

  for (const side of [-1, 1]) {
    const lamp = new SpotLight(
      beam.color,
      beam.intensityCd,
      beam.rangeMetres,
      MathUtils.degToRad(beam.halfAngleDegrees),
      beam.penumbra,
      2,
    );
    lamp.name = side > 0 ? "Left headlight" : "Right headlight";
    lamp.map = beamMask;
    lamp.castShadow = beam.castShadow;
    lamp.position.set(side * mountX, mountY, mountZ);
    lamp.target.position.copy(lamp.position);
    lamp.target.position.y -= aimDrop;
    lamp.target.position.z += beam.rangeMetres;
    rig.add(lamp, lamp.target);
    lights.push(lamp);
  }

  const fill = CAR_LIGHTING.cabin;
  // The source sits above its cutoff radius, so the fill does not reach the road.
  const cabin = new SpotLight(
    fill.color,
    fill.intensityCd,
    fill.rangeMetres,
    MathUtils.degToRad(fill.halfAngleDegrees),
    0.9,
    2,
  );
  cabin.name = "R34 cabin fill";
  cabin.position.set(...fill.mount);
  cabin.target.position.set(...fill.target);
  rig.add(cabin, cabin.target);
  car.add(rig);

  return () => {
    rig.removeFromParent();
    for (const lamp of lights) lamp.dispose();
    cabin.dispose();
    beamMask.dispose();
  };
}

// Shape the real spotlights with a broad horizontal beam and a feathered upper cutoff
// so the lane gets most of the light. Both lamps share this tiny linear intensity texture.
function createBeamMask() {
  const size = 64;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const vertical = (y / (size - 1)) * 2 - 1;
    const downward = MathUtils.smoothstep(vertical, -0.72, -0.24);
    const cutoff = 1 - MathUtils.smoothstep(vertical, 0.08, 0.32);
    for (let x = 0; x < size; x++) {
      const horizontal = Math.abs((x / (size - 1)) * 2 - 1);
      const spread = 1 - MathUtils.smoothstep(horizontal, 0.1, 0.91);
      const level = Math.round(255 * spread * downward * cutoff);
      pixels.set([level, level, level, 255], (y * size + x) * 4);
    }
  }
  const texture = new DataTexture(pixels, size, size);
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
