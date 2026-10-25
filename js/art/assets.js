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

const svgImageCache = new Map();

// SVG used as an Image during PNG export cannot load linked PNG subresources.
// Embed only the local artwork already used by the preview, sharing fetches.
async function inlineSvgImages(svg) {
  const paths = [
    ...new Set([...svg.matchAll(/href="([^\"]+)"/g)].map((m) => m[1])),
  ].filter((path) => !path.startsWith("data:") && !path.startsWith("#"));
  for (const path of paths) {
    if (!svgImageCache.has(path)) {
      const pending = (async () => {
        const response = await fetch(path);
        if (!response.ok) throw Error("그림을 불러오지 못했어요: " + path);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(Error("그림을 읽지 못했어요: " + path));
          reader.readAsDataURL(blob);
        });
      })();
      svgImageCache.set(path, pending);
      pending.catch(() => svgImageCache.delete(path));
    }
    const data = await svgImageCache.get(path);
    svg = svg.split(`href="${path}"`).join(`href="${data}"`);
  }
  return svg;
}
