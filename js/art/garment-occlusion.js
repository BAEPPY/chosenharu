"use strict";

// The native overlays include opaque fans, tools and children as well as ink.
// Keep their painted regions (and adjacent outlines) in front of new garments.
function garmentForegroundFilter(id) {
  return `<filter id="${id}-props" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .333 .333 .333 0 0" result="light"/>
    <feComponentTransfer in="light" result="paint"><feFuncA type="discrete" tableValues="0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1"/></feComponentTransfer>
    <feMorphology in="paint" operator="dilate" radius="1.5" result="paint-and-edges"/>
    <feComposite in="SourceGraphic" in2="paint-and-edges" operator="in"/>
  </filter>`;
}

function garmentSurface(s, kind, f, pattern, id) {
  let art = "";
  if (["hwarot", "noui"].includes(kind))
    art += `<rect width="360" height="360" fill="url(#${pattern})"/>`;
  if (kind === "dragon")
    art += `<rect width="360" height="360" fill="url(#${pattern})" opacity=".18"/>`;
  if (kind === "noui")
    art += `<g mask="url(#${id}-arms)"><rect width="360" height="360" fill="${s.bottom}"/><rect width="360" height="360" fill="url(#${pattern})"/></g>`;
  return art;
}

function garmentSleeveTrim(s, n, id) {
  if (!["samhoejang", "dangui"].includes(n.garment.kind)) return "";
  const color = n.garment.kind === "dangui" ? "#FFF9EA" : s.layer;
  // This native hand holds the collar; its cuff runs diagonally beneath it.
  if (n.pose === "holding_fan_03")
    return `<g clip-path="url(#${id}-top)"><path d="M205 162L218 155L222 164L208 171Z" fill="${color}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}"/></g>`;
  return `<g clip-path="url(#${id}-top)">${(GARMENT_WRISTS[n.pose] || []).map(([x, y, a]) => `<path transform="translate(${x} ${y - 3}) rotate(${a})" d="M-9-4H11V3H-9Z" fill="${color}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}"/>`).join("")}</g>`;
}
