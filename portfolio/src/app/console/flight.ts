import {
  Matrix4,
  MathUtils,
  Quaternion,
  Vector3,
  type PerspectiveCamera,
} from "three";
import { CONSOLE } from "./config";

interface Pose {
  position: Vector3;
  orientation: Quaternion;
}

interface Flight {
  from: Pose;
  to: Pose;
  entering: boolean;
  elapsed: number;
  done: () => void;
}

export function createConsoleFlight(
  camera: PerspectiveCamera,
  motion: MediaQueryList,
  shade: (opacity: number) => void,
) {
  const waypoint = new Vector3(...CONSOLE.approach);
  const screenEye = new Vector3(...CONSOLE.screenEye);
  const up = new Vector3(0, 1, 0);
  const rotation = new Matrix4();
  let driver: Pose | undefined;
  let flight: Flight | undefined;

  function currentPose(): Pose {
    return {
      position: camera.position.clone(),
      orientation: camera.quaternion.clone(),
    };
  }

  function restore() {
    flight = undefined;
    if (driver) {
      camera.position.copy(driver.position);
      camera.quaternion.copy(driver.orientation);
      driver = undefined;
    }
    shade(0);
  }

  return {
    get holdsScene() {
      return !!driver;
    },
    enter(center: Vector3, done: () => void) {
      if (motion.matches || driver) return false;
      driver = currentPose();
      const orientation = new Quaternion().setFromRotationMatrix(
        rotation.lookAt(screenEye, center, up),
      );
      flight = {
        from: driver,
        to: { position: screenEye, orientation },
        entering: true,
        elapsed: 0,
        done,
      };
      return true;
    },
    exit(done: () => void) {
      if (motion.matches || !driver) return false;
      flight = {
        from: currentPose(),
        to: driver,
        entering: false,
        elapsed: 0,
        done,
      };
      shade(1);
      return true;
    },
    restore,
    update(dt: number) {
      if (!flight) return;
      const active = flight;
      const duration = active.entering
        ? CONSOLE.enterSeconds
        : CONSOLE.exitSeconds;
      active.elapsed += MathUtils.clamp(dt, 0, 0.05);
      const progress = motion.matches
        ? 1
        : Math.min(1, active.elapsed / duration);
      const smooth = progress * progress * (3 - 2 * progress);
      // Quadratic path avoids advancing straight through the steering-wheel area.
      camera.position
        .copy(active.from.position)
        .multiplyScalar((1 - smooth) ** 2)
        .addScaledVector(waypoint, 2 * smooth * (1 - smooth))
        .addScaledVector(active.to.position, smooth ** 2);
      camera.quaternion.slerpQuaternions(
        active.from.orientation,
        active.to.orientation,
        smooth,
      );
      shade(
        MathUtils.smoothstep(
          active.entering ? progress : 1 - progress,
          0.55,
          1,
        ),
      );
      if (progress === 1) {
        flight = undefined;
        if (!active.entering) restore();
        active.done();
      }
    },
  };
}
