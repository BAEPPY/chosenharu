"use strict";

function tailoredGarment(s, n, base) {
  const kind = n.garment.kind;
  if (!kind) return null;
  if (["dangui", "jeogori", "samhoejang"].includes(kind))
    return nativeJeogori(s, n, base);
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
  const lowerCloth = feminine ? "chima" : n.cloth;
  const bottom =
    lowerCloth === "chima"
      ? skirtContour(n.pose, base)
      : garmentPaths(base, lowerCloth, "bottom");
  const bodice = garmentPaths(
    base,
    n.cloth === "chima" ? "chima_baeja" : "dopo_baeja",
    "layer",
  );
  const nativeTop =
    garmentPaths(base, n.cloth, "top") +
    (n.cloth === "dopo_baeja" ? bodice : "");
  const lowerTop = garmentPaths(base, lowerCloth, "top");
  const shortCoat =
    longCoat &&
    garmentCoatShape(
      bottom,
      f,
      kind,
      ["holding_fan_01", "holding_fan_03", "dancing_05", "posing_01"].includes(
        n.pose,
      ),
    );
  const body = garmentPaths(base, "chima_baeja", "layer");
  const inverted = Math.abs(window.ART_LAYOUT[n.pose].angle || 0) > 90;
  const surface = nativeTop + (shortCoat || "");
  const native = imageAsset(base + `clothes/${n.cloth}_overlay@2x.png`);
  const defs = `<defs>
    ${skirtInkDefs(n.pose, base, id)}
    <mask id="${id}-hem-band" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white">${bottom}</g><g fill="black">${shortCoat || bottom}</g></mask>
    <clipPath id="${id}-hem"><rect y="${f.b.y + f.b.h * 0.55}" width="360" height="360"/></clipPath>
    <clipPath id="${id}-top">${surface}</clipPath>
    <clipPath id="${id}-bottom">${bottom}</clipPath>
    <clipPath id="${id}-sleeves">${nativeTop}</clipPath>
    <clipPath id="${id}-lower-seams">${garmentPaths(base, "chima", "bottom")}</clipPath>

    <filter id="${id}-join-front" x="-5%" y="-5%" width="110%" height="110%"><feMorphology operator="dilate" radius="5 0"/><feMorphology operator="erode" radius="5 0"/></filter>
    <mask id="${id}-bodice" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360">${n.cloth === "chima" ? `<g fill="white">${bottom}</g><g fill="black" stroke="black" stroke-width="2">${nativeTop}</g>` : ""}<g fill="white" filter="url(#${id}-join-front)">${bodice}</g></mask>
    <mask id="${id}-lower" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="3">${lowerTop}</g></mask>
    <filter id="${id}-ink-inset"><feMorphology operator="erode" radius="1.5"/></filter>
    <filter id="${id}-solid-bodice" x="-10%" y="-10%" width="120%" height="120%"><feMorphology operator="dilate" radius="7 0"/><feMorphology operator="erode" radius="7 0"/><feMorphology operator="erode" radius="2"/></filter>
    <mask id="${id}-native-arms" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="12">${nativeTop}</g>${n.cloth === "chima" ? `<g filter="url(#${id}-ink-inset)"><rect width="360" height="360" fill="black" mask="url(#${id}-bodice)"/></g>` : `<g fill="black" filter="url(#${id}-solid-bodice)">${bodice}</g>`}${garmentOldCollarMask(n.pose)}</mask>
    <mask id="${id}-lower-clear" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="18">${garmentPaths(base, "chima", "top")}</g></mask>
    <mask id="${id}-arms" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><g fill="black" stroke="black" stroke-width="7">${body}${bottom}</g></mask>
    <filter id="${id}-outline" x="-5%" y="-5%" width="110%" height="110%"><feMorphology in="SourceAlpha" operator="dilate" radius="1" result="edge"/><feFlood flood-color="${GARMENT_INK.color}"/><feComposite in2="edge" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <mask id="${id}-panel-sleeves" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white">${garmentPaths(base, "chima", "top")}</g><g fill="black" filter="url(#${id}-join-front)">${body}</g></mask>
    <mask id="${id}-panel-visible" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><rect width="360" height="360" fill="white"/><rect width="360" height="360" fill="black" mask="url(#${id}-panel-sleeves)"/><path d="${GARMENT_HAND_OPENINGS[n.pose] || ""}" fill="black" stroke="black" stroke-width="3"/></mask>
    <filter id="${id}-near-wrist"><feMorphology operator="dilate" radius="23"/></filter>
    <mask id="${id}-wide-arm-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white">${nativeTop}</g><g fill="black" stroke="black" stroke-width="6">${bodice}</g></mask>
    <mask id="${id}-panel-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white" stroke="white" stroke-width="8">${garmentPaths(base, "chima", "top")}</g><path d="${GARMENT_HAND_OPENINGS[n.pose] || ""}" fill="white" filter="url(#${id}-near-wrist)"/>${kind === "myeonbok" ? "" : `<rect width="360" height="360" fill="white" mask="url(#${id}-wide-arm-ink)"/>`}</mask>
    <mask id="${id}-sleeve-only" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white">${nativeTop}</g><g fill="black" filter="url(#${id}-join-front)">${bodice}</g></mask>

    ${garmentNeckDefs(id, n, base)}
    ${garmentForegroundFilter(id)}
    ${garmentPattern(id + "-pattern", kind, s.layer)}
  </defs>`;
  let art =
    defs +
    `<g fill="${kind === "myeonbok" ? "#FFF9EA" : s.bottom}" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}" stroke-linejoin="round">${bottom}</g>`;

  art += garmentLowerInk(base, lowerCloth, id);
  // Skirt construction belongs below the coat, while sleeve contours and hands
  // belong above it. Never crop the entire figure at a horizontal hem line.
  art += `<g><g fill="${s.top}" filter="url(#${id}-outline)">${shortCoat || ""}${nativeTop}</g>`;
  const detailsFrame = inverted ? invertedGarmentFrame(f) : f;
  const transform = inverted ? 'transform="rotate(180 180 180)"' : "";
  const details = robeDetails(
    s,
    kind,
    detailsFrame,
    id + "-pattern",
    id + "-sleeves",
  );
  art += `<g clip-path="url(#${id}-top)">
    ${garmentSurface(s, kind, detailsFrame, id + "-pattern", id)}
    ${n.cloth === "dopo_baeja" ? `<g mask="url(#${id}-lower-clear)"><image href="${imageAsset(base + "clothes/chima_overlay@2x.png")}" width="360" height="360" mask="url(#${id}-skirt-creases)"/></g>` : ""}
    <g mask="url(#${id}-bodice)"><g ${transform}>${details}</g></g>
    <g ${transform}>${courtShoulders(s, kind, detailsFrame)}</g>
  </g>`;
  if (shortCoat) {
    art += `<g mask="url(#${id}-hem-band)"><g fill="${s.bottom}">${bottom}</g>${garmentLowerInk(base, lowerCloth, id)}</g>`;
    art += `<g clip-path="url(#${id}-hem)" fill="none" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.outline}" stroke-linejoin="round">${shortCoat}</g>`;
  }
  art += `</g>`;
  art += garmentFrontCloth(s, n, f, id);
  if (["wonsam", "noui"].includes(kind))
    art += garmentHandCuffs(n.pose, kind, id, s.layer);
  art += `${n.cloth === "dopo_baeja" ? `<g mask="url(#${id}-panel-ink)">` : ""}<image href="${native}" width="360" height="360" mask="url(#${id}-native-arms)"/>${n.cloth === "dopo_baeja" ? "</g>" : ""}`;
  art += garmentNeckline(s, n, base, id);

  art += `<image href="${native}" width="360" height="360" filter="url(#${id}-props)"/>`;
  return garmentInk(art);
}
