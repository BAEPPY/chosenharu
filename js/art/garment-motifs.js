"use strict";

function floralMotif() {
  return '<path d="M0 9Q5 0 3-12M1 2Q-10 5-9-2Q-4-5 1 2M3-5Q12-12 12-5Q9 0 3-5" fill="#669064" stroke="#426246" stroke-width=".7"/><g fill="#F5C2B1" stroke="#9C414C" stroke-width=".65"><path d="M0-11C-10-12-8-21-2-18C-4-26 6-26 6-19C14-23 17-13 9-11C13-4 2-3 0-11Z"/></g><circle cx="4" cy="-14" r="2.4" fill="#F4D77A"/>';
}

function phoenixMedallion(size = 10) {
  return `<g fill="none" stroke="currentColor" stroke-width=".9"><circle r="${size}"/><path d="M-6 4Q-1-6 5-3Q9-6 4-7M1-1Q-8-8-7-3Q-5 2 1 2M2 1Q9-3 8 1Q6 5 0 4M-1 4Q-6 10-8 6M1 5L6 8M-1-2L-3-5"/></g>`;
}

function garmentPattern(id, kind, gold) {
  if (kind === "dragon")
    return `<pattern id="${id}" width="32" height="28" patternUnits="userSpaceOnUse"><path d="M3 18C-2 13 4 8 9 11C7 2 20 1 22 9C31 5 35 17 27 18ZM9 18Q14 24 21 20M10 10Q14 5 17 10" fill="none" stroke="${gold}" stroke-width="${GARMENT_INK.detail}"/></pattern>`;
  const flower = kind === "hwarot";
  return `<pattern id="${id}" width="${flower ? 38 : 30}" height="${flower ? 43 : 34}" patternUnits="userSpaceOnUse"><g transform="translate(${flower ? 18 : 15} ${flower ? 26 : 17})" color="${gold}">${flower ? floralMotif() : phoenixMedallion()}</g></pattern>`;
}

function rankBadge(f, kind, gold, prince) {
  const { x, y, unit: u } = f;
  if (kind === "official")
    return `<g transform="translate(${x} ${y + 7}) scale(${u})"><rect x="-15" y="-14" width="30" height="28" fill="#E4E0C9" stroke="#40483C" stroke-width="1.5"/><g fill="#FFFFFF" stroke="#596E79" stroke-width="1"><path d="M-1 3Q-15-1-10-8L1-1Q14-9 12-2L3 6Q-6 10-1 3M0 2Q-3-12 3-9L7-6L3-5M-2 7L-5 12M2 7L7 12"/></g></g>`;
  if (kind !== "dragon") return "";
  return `<g transform="translate(${x} ${y + 6}) scale(${u})" fill="none" stroke="#80572F" stroke-width="1"><circle r="19" fill="${gold}"/><circle r="16.5"/><path d="M-8-8C-2-16 12-9 8-2S-8 0-7 7S6 13 9 6M-4-9L-8-14M2-9L4-14M6-5l7-2M4 0l7 3M-4 3l-8-2M-4 8l-3 5M-10-2l-4 1M-10 10l-3 2M3 11l2 3M-2-7q2-3 5-1l-1 3M10 10q5-2 3-5M-12-7q-3 3-1 5"/>${Array.from({ length: prince ? 4 : 5 }, (_, i) => `<path d="M${8 + i * 0.9} ${3 + i * 0.6}l3-1"/>`).join("")}</g>`;
}
