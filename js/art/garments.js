"use strict";

function tailoredGarment(s, n, base) {
  const kind = n.garment.kind;
  if (!kind) return null;
  const f = garmentFrame(n.pose),
    id = "garment" + ++garmentSerial;
  const feminine = [
    "jeogori",
    "samhoejang",
    "dangui",
    "hwarot",
    "wonsam",
    "noui",
  ].includes(kind);
  const longCoat = ["hwarot", "wonsam", "noui"].includes(kind);
  const nativeBottom = garmentPaths(
    base,
    feminine ? "chima" : n.cloth,
    "bottom",
  );
  const standing = f.b.h > f.b.w * 0.75 && f.t.y < f.b.y;
  const spread = feminine && standing ? (longCoat ? 1.4 : 1.18) : 1;
  const center = f.b.x + f.b.w / 2;
  const bottom =
    spread === 1
      ? nativeBottom
      : `<g transform="translate(${center} 0) scale(${spread} 1) translate(${-center} 0)">${nativeBottom}</g>`;
  const nativeTop = garmentPaths(base, n.cloth, "top");
  const coatHem = f.hem - f.b.h * (kind === "noui" ? 0.25 : 0.14);
  const top =
    longCoat && standing
      ? `<g clip-path="url(#${id}-coat)">${nativeTop}</g>`
      : nativeTop;
  const robe = garmentPaths(base, "dopo_baeja", "top");
  const body = garmentPaths(base, "chima_baeja", "layer");
  const bodice = garmentPaths(base, "dopo_baeja", "layer");
  const inverted = Math.abs(window.ART_LAYOUT[n.pose].angle || 0) > 90;
  const upperInk = inverted
    ? `<rect width="360" height="${f.t.y - 25}" fill="black"/>`
    : `<rect y="${f.t.y + f.t.h + 30}" width="360" height="360" fill="black"/>`;
  const surface = kind === "dangui" ? robe : nativeTop;
  // Preserve the original hands, feet and objects; replace only cloth pixels.
  const native = imageAsset(base + `clothes/${n.cloth}_overlay@2x.png`);
  const defs = `<defs>
    <clipPath id="${id}-coat"><rect width="360" height="${coatHem}"/></clipPath>
    <clipPath id="${id}-top">${surface}</clipPath>
    <clipPath id="${id}-bottom">${bottom}</clipPath>
    <clipPath id="${id}-sleeves">${nativeTop}</clipPath>
    <mask id="${id}-bodice" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="3">${bodice}</g></mask>
    <mask id="${id}-native-arms" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="4">${bodice}${nativeBottom}</g>${upperInk}</mask>
    ${garmentForegroundFilter(id)}
    <mask id="${id}-outside" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="2">${nativeTop}${nativeBottom}</g></mask>
    <mask id="${id}-arms" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="7">${body}${bottom}</g></mask>
    ${garmentPattern(id + "-pattern", kind, s.layer)}
  </defs>`;
  let art =
    defs +
    `<g fill="${s.bottom}" stroke="#453D32" stroke-width="1.15" stroke-linejoin="round">${bottom}</g>`;
  art += `<g clip-path="url(#${id}-bottom)">${skirtFolds(f)}</g>`;
  if (["dangui", "hwarot", "wonsam", "noui"].includes(kind))
    art += `<g clip-path="url(#${id}-bottom)"><path d="M0 ${f.hem - 15}H360" stroke="${s.layer}" stroke-width="2"/><path d="M0 ${f.hem - 6}H360" stroke="${s.layer}" stroke-width="3"/></g>`;
  art += `<g fill="${s.top}" stroke="#453D32" stroke-width="1.2" stroke-linejoin="round">${top}</g>`;
  // Keep sleeve bands separate from the bodice and skirt in all native poses.

  const detailsFrame = inverted ? invertedGarmentFrame(f) : f;
  const details = robeDetails(
    s,
    kind,
    detailsFrame,
    id + "-pattern",
    id + "-sleeves",
  );
  // Clip front construction to the bodice; sleeves and props have their own layers.
  const transform = inverted ? 'transform="rotate(180 180 180)"' : "";
  art += `<g ${longCoat && standing ? `clip-path="url(#${id}-coat)"` : ""}><g clip-path="url(#${id}-top)">
    ${garmentSurface(s, kind, detailsFrame, id + "-pattern", id)}
    <g mask="url(#${id}-bodice)"><g ${transform}>${details}</g></g>
    <g ${transform}>${courtShoulders(s, kind, detailsFrame)}</g>
  </g></g>`;
  art += `<image href="${native}" width="360" height="360" mask="url(#${id}-native-arms)"/>`;
  art += garmentSleeveTrim(s, n, id);
  art += ceremonialCuffs(n.pose, kind, id + "-pattern");
  art += `<image href="${native}" width="360" height="360" filter="url(#${id}-props)"/>`;
  return garmentInk(art);
}
