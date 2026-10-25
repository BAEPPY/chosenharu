"use strict";

function courtGarmentDetails(s, kind, f) {
  return kind === "myeonbok" ? garmentBelt(f, "#E5E0C5", true) : "";
}

// The bulseul is a separate, continuous cloth ABOVE the legs. It must never
// inherit the trousers/robe clipping path, which divides a spread-leg pose.
function garmentFrontCloth(s, n, f, id, apron = false) {
  if (!apron && n.garment.kind !== "myeonbok") return "";
  const seated =
    /^(reading_writing|crafting|playing_music|sitting|eating_drinking)_/.test(
      n.pose,
    );
  const lowDance = n.pose === "dancing_hansam_03";
  const inverted = Math.abs(window.ART_LAYOUT[n.pose].angle || 0) > 90;
  const g = inverted ? invertedGarmentFrame(f) : f;
  const u = g.unit * (apron ? 1.25 : 1),
    start = g.waist + 4,
    end = Math.max(start + 23, g.hem - 9);
  let corners = [
    [g.x - 21 * u, start],
    [g.x + 21 * u, start],
    [g.x + (seated ? 35 : lowDance ? 39 : 25) * u, end],
    [g.x - (seated ? 35 : lowDance ? 39 : 24) * u, end],
  ];
  if (n.pose === "resting_02")
    corners = [
      [156, 173],
      [183, 190],
      [157, 256],
      [103, 225],
    ];
  if (n.pose === "dancing_03")
    corners = [
      [186, 162],
      [210, 185],
      [169, 239],
      [132, 201],
    ];
  const [a, b, c, d] = corners;
  const q = ([x, y]) => `${x} ${y}`;
  const path = `M${q(a)}L${q(b)}Q${c[0] + 2} ${(b[1] + c[1]) / 2} ${q(c)}Q${(c[0] + d[0]) / 2} ${(c[1] + d[1]) / 2 + 3} ${q(d)}Q${d[0] - 2} ${(d[1] + a[1]) / 2} ${q(a)}Z`;
  const point = (v, w) => {
    const l = [a[0] * (1 - w) + d[0] * w, a[1] * (1 - w) + d[1] * w],
      r = [b[0] * (1 - w) + c[0] * w, b[1] * (1 - w) + c[1] * w];
    return [l[0] * (1 - v) + r[0] * v, l[1] * (1 - v) + r[1] * v];
  };
  const emblems = [
    '<path d="M0 7V-7M0-3Q-7-9-6-2L0 1Q7-7 6 0L0 4M-3 7h6"/>',
    '<path d="M-3-8V8M-3-5Q6-9 7-4L6 1Q1 0-3 3M-6 7h6"/>',
    '<path d="M-7-7H7V-3H3V3H7V7H-7V3H-3V-3H-7Z"/>',
  ];
  const angle = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const h = Math.hypot(
    (c[0] + d[0] - a[0] - b[0]) / 2,
    (c[1] + d[1] - a[1] - b[1]) / 2,
  );
  let motifs = "";
  for (let row = 0; row < (apron ? 0 : 3); row++)
    for (const side of [0.3, 0.7]) {
      const p = point(side, 0.22 + row * 0.27),
        scale = Math.min(0.7 * u, h / 75);
      motifs += `<g transform="translate(${q(p)}) rotate(${angle}) scale(${scale})" fill="none" stroke="${s.layer}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${emblems[row]}</g>`;
    }
  const sideRibbons = apron
    ? ""
    : [-1, 1]
        .map((side) => {
          const top = side < 0 ? a : b,
            end = side < 0 ? d : c;
          return ["#DFD5B2", "#577765", s.layer]
            .map((color, i) => {
              const offset = side * (4 + i * 3);
              return `<path d="M${top[0] + offset} ${top[1]}Q${(top[0] + end[0]) / 2 + offset} ${(top[1] + end[1]) / 2} ${end[0] + offset} ${end[1]}" fill="none" stroke="${color}" stroke-width="2.4"/>`;
            })
            .join("");
        })
        .join("");
  return `<g mask="url(#${id}-panel-visible)"><g ${inverted ? 'transform="rotate(180 180 180)"' : ""}>
    <path ${apron ? 'data-waist-apron="continuous"' : 'data-bulseul="continuous"'} d="${path}" fill="${apron ? s.layer : s.bottom}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}"/>
    ${apron ? `<path d="M${a[0] + 10} ${a[1] + 2}Q${a[0] + 17} ${(a[1] + d[1]) / 2} ${d[0] + 9} ${d[1] - 8}" fill="none" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}"/>` : `<path d="M${q(a)}L${q(d)}M${q(b)}L${q(c)}" fill="none" stroke="#EADAA8" stroke-width="2"/>`}
    ${sideRibbons}${motifs}
  </g></g>`;
}

function courtShoulders(s, kind, f) {
  if (!["dragon", "myeonbok"].includes(kind)) return "";
  if (kind === "myeonbok")
    return [-1, 1]
      .map(
        (side) =>
          `<g transform="translate(${f.x + side * f.t.w * 0.4} ${f.t.y + 12 * f.unit}) scale(${f.unit * 0.6})" fill="none" stroke="${s.layer}" stroke-width="1.6" stroke-linecap="round"><path d="M-8 5Q-13-5-4-9Q5-12 9-4Q13 2 5 6Q-2 9-4 3Q-6-2 1-3M-5-7L-10-10M3-8L5-12M6 4L11 8M-2 5L-7 10"/><path d="M-8 1L-13 2M4-2L10-4" stroke="#8A9C69"/></g>`,
      )
      .join("");
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
