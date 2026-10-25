"use strict";

// Exposed neck openings measured from the native pose, not the torso bounds.
// null means that the neck is concealed by the head, hands, clothing or a child.
const GARMENT_NECKLINES = {
  resting_02: [215, 173, 11, 13],
  reading_writing_01: [168, 161, 15, 9],
  reading_writing_03: [190, 164, 10, 11],
  crafting_02: [182, 158, 12, 13],
  crafting_03: [180, 158, 6, 5],
  crafting_04: [196, 151, 4, 6],
  holding_fan_01: null,
  holding_fan_02: [177, 133, 14, 16],
  holding_fan_03: [188, 127, 15, 17],
  playing_music_01: null,
  playing_music_04: [197, 126, 9, 13],
  playing_music_05: [137, 160, 17, 19],
  sitting_01: [172, 163, 9, 13],
  sitting_02: null,
  sitting_04: null,
  dancing_hansam_01: [183, 152, 11, 13],
  dancing_hansam_02: [190, 135, 14, 22],
  dancing_hansam_03: [197, 160, 6, 4],
  dancing_hansam_04: [159, 157, 16, 16],
  eating_drinking_01: null,
  eating_drinking_04: null,
  trudging_01: [186, 121, 12, 20],
  trudging_03: [176, 135, 8, 6],
  with_child_02: null,
  with_child_04: null,
  cheering_04: [173, 152, 10, 11],
  dancing_01: [145, 126, 6, 7],
  dancing_02: [184, 143, 7, 5],
  dancing_03: [219, 122, 11, 6],
  dancing_04: null,
  dancing_05: null,
  posing_01: [187, 133, 7, 9],
  posing_02: [167, 123, 9, 4],
  posing_03: [214, 133, 6, 5],
  working_out_01: [180, 132, 10, 9],
  working_out_02: null,
  working_out_03: null,
};

// Necklines follow the original pose, including a tilted or inverted head.
// A body bounding box cannot locate the neck or the opening of a collar.
function garmentNeckDefs(id, n, base) {
  const top = garmentPaths(base, n.cloth, "top");
  const bottom = garmentPaths(base, n.cloth, "bottom");
  const box = GARMENT_NECKLINES[n.pose];
  return `<filter id="${id}-neck-expand" x="-60%" y="-60%" width="220%" height="220%"><feMorphology operator="dilate" radius="19"/></filter>
    <filter id="${id}-collar-edge" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="4"/></filter>
    <mask id="${id}-near-face" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><path d="${D.skinVectors[n.pose].face}" fill="white" filter="url(#${id}-neck-expand)"/></mask>
    <mask id="${id}-visible-skin" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black">${top}${bottom}</g></mask>
    <clipPath id="${id}-neck-region">${box ? `<rect x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[3]}"/>` : ""}</clipPath>
    <mask id="${id}-neck" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g filter="url(#${id}-collar-edge)"><g clip-path="url(#${id}-neck-region)"><path d="${D.skinVectors[n.pose].base}" fill="white" mask="url(#${id}-visible-skin)"/></g></g></mask>`;
}

function garmentNeckline(s, n, base, id) {
  const top = garmentPaths(base, "chima", "top");
  const color = n.garment.kind === "samhoejang" ? s.layer : "#FFF9EA";
  if (!GARMENT_NECKLINES[n.pose])
    return `<image href="${imageAsset(base + "clothes/chima_overlay@2x.png")}" width="360" height="360" mask="url(#${id}-near-face)"/>`;
  return `<g mask="url(#${id}-neck)">
    <g clip-path="url(#${id}-top)" fill="none" stroke="${color}" stroke-width="8" stroke-linejoin="round">${top}</g>
    <image href="${imageAsset(base + "clothes/chima_overlay@2x.png")}" width="360" height="360"/>
  </g>`;
}

function garmentOldCollarMask(pose) {
  const box = GARMENT_NECKLINES[pose];
  if (!box) return "";
  return `<rect x="${box[0] - 12}" y="${box[1] - 9}" width="${box[2] + 24}" height="${box[3] + 22}" fill="black"/>`;
}
