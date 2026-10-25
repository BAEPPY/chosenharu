"use strict";

const NATIVE_POSE = {
  audience: "holding_fan_03",
  study: "reading_writing_01",
  writing: "reading_writing_03",
  guard: "trudging_01",
  celebrate: "holding_fan_02",
  garden: "holding_fan_01",
  medicine: "reading_writing_03",
  farming: "sitting_01",
  market: "trudging_01",
  carrying: "trudging_01",
  performance: "dancing_hansam_02",
};

function nativeLook(s) {
  const pose = NATIVE_POSE[s.pose] || s.pose;
  const garment = window.GARMENTS[s.outfit] || window.GARMENTS.daily;
  const hair = ["ikseongwan", "samo", "myeonryugwan", "tanggeon"].includes(
    s.hair,
  )
    ? "short_hair"
    : s.hair;
  return {
    pose,
    cloth: garment.cloth || s.cloth,
    hair,
    palette: { ...s },
    garment,
  };
}
