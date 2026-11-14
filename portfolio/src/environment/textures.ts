import * as THREE from "three";
import { seededRandom } from "./road";

export const SIGN_NAMES = [
  "LANTERN",
  "NIGHT BOWL",
  "PLUM HOUSE",
  "RAIN ROOM",
  "UMAMI",
  "COAL & RICE",
  "AFTER HOURS",
  "RICE CLUB",
  "SOFT SIGNAL",
  "PHASE TWO",
  "BLUE TAPE",
  "PIXEL ROOM",
  "RADIO CLUB",
  "WAVE FORM",
  "VOLT",
  "RELAY",
  "KINU",
  "JUNIPER",
  "MOTH",
  "MOON TEA",
  "STUDIO 08",
  "LATE HOUR",
  "EMBER",
  "LILAC",
];

const columns = 8;
const rows = 8;
const cell = 128;

function canvas2d(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas.getContext("2d")!;
}

export function signTextures() {
  const ctx = canvas2d(columns * cell, rows * cell);
  const labels = ["KITCHEN  /  COUNTER", "ELECTRIC  /  SOUND", "TEA  /  GOODS"];

  for (let index = 0; index < SIGN_NAMES.length * 2; index++) {
    const x = (index % columns) * cell;
    const y = Math.floor(index / columns) * cell;
    const sign = index % SIGN_NAMES.length;
    const name = SIGN_NAMES[sign];
    const category = Math.floor(sign / 8);
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = category === 1 ? "#282828" : "#3e3e3e";
    ctx.fillRect(0, 0, cell, cell);
    ctx.fillStyle = "#151515";
    ctx.fillRect(4, 6, 120, 116);
    ctx.strokeStyle = "#b2b2b2";
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 9, 114, 110);

    if (index < SIGN_NAMES.length) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "700 42px Arial, sans-serif";
      ctx.fillStyle = "#f0f0f0";
      ctx.fillText(name, 64, 46, 101);
      ctx.font = "700 15px monospace";
      ctx.fillStyle = "#aaaaaa";
      ctx.fillText(labels[category], 64, 96, 83);
      ctx.fillRect(38, 76, 52, 2);
    } else {
      const letters = name.split(" ")[0].slice(0, 5).split("");
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 50px Arial, sans-serif";
      ctx.fillStyle = "#ececec";
      const step = Math.min(27, 91 / letters.length);
      letters.forEach((letter, line) => {
        ctx.fillText(letter, 64, 64 + (line - (letters.length - 1) / 2) * step);
      });
    }
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return { texture };
}

export function signUv(sign: number, vertical: boolean) {
  const index = sign + (vertical ? SIGN_NAMES.length : 0);
  const column = index % columns;
  const row = Math.floor(index / columns);
  const inset = 2 / cell;
  return [
    (column + inset) / columns,
    1 - (row + 1 - inset) / rows,
    (column + 1 - inset) / columns,
    1 - (row + inset) / rows,
  ] as const;
}

export function spillTexture(seed: number) {
  const ctx = canvas2d(128, 128);
  const image = ctx.createImageData(128, 128);
  const random = seededRandom(seed);
  for (let y = 0; y < 128; y++) {
    const v = (y - 63.5) / 63.5;
    for (let x = 0; x < 128; x++) {
      const u = (x - 63.5) / 63.5;
      const distance = Math.hypot(u, v * (1 + 0.15 * Math.sin(u * 14)));
      const grain =
        0.58 + 0.21 * Math.sin(u * 62 + Math.sin(v * 28)) + random() * 0.21;
      const alpha = Math.max(0, 1 - distance) ** 1.65 * grain;
      image.data.set([255, 255, 255, alpha * 255], (y * 128 + x) * 4);
    }
  }
  ctx.putImageData(image, 0, 0);
  return new THREE.CanvasTexture(ctx.canvas);
}

export function glazingTexture() {
  const ctx = canvas2d(64, 64);
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, "#b4b4b4");
  gradient.addColorStop(0.16, "#f0f0f0");
  gradient.addColorStop(0.49, "#c3c3c3");
  gradient.addColorStop(0.83, "#929292");
  gradient.addColorStop(1, "#666666");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "rgba(235,235,235,0.22)";
  ctx.fillRect(4, 15, 56, 4);
  ctx.fillStyle = "rgba(66,66,66,0.26)";
  ctx.fillRect(13, 49, 51, 4);
  const texture = new THREE.CanvasTexture(ctx.canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
