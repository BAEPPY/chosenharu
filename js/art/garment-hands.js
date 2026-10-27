"use strict";

// Restore the native skin AND ink together. Repainting only skin loses the
// hand contour when the skirt/apron masks have removed the original overlay.
function garmentVisibleHands(s, n, base) {
  const id = "visible-hands" + ++garmentSerial;
  const skin = D.skintones[s.skin].rgba;
  const hand = GARMENT_HAND_OPENINGS[n.pose];
  const longSleeves = n.cloth === "dopo_baeja";
  if (longSleeves && n.pose === "trudging_01")
    return walkingRobeHands(s, base, id);
  const cloth = longSleeves ? n.cloth : "baji";
  // Long sleeves can legitimately cover a hand. Keep their actual opening;
  // never expose skin through the middle of the sleeve.
  const restored = `<defs>
    <filter id="${id}-edge" x="-5%" y="-5%" width="110%" height="110%"><feMorphology operator="dilate" radius="2"/></filter>
    <mask id="${id}-region" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><path d="${hand}" fill="white" filter="url(#${id}-edge)"/></mask>
    <mask id="${id}-skin" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/>${longSleeves ? `<g fill="black">${["top", "bottom", "layer"].map((part) => garmentPaths(base, n.cloth, part)).join("")}</g>` : ""}</mask>
  </defs><g mask="url(#${id}-region)"><path d="${D.skinVectors[n.pose].base}" fill="${skin}" mask="url(#${id}-skin)"/><image href="${imageAsset(base + `clothes/${cloth}_overlay@2x.png`)}" width="360" height="360"/></g>`;
  return (
    restored +
    (longSleeves && n.pose === "trudging_03"
      ? raisedWalkingRobeHand(s, base, id)
      : "")
  );
}

function walkingRobeHands(s, base, id) {
  // The robe cuffs sit lower than the short jacket's wrists. Join each hand
  // to the real curved cuff, and recover its native ink without copying the
  // old vest seams across the ceremonial front panel.
  return `<defs><mask id="${id}-cuffs" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="none" stroke="white" stroke-width="7" stroke-linecap="round"><path d="M139 202 C136 224 141 248 156 250 C175 254 179 236 179 222"/><path d="M199 202 C198 237 201 251 212 250 C223 250 225 230 229 205"/></g></mask></defs>
    <g fill="${D.skintones[s.skin].rgba}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}" stroke-linejoin="round"><path d="M154 249 C153 255 155 262 159 264 C162 265 164 256 165 249 Z"/><path d="M208 249 C206 255 207 261 210 263 C213 264 216 255 217 248 Z"/></g>
    <image href="${imageAsset(base + "clothes/dopo_baeja_overlay@2x.png")}" width="360" height="360" mask="url(#${id}-cuffs)"/>`;
}

function raisedWalkingRobeHand(s, base, id) {
  return `<defs><mask id="${id}-lower-cuff" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><path d="M129 216 C132 232 140 238 150 233 C162 228 168 216 164 199" fill="none" stroke="white" stroke-width="7" stroke-linecap="round"/></mask></defs>
    <path d="M138 233 C137 239 141 245 145 245 C149 244 151 240 150 234 Z" fill="${D.skintones[s.skin].rgba}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}" stroke-linejoin="round"/>
    <image href="${imageAsset(base + "clothes/dopo_baeja_overlay@2x.png")}" width="360" height="360" mask="url(#${id}-lower-cuff)"/>`;
}
