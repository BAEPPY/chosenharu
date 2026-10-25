"use strict";

// Restore the native skirt seams, ankle outlines and shoes together. Keeping
// the lower silhouette at its original size also keeps feet joined to hems.
function garmentLowerInk(base, cloth, id) {
  return `<image href="${imageAsset(base + `clothes/${cloth}_overlay@2x.png`)}" width="360" height="360" mask="url(#${id}-${cloth === "chima" ? "skirt-ink" : "lower"})"/>`;
}

function garmentCoatShape(bottom, f, kind, standing) {
  if (!standing) return null;
  const scale = kind === "noui" ? 0.77 : 0.86;
  return bottom.replaceAll(
    "<path",
    `<path transform="translate(0 ${f.b.y}) scale(1 ${scale}) translate(0 ${-f.b.y})"`,
  );
}

function floorDrapedSkirt(pose) {
  return (
    /^(reading_writing|crafting|eating_drinking)_/.test(pose) ||
    [
      "playing_music_01",
      "playing_music_05",
      "dancing_hansam_03",
      "with_child_02",
    ].includes(pose)
  );
}

function skirtInkDefs(pose, base, id) {
  return `<filter id="${id}-skirt-inset"><feMorphology operator="erode" radius="5"/></filter>
    <mask id="${id}-skirt-creases" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" filter="url(#${id}-skirt-inset)">${floorDrapedSkirt(pose) ? "" : garmentPaths(base, "chima", "bottom")}</g></mask>
    <mask id="${id}-skirt-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360">${skirtInkRegions(pose, base, id, false)}</mask>`;
}
function skirtInkRegions(pose, base, id, upper) {
  return `<rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="3">${skirtContour(pose, base)}</g><g fill="white" filter="url(#${id}-skirt-inset)">${floorDrapedSkirt(pose) ? "" : garmentPaths(base, "chima", "bottom")}</g><g fill="${upper ? "white" : "black"}" stroke="${upper ? "white" : "black"}" stroke-width="3">${garmentPaths(base, "chima", "top")}</g>`;
}

// Long folds start at the waist and open toward the hem only in upright poses.
function skirtStandingPleats(pose, base) {
  if (
    ![
      "holding_fan_01",
      "holding_fan_03",
      "trudging_01",
      "trudging_03",
      "dancing_05",
      "posing_01",
    ].includes(pose)
  )
    return "";
  const b = GARMENT_LAYOUT[pose].skirt,
    clip = "pleat" + ++garmentSerial;
  return `<svg width="360" height="360"><defs><clipPath id="${clip}">${skirtContour(pose, base)}</clipPath></defs><g clip-path="url(#${clip})" fill="none" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}" stroke-linecap="round">${[0.24, 0.55, 0.78].map((t) => `<path d="M${b.x + b.w * t} ${b.y + 8}Q${b.x + b.w * t} ${b.y + b.h * 0.52} ${b.x + b.w * t + (t - 0.5) * 16} ${b.y + b.h - 10}"/>`).join("")}</g></svg>`;
}

// Seated cloth opens across the floor. Folds radiate from the waist instead
// of retaining the trousers' horizontal knee creases beneath the skirt.
function skirtFloorPleats(pose, base) {
  if (!floorDrapedSkirt(pose)) return "";
  const b = GARMENT_LAYOUT[pose].skirt,
    x = b.x + b.w / 2,
    id = "pleat" + ++garmentSerial;
  return `<defs><clipPath id="${id}">${skirtContour(pose, base)}</clipPath><mask id="${id}-clear" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="2">${garmentPaths(base, "chima", "top")}</g></mask></defs><g mask="url(#${id}-clear)" clip-path="url(#${id})" fill="none" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}" stroke-linecap="round">${[-0.7, -0.3, 0.3, 0.7].map((t) => `<path d="M${x + t * b.w * 0.2} ${b.y + 3}Q${x + t * b.w * 0.28} ${b.y + b.h * 0.58} ${x + t * b.w * 0.47} ${b.y + b.h - 9}"/>`).join("")}</g>`;
}
