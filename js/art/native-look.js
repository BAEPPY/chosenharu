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
  let cloth = s.cloth,
    hair = s.hair,
    palette = { ...s };
  if (
    ["royal", "prince", "official", "scholar", "student", "graduate"].includes(
      s.outfit,
    )
  )
    cloth = "dopo_baeja";
  if (s.outfit === "military") cloth = "pojolbok";
  if (["queen", "princess", "yangbanwoman"].includes(s.outfit))
    cloth = "chima_baeja";
  if (s.outfit === "performer") cloth = "pungmulbok";
  if (s.outfit === "dance_robe") cloth = "hwangchosam";
  if (s.outfit === "palace") cloth = "nainbok";
  if (["ikseongwan", "samo"].includes(s.hair)) hair = "short_hair";
  return { pose, cloth, hair, palette };
}
