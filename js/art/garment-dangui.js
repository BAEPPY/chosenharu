"use strict";

// Only the visible lower front is extended. The original shoulders, arms,
// hands and skirt remain in their authored positions. Bent/occluded fronts
// keep the native outline instead of stretching an entire vest.
const DANGUI_FRONTS = {
  trudging_03: {
    fill: "M164 184Q199 168 228 161L233 194Q207 209 171 222Z",
    hem: "M162 189L190 177.5Q215 167 229 165",
  },
  cheering_04: {
    fill: "M140 198L226 183L235 211Q188 235 143 224Z",
    hem: "M140 203.5L168 198L177 198L229 188",
  },
  posing_01: {
    fill: "M150 188Q183 196 214 184L219 218Q185 231 147 220Z",
    hem: "M150 194Q181 201 214 189.5",
  },
  holding_fan_03: {
    fill: "M152 174Q177 189 210 188L217 221Q185 233 146 214Z",
    hem: "M150 180Q180 196 212 193",
  },
  holding_fan_01: {
    fill: "M149 184L199 189L203 221Q178 233 151 216Z",
    hem: "M149 190Q175 200 198 194",
  },
};

// Knots follow the authored fastening point. Occluded tails are masked by
// the real sleeves, hands and props, rather than pasted over the figure.
const JEOGORI_TIES = {
  sitting_01: [172, 194, -10],
  playing_music_01: [174, 206, 0],
  holding_fan_01: [174, 174, 0],
  holding_fan_02: [177, 169, 0],
  holding_fan_03: [176, 163, 12],
  reading_writing_01: [175, 190, 0],
  reading_writing_03: [191, 194, 0],
  crafting_02: [184, 190, 0],
  crafting_03: [181, 184, 0],
  crafting_04: [195, 180, 0],
  playing_music_04: [196, 161, 0],
  playing_music_05: [145, 196, 0],
  dancing_hansam_01: [184, 186, -12],
  dancing_hansam_02: [192, 181, -12],
  dancing_hansam_03: [202, 188, 5],
  dancing_hansam_04: [168, 196, 10],
  trudging_01: [185, 166, 0],
  trudging_03: [183, 172, -13],
  with_child_02: [175, 186, 0],
  cheering_04: [177, 180, 0],
  dancing_01: [150, 163, -12],
  dancing_02: [182, 181, 0],
  dancing_03: [213, 155, 28],
  dancing_04: [193, 237, 180],
  dancing_05: [183, 175, 0],
  posing_01: [184, 167, 0],
  posing_02: [175, 164, 0],
  posing_03: [214, 168, 0],
  working_out_01: [182, 175, 0],
  working_out_02: [202, 183, 5],
  working_out_03: [192, 174, 5],
  resting_02: [210, 204, 30],
};
function jeogoriRibbon(s, pose, id) {
  const p = JEOGORI_TIES[pose];
  if (!p) return "";
  return `<g clip-path="url(#${id}-decoration)" mask="url(#${id}-ribbon-visible)"><g transform="translate(${p[0]} ${p[1]}) rotate(${p[2]})" fill="${s.layer}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}" stroke-linejoin="round">
    <path d="M-3 1Q-5 25-13 48L-6 50Q1 27 2 2Z"/>
    <path d="M1 1Q5 29 2 58L9 59Q13 30 6 0Z"/>
    <path d="M-2-3Q-12-10-13-3Q-13 4-3 2L3 2Q13 6 13-2Q13-7 3-4Z"/>
    <path d="M-3-4L3-4L3 3L-3 3Z"/>
  </g></g>`;
}

function nativeJeogori(s, n, base) {
  const id = "garment" + ++garmentSerial;
  const top = garmentPaths(base, "chima", "top");
  const bottom = skirtContour(n.pose, base);
  const kind = n.garment.kind;
  const front = kind === "dangui" ? DANGUI_FRONTS[n.pose] : null;
  const tie = JEOGORI_TIES[n.pose];
  const body = garmentPaths(base, "chima_baeja", "layer");
  const overlay = imageAsset(base + "clothes/chima_overlay@2x.png");
  const defs = `<defs>
    ${skirtInkDefs(n.pose, base, id)}
    <filter id="${id}-body-inset"><feMorphology operator="erode" radius="3"/></filter>
    <mask id="${id}-body-interior" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" filter="url(#${id}-body-inset)">${body}</g></mask>
    <clipPath id="${id}-decoration">${top}${bottom}${front ? `<path d="${front.fill}"/>` : ""}</clipPath>
    <mask id="${id}-ribbon-visible" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><rect width="360" height="360" fill="black" mask="url(#${id}-sleeve-only)"/><path d="${GARMENT_HAND_OPENINGS[n.pose] || ""}" fill="black" stroke="black" stroke-width="3"/></mask>
    <clipPath id="${id}-top">${top}</clipPath>
    <clipPath id="${id}-fabric">${top}${front ? `<path d="${front.fill}"/>` : ""}</clipPath>
    <pattern id="${id}-silk" width="32" height="36" patternUnits="userSpaceOnUse"><g transform="translate(16 18) scale(.3)" color="#E5D397">${phoenixMedallion()}</g></pattern>
    <mask id="${id}-sleeve-only" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white">${top}</g><g fill="black">${garmentPaths(base, "chima_baeja", "layer")}</g></mask>
    <mask id="${id}-native-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360">${skirtInkRegions(n.pose, base, id, true)}${front ? `<path d="${front.fill}" fill="black"/><g fill="white" stroke="white" stroke-width="4">${top}</g><path d="${front.hem}" fill="none" stroke="black" stroke-width="5"/>` : ""}${tie ? `<g mask="url(#${id}-body-interior)"><rect x="${tie[0] - 19}" y="${tie[1] - 25}" width="39" height="55" transform="rotate(${tie[2]} ${tie[0]} ${tie[1]})" fill="black"/></g>` : ""}</mask>
    ${garmentNeckDefs(id, n, base)}${garmentForegroundFilter(id)}

  </defs>`;
  return garmentInk(
    defs +
      `<g fill="${s.bottom}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}" stroke-linejoin="round">${bottom}</g>` +
      skirtStandingPleats(n.pose, base, s.bottom) +
      skirtFloorPleats(n.pose, base) +
      (front
        ? `<path d="${front.fill}" fill="${s.top}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}" stroke-linejoin="round"/>`
        : "") +
      `<g fill="${s.top}">${top}</g>` +
      (kind === "dangui"
        ? `<rect width="360" height="360" fill="url(#${id}-silk)" opacity=".65" clip-path="url(#${id}-fabric)"/>`
        : "") +
      (kind !== "jeogori" ? garmentHandCuffs(n.pose, kind, id, s.layer) : "") +
      `<image href="${overlay}" width="360" height="360" mask="url(#${id}-native-ink)"/>` +
      jeogoriRibbon(s, n.pose, id) +
      (GARMENT_NECKLINES[n.pose] ? garmentNeckline(s, n, base, id) : "") +
      `<image href="${overlay}" width="360" height="360" filter="url(#${id}-props)"/>`,
  );
}
