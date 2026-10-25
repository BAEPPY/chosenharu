"use strict";

function ceremonialHead(s, pose) {
  if (!["ikseongwan", "samo", "myeonryugwan", "tanggeon"].includes(s.hair))
    return "";
  const p = window.ART_LAYOUT[pose],
    tilts = {
      holding_fan_03: 20,
      holding_fan_01: 16,
      holding_fan_02: 0,
      trudging_01: 15,
      trudging_03: -10,
      sitting_01: -15,
    };
  const a = p.angle ?? tilts[pose] ?? 0;
  const x = p.headX ?? p.x + 6;
  const y = p.headY ?? p.y + 10;
  const special = courtHeadShape(s.hair);
  if (special)
    return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${p.w / 60})">${special}</g>`;
  const royal = s.hair === "ikseongwan";
  return `<g transform="translate(${x} ${y}) rotate(${a}) scale(${p.w / 60})" stroke="#161813" stroke-width="2" stroke-linejoin="round" fill="#30322d">${royal ? '<path d="M12-17C10-34 13-43 17-45C22-43 25-27 23-14Z"/><path d="M21-14C23-32 29-42 33-40C37-32 34-20 30-8Z"/><path d="M16-37l3 19M29-32l-4 18" fill="none" stroke="#5c5e52" stroke-width=".65"/>' : '<path d="M-25-13Q-41-24-48-18L-46-10Q-36-6-25-6ZM25-12Q39-24 48-18L46-10Q35-5 25-6Z"/><path d="M-45-16l16 6M29-10l15-6" stroke="#606354" stroke-width=".7"/>'}<path d="M-27 1Q-31-15-24-23Q-9-31 17-25Q27-21 28-2L23 5Q1-2-27 5Z"/><path d="M-27 0Q-1-7 27 0L27 6Q1-1-27 7Z" fill="#22261f"/><path d="M-20-21l-1 14M-16-24l-1 16M-11-25l-1 17M-6-26l-1 17M0-26l-1 17M6-26L5-9M12-25L11-8M18-23L17-7" fill="none" stroke="#55594c" stroke-width=".65"/></g>`;
}
