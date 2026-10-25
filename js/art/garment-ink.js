"use strict";

// Match the native 360px artwork: strong contours, lighter seams and embroidery.
const GARMENT_INK = Object.freeze({
  color: "#332D29",
  outline: 2,
  seam: 1.3,
  detail: 0.9,
});

function garmentInk(svg) {
  return svg
    .replace(
      /stroke="#(?:453D32|3D3530|46372F|413A33)"/g,
      `stroke="${GARMENT_INK.color}"`,
    )
    .replace(
      /stroke-width="(?:1\.15|1\.2)"/g,
      `stroke-width="${GARMENT_INK.outline}"`,
    )
    .replace(
      /stroke-width="(?:\.7|\.8|\.85)"/g,
      `stroke-width="${GARMENT_INK.seam}"`,
    );
}
