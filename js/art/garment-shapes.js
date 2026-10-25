"use strict";

let garmentSerial = 0;
const garmentPathCache = new Map();

function garmentPaths(base, cloth, part) {
  const key = base + cloth + ":" + part;
  if (!garmentPathCache.has(key)) {
    const raw = imageAsset(base + `clothes/${cloth}_fill.svg`);
    garmentPathCache.set(
      key,
      [...raw.matchAll(/<path\b[^>]*>/g)]
        .filter(([tag]) => tag.includes(`class="${part}"`))
        .map(([tag]) => tag.replace(/\s(?:class|fill)="[^"]*"/g, ""))
        .join(""),
    );
  }
  return garmentPathCache.get(key);
}

function garmentFrame(pose) {
  const { torso: t, skirt: b } = window.GARMENT_LAYOUT[pose];
  return {
    t,
    b,
    x: t.x + t.w * 0.47,
    y: t.y + t.h * 0.61,
    waist: t.y + t.h * 0.92,
    hem: b.y + b.h,
    unit: Math.max(0.65, Math.min(1.2, t.w / 90)),
  };
}

function garmentCollar(f, color, round = false) {
  const { x, t, unit: u } = f;
  return `<g transform="translate(${x} ${t.y + 6}) scale(${u})" fill="none" stroke-linejoin="round">
    <path d="${round ? "M-14 0Q-18 25 3 26Q22 21 17 1" : "M-13 0L-1 27L19 2"}" stroke="#3D3530" stroke-width="5"/>
    <path d="${round ? "M-14 0Q-18 25 3 26Q22 21 17 1" : "M-13 0L-1 27L19 2"}" stroke="${color}" stroke-width="3"/>
  </g>`;
}

function garmentRibbon(f, color, long = false) {
  const { x, y, unit: u } = f;
  return `<g transform="translate(${x - 5} ${y}) scale(${u})" fill="${color}" stroke="#46372F" stroke-width=".8">
    <path d="M0 0Q-15-10-17-3Q-17 4 0 3L11-3Q15-8 17-3Q19 3 2 4Z"/>
    <path d="M-2 3L-8 ${long ? 67 : 28}L-1 ${long ? 69 : 30}L4 4M6 3L7 ${long ? 49 : 20}L13 ${long ? 50 : 21}L10 2Z"/>
  </g>`;
}

function garmentBelt(f, color, gold = false) {
  const { t, waist, unit: u } = f;
  return `<g stroke="#3D3530" stroke-width="1"><path d="M${t.x} ${waist - 4 * u}Q${f.x} ${waist + 3 * u} ${t.x + t.w} ${waist - 3 * u}L${t.x + t.w} ${waist + 4 * u}Q${f.x} ${waist + 10 * u} ${t.x} ${waist + 3 * u}Z" fill="${color}"/>${gold ? Array.from({ length: 5 }, (_, i) => `<rect x="${t.x + t.w * (0.15 + i * 0.15)}" y="${waist}" width="${5 * u}" height="${4 * u}" rx="1" fill="#E6C975"/>`).join("") : ""}</g>`;
}

function skirtFolds(f, pleated = false) {
  const { b } = f;
  return `<g fill="none" stroke="#413A33" opacity=".45" stroke-width=".85">${Array.from(
    { length: pleated ? 12 : 5 },
    (_, i) => {
      const q = (i + 1) / (pleated ? 13 : 6),
        x = b.x + b.w * q;
      return `<path d="M${x} ${b.y + 8}Q${x + (q - 0.5) * b.w * 0.15} ${b.y + b.h * 0.55} ${x + (q - 0.5) * b.w * 0.08} ${b.y + b.h - 4}"/>`;
    },
  ).join("")}</g>`;
}

function invertedGarmentFrame(f) {
  const flip = (b) => ({
    x: 360 - b.x - b.w,
    y: 360 - b.y - b.h,
    w: b.w,
    h: b.h,
  });
  const t = flip(f.t),
    b = flip(f.b);
  return {
    t,
    b,
    x: t.x + t.w * 0.47,
    y: t.y + t.h * 0.61,
    waist: t.y + t.h * 0.92,
    hem: b.y + b.h,
    unit: f.unit,
  };
}
