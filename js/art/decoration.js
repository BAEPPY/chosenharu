"use strict";

let artSerial = 0;

function clothDecoration(s, pose, cloth, base) {
  if (
    !["royal", "prince", "queen", "princess", "official", "graduate"].includes(
      s.outfit,
    )
  )
    return "";
  const serial = ++artSerial,
    id = "fabric" + serial,
    pattern = "brocade" + serial;
  const raw = colorVector(base + `clothes/${cloth}_fill.svg`, s);
  const topPaths = [...raw.matchAll(/<path\b[^>]*>/g)]
    .filter((m) => /class="(?:top|layer)"/.test(m[0]))
    .map((m) => m[0].replace(/fill="[^"]*"/g, 'fill="white"'))
    .join("");
  const royal = ["royal", "prince"].includes(s.outfit),
    female = ["queen", "princess"].includes(s.outfit);
  let h = `<defs><clipPath id="${id}">${topPaths}</clipPath><pattern id="${pattern}" width="24" height="27" patternUnits="userSpaceOnUse"><g fill="none" stroke="#e0bb69" stroke-width=".65" opacity=".42"><path d="M12 5c-3-6-9-1-5 3c-7 0-7 7-1 8c-4 5 2 9 6 4c4 5 10 1 6-4c6-1 6-8-1-8c4-4-2-9-5-3Z"/><path d="M8 12q4-5 8 0q-4 5-8 0M12 23v4M0 0l3 3M24 0l-3 3"/></g></pattern></defs><g clip-path="url(#${id})">`;
  if (royal || female)
    h += `<rect width="360" height="360" fill="url(#${pattern})"/>`;
  const badges = {
    holding_fan_03: [185, 167, -12],
    holding_fan_01: [205, 164, 8],
    holding_fan_02: [187, 171, -6],
    trudging_01: [192, 167, 13],
    reading_writing_01: [185, 191, -5],
    reading_writing_03: [202, 189, 5],
  };
  const badge = badges[pose];
  if (badge && royal) {
    const [x, y, a] = badge;
    h += `<g transform="translate(${x} ${y}) rotate(${a})"><circle r="19" fill="#c9a14d" stroke="#40382b" stroke-width="1.1"/><circle r="16.2" fill="none" stroke="#7b552e" stroke-width=".7"/><g fill="none" stroke="#80572f" stroke-width="1" stroke-linecap="round"><path d="M-8-8C-2-16 12-9 8-2S-8 0-7 7S6 13 9 6M-4-9L-8-14M2-9L4-14M6-5l7-2M4 0l7 3M-4 3l-8-2M-4 8l-3 5M-10-2l-4 1M-10 10l-3 2M3 11l2 3"/><path d="M-2-7q2-3 5-1l-1 3M-1-6h1M10 10q5-2 3-5M-12-7q-3 3-1 5"/></g></g>`;
  }
  if (badge && s.outfit === "official") {
    const [x, y, a] = badge;
    h += `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-15" y="-17" width="30" height="31" rx="1" fill="#e1d9be" stroke="#443a2e" stroke-width=".9"/><rect x="-12.5" y="-14.5" width="25" height="26" fill="none" stroke="#a59770" stroke-width=".7"/><g stroke="#56675f" stroke-width=".8" fill="none"><path d="M-8 7q10-8 13-3M-4 6q-4-9 1-15q3-1 4 1L-1-6M-5-1q-11-5-5-8q9 3 13 10M-1-3q9-7 12-3q-3 6-10 7M1 1L6 8M-1 2L-4 10M-11 10q5-3 9-1t11 0"/></g></g>`;
  }
  return h + "</g>";
}
