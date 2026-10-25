"use strict";

function everydayGarment(s, n, base) {
  const type = n.garment.everyday;
  if (!type) return null;
  const id = "daily" + ++garmentSerial;
  const inverted = Math.abs(window.ART_LAYOUT[n.pose].angle || 0) > 90;
  const nativeFrame = garmentFrame(n.pose);
  const f = inverted ? invertedGarmentFrame(nativeFrame) : nativeFrame;
  const bodice = garmentPaths(base, "chima_baeja", "layer");
  const top = garmentPaths(base, n.cloth, "top"),
    bottom =
      n.cloth === "chima"
        ? skirtContour(n.pose, base)
        : garmentPaths(base, n.cloth, "bottom");
  if (type === "shortskirt")
    return shortenedSkirt(s, n, base, nativeFrame, id, top, bottom);
  const skirt = n.cloth === "chima";
  let art = skirt
    ? `<g fill="${s.bottom}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}">${bottom}</g><g fill="${s.top}">${top}</g>`
    : colorVector(base + `clothes/${n.cloth}_fill.svg`, s);
  art += `<image href="${imageAsset(base + `clothes/${n.cloth}_overlay@2x.png`)}" width="360" height="360" ${skirt ? `mask="url(#${id}-native-upper)"` : ""}/>`;
  art += `<defs>${skirtInkDefs(n.pose, base, id)}<mask id="${id}-native-upper" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360">${skirtInkRegions(n.pose, base, id, true)}</mask><clipPath id="${id}-body">${top}${bottom}</clipPath><clipPath id="${id}-bottom">${bottom}</clipPath>
    <mask id="${id}-front" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white">${bottom}</g><g fill="black" stroke="black" stroke-width="2">${top}</g><g fill="white">${bodice}</g></mask>
    <mask id="${id}-panel-visible" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black">${top}</g><path d="${GARMENT_HAND_OPENINGS[n.pose] || ""}" fill="black" stroke="black" stroke-width="3"/></mask>
    ${garmentForegroundFilter(id)}</defs>`;
  let details = "";
  if (type === "vest") {
    details += `<g fill="${s.layer}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}">${garmentPaths(base, "chima_baeja", "layer")}</g>`;
    details += `<image href="${imageAsset(base + "clothes/chima_baeja_overlay@2x.png")}" width="360" height="360"/>`;
  }
  if (skirt) art += skirtFloorPleats(n.pose, base);
  art += `<g clip-path="url(#${id}-body)" mask="url(#${id}-front)">${inverted && type !== "vest" ? `<g transform="rotate(180 180 180)">${details}</g>` : details}</g>`;
  if (["apron", "work-apron"].includes(type))
    art += garmentFrontCloth(s, n, nativeFrame, id, true);
  art += `<image href="${imageAsset(base + `clothes/${n.cloth}_overlay@2x.png`)}" width="360" height="360" filter="url(#${id}-props)"/>`;
  return garmentInk(art);
}

function shortenedSkirt(s, n, base, f, id, top, bottom) {
  const pants = garmentPaths(base, "baji", "bottom");
  const overlay = imageAsset(base + "clothes/chima_overlay@2x.png");
  const upright = [
    "holding_fan_01",
    "holding_fan_03",
    "trudging_01",
    "trudging_03",
    "dancing_05",
    "posing_01",
  ].includes(n.pose);
  const scale = upright ? 0.78 : 1;
  return garmentInk(`<defs>${skirtInkDefs(n.pose, base, id)}${garmentForegroundFilter(id)}
    <mask id="${id}-skirt" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="3">${bottom}</g></mask>
    <mask id="${id}-pants" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="3">${pants}</g></mask>
    <mask id="${id}-upper" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="3">${bottom}</g><g fill="white" stroke="white" stroke-width="3">${top}</g></mask>
  </defs><g fill="#F6F2E7">${pants}</g>
  <image href="${imageAsset(base + "clothes/baji_overlay@2x.png")}" width="360" height="360" mask="url(#${id}-pants)"/>
  <g transform="translate(0 ${f.b.y}) scale(1 ${scale}) translate(0 ${-f.b.y})"><g fill="${s.bottom}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}">${bottom}</g><image href="${overlay}" width="360" height="360" mask="url(#${id}-skirt-creases)"/>${skirtFloorPleats(n.pose, base)}</g>
  <g fill="${s.top}">${top}</g><image href="${overlay}" width="360" height="360" mask="url(#${id}-upper)"/><image href="${overlay}" width="360" height="360" filter="url(#${id}-props)"/>`);
}
