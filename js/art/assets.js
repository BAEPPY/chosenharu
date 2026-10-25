"use strict";

function imageAsset(path) {
  const source = A[path];
  if (!source) throw Error("그림 부품을 찾지 못했어요: " + path);
  return source;
}

function colorVector(path, s) {
  let text = imageAsset(path).replace(/<\/?svg\b[^>]*>/g, "");
  for (const [k, v] of Object.entries({
    "skin-color": D.skintones[s.skin].rgba,
    "hair-color": s.hairColor,
    "top-color": s.top,
    "bottom-color": s.bottom,
    "layer-color": s.layer,
  }))
    text = text.replace(new RegExp("var\\(--" + k + "(?:,[^)]+)?\\)", "g"), v);
  return text;
}

const wrapSvg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">${body}</svg>`;
