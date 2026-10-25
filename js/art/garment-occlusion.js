"use strict";

// The native overlays include opaque fans, tools and children as well as ink.
// Keep their painted regions (and adjacent outlines) in front of new garments.
function garmentForegroundFilter(id) {
  return `<filter id="${id}-props" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
    <feColorMatrix in="SourceGraphic" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .333 .333 .333 0 0" result="light"/>
    <feComponentTransfer in="light" result="paint"><feFuncA type="discrete" tableValues="0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1"/></feComponentTransfer>
    <feComposite in="paint" in2="SourceAlpha" operator="in" result="opaque-paint"/>
    <feComponentTransfer in="opaque-paint" result="solid-paint"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 0 0 0 1"/></feComponentTransfer>
    <feMorphology in="solid-paint" operator="dilate" radius="1.5" result="paint-and-edges"/>
    <feComposite in="SourceGraphic" in2="paint-and-edges" operator="in"/>
  </filter>`;
}

function garmentSurface(s, kind, f, pattern, id) {
  let art = "";
  if (["hwarot", "noui"].includes(kind))
    art += `<rect width="360" height="360" fill="url(#${pattern})"/>`;
  if (kind === "dragon")
    art += `<rect width="360" height="360" fill="url(#${pattern})" opacity=".18"/>`;
  return art;
}
