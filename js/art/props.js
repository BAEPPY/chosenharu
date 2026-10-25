"use strict";

function activityProps(s) {
  const stroke =
    'stroke="#292b22" stroke-width="1.25" stroke-linejoin="round" stroke-linecap="round"';
  const basket = (x, y) =>
    `<g transform="translate(${x} ${y})" ${stroke}><path d="M-27 0Q-24 23-15 27Q2 34 21 25Q28 17 29 0Z" fill="#ba9c66"/><ellipse cy="0" rx="28" ry="9" fill="#cdb680"/><path d="M-24 8Q0 17 25 8M-21 16Q0 24 23 16M-15 24Q0 29 17 24M-17 5l5 22M-6 8l2 22M6 8l-2 22M17 6l-5 23" fill="none" stroke="#796544" stroke-width=".65"/></g>`;
  if (s.pose === "farming")
    return `<g ${stroke}><path d="M285 226L301 316" stroke="#705536" stroke-width="4"/><path d="M297 311Q313 306 327 314L324 324Q312 320 300 323Z" fill="#85877b"/><path d="M273 245l1-25M274 235l-7-8M274 230l8-8M291 245l-2-28M289 233l-7-9" stroke="#8c9b62" fill="none" stroke-width="1"/></g>${basket(274, 278)}<g ${stroke}><path d="M256 278Q254 264 264 260Q275 263 272 280Z" fill="#ceae62"/><path d="M277 279Q280 259 289 263Q297 270 289 281Z" fill="#9ea463"/><path d="M266 264l-3 15M287 267l-5 13" fill="none" stroke="#7d764a" stroke-width=".75"/></g>`;
  if (s.pose === "market")
    return `${basket(105, 285)}<g ${stroke}><ellipse cx="88" cy="279" rx="8" ry="6" fill="#b68d58"/><ellipse cx="106" cy="277" rx="9" ry="7" fill="#cfaa63"/><path d="M115 283q2-20 12-18q8 10 1 20Z" fill="#a0ab76"/><path d="M79 321Q88 305 101 310L125 309Q138 314 132 329H82Z" fill="#d6c5a0"/><path d="M91 312l-2 10M112 310l8 12" fill="none" stroke-width=".7"/></g>`;
  if (s.pose === "medicine")
    return `<g ${stroke}><path d="M65 260L74 256L83 260L87 281Q75 291 62 282Z" fill="#ac9a78"/><ellipse cx="74" cy="258" rx="9" ry="3" fill="#675943"/><path d="M68 269h12M69 273h9" stroke="#63553d" fill="none" stroke-width=".7"/><path d="M54 299Q64 291 74 294L88 302L70 308Z" fill="#d6c38d"/><path d="M60 300l12 2M67 296l12 6" fill="none" stroke="#7a8858" stroke-width=".8"/></g>`;
  if (s.pose === "guard")
    return `<g ${stroke}><path d="M298 151L287 316" stroke="#7d6544" stroke-width="3.4"/><path d="M298 150L293 136L301 114L306 139Z" fill="#a4aaa1"/><path d="M300 120l-2 25" stroke="#dee2d6" stroke-width=".7"/><path d="M295 151l8 1M294 156l8 1" fill="none" stroke="#a58156"/></g>`;
  return "";
}
