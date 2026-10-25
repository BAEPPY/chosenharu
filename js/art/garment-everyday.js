"use strict";

function everydayGarment(s, n, base) {
  const type = n.garment.everyday;
  if (!type) return null;
  const id = "daily" + ++garmentSerial,
    f = garmentFrame(n.pose);
  const { b, t, x, hem, unit: u } = f;
  const waist = b.y + 7;
  const waistFrame = { ...f, waist };
  const bodice = garmentPaths(base, "dopo_baeja", "layer");
  const top = garmentPaths(base, n.cloth, "top"),
    bottom = garmentPaths(base, n.cloth, "bottom");
  if (type === "shortskirt")
    return shortenedSkirt(s, n, base, f, id, top, bottom);
  let art = colorVector(base + `clothes/${n.cloth}_fill.svg`, s);
  art += `<image href="${imageAsset(base + `clothes/${n.cloth}_overlay@2x.png`)}" width="360" height="360"/>`;
  art += `<defs><clipPath id="${id}-body">${top}${bottom}</clipPath><clipPath id="${id}-bottom">${bottom}</clipPath>
    <mask id="${id}-front" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="3">${bodice}${bottom}</g></mask>
    ${garmentForegroundFilter(id)}</defs>`;
  let details = "";
  if (type === "vest") {
    details += `<g fill="${s.layer}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}">${garmentPaths(base, "chima_baeja", "layer")}</g>`;
    details += `<path d="M${x} ${t.y + 30 * u}L${x} ${waist + 4 * u}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}"/><circle cx="${x}" cy="${waist - 10 * u}" r="2" fill="#333333"/>`;
  }
  if (["apron", "work-apron"].includes(type)) {
    const bib = type === "work-apron";
    details += garmentBelt(waistFrame, s.layer);
    details += `<path d="M${b.x + b.w * 0.18} ${b.y + 8}Q${x} ${b.y + 15} ${b.x + b.w * 0.83} ${b.y + 8}L${b.x + b.w * 0.9} ${hem - 12}Q${x} ${hem - 3} ${b.x + b.w * 0.1} ${hem - 12}Z" fill="${s.layer}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}"/>`;
    if (bib)
      details += `<path d="M${x - 18 * u} ${waist + 2 * u}L${x - 15 * u} ${t.y + 32 * u}H${x + 18 * u}L${x + 21 * u} ${waist + 2 * u}Z" fill="${s.layer}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}"/>`;
    details += `<path d="M${x - 12 * u} ${waist + 16 * u}L${x - 16 * u} ${hem - 20}M${x + 14 * u} ${waist + 15 * u}L${x + 19 * u} ${hem - 19}" fill="none" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}" opacity=".5"/>`;
  }
  if (type === "work")
    details += garmentRibbon({ ...f, y: f.y + 8 * u }, s.layer);
  art += `<g clip-path="url(#${id}-body)" mask="url(#${id}-front)">${details}</g>`;
  art += `<image href="${imageAsset(base + `clothes/${n.cloth}_overlay@2x.png`)}" width="360" height="360" filter="url(#${id}-props)"/>`;
  return garmentInk(art);
}

function shortenedSkirt(s, n, base, f, id, top, bottom) {
  const pants = garmentPaths(base, "baji", "bottom");
  const overlay = imageAsset(base + "clothes/chima_overlay@2x.png");
  const scale = f.b.h > 70 ? 0.78 : 0.88;
  return garmentInk(`<defs>
    <mask id="${id}-skirt" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="3">${bottom}</g></mask>
    <mask id="${id}-pants" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="3">${pants}</g></mask>
    <mask id="${id}-upper" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="3">${bottom}</g></mask>
  </defs><g fill="#F6F2E7">${pants}</g>
  <image href="${imageAsset(base + "clothes/baji_overlay@2x.png")}" width="360" height="360" mask="url(#${id}-pants)"/>
  <g transform="translate(0 ${f.b.y}) scale(1 ${scale}) translate(0 ${-f.b.y})"><g fill="${s.bottom}">${bottom}</g><image href="${overlay}" width="360" height="360" mask="url(#${id}-skirt)"/></g>
  <g fill="${s.top}">${top}</g><image href="${overlay}" width="360" height="360" mask="url(#${id}-upper)"/>`);
}
