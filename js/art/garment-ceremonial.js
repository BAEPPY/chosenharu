"use strict";

function courtGarmentDetails(s, kind, f) {
  const { t, x, y, waist, hem, unit: u } = f;
  if (kind !== "myeonbok") return "";
  let art = `<path d="M${x - 21 * u} ${waist}L${x - 24 * u} ${hem - 10}L${x + 25 * u} ${hem - 10}L${x + 21 * u} ${waist}Z" fill="${s.bottom}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}"/>`;
  art += `<path d="M${x - 24 * u} ${waist + 5 * u}L${x - 31 * u} ${hem - 4}M${x + 26 * u} ${waist + 5 * u}L${x + 34 * u} ${hem - 5}" stroke="#F6F0DA" stroke-width="6"/>`;
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++)
      art += `<path d="M${x + side * (27 + i * 3) * u} ${waist + 8 * u}L${x + side * (31 + i * 3) * u} ${hem - 5}" stroke="${["#EEE8D1", "#4A8D72", "#BA4148", "#D6B85C"][i]}" stroke-width="2"/>`;
  }
  const emblems = [
    '<path d="M0 7V-7M0-3Q-7-9-6-2L0 1Q7-7 6 0L0 4M-3 7h6"/>',
    '<path d="M-3-8V8M-3-5Q6-9 7-4L6 1Q1 0-3 3M-6 7h6"/>',
    '<path d="M-7-7H7V-3H3V3H7V7H-7V3H-3V-3H-7Z"/>',
  ];
  for (let row = 0; row < emblems.length; row++)
    for (const side of [-1, 1])
      art += `<g transform="translate(${x + side * 11 * u} ${waist + 22 * u + row * 22 * u}) scale(${u * 0.8})" fill="none" stroke="${s.layer}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${emblems[row]}</g>`;
  art += garmentBelt(f, "#E5E0C5", true);
  return art;
}

function courtShoulders(s, kind, f) {
  if (!["dragon", "myeonbok"].includes(kind)) return "";
  return [-1, 1]
    .map((side) =>
      rankBadge(
        {
          x: f.x + side * f.t.w * 0.4,
          y: f.t.y + 12 * f.unit,
          unit: f.unit * 0.6,
        },
        "dragon",
        s.layer,
        s.outfit === "prince",
      ),
    )
    .join("");
}
