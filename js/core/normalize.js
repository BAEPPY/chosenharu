"use strict";

function normalize(v) {
  const n = { ...DEFAULT };
  if (!v || typeof v !== "object") return n;
  for (const key of ["id", "name", "place", "story", "imagination"])
    if (typeof v[key] === "string")
      n[key] = v[key].slice(
        0,
        key === "id" ? 100 : key === "name" ? 24 : key === "place" ? 60 : 600,
      );
  const aliases = {
    양반: "yangban",
    중인: "technical",
    상민: "common",
    천인: "low",
    천민: "low",
  };
  n.status = L.statuses.some((x) => x.id === v.status)
    ? v.status
    : aliases[v.status] || "";
  if (["male", "female"].includes(v.gender)) n.gender = v.gender;
  const allowed = rolesFor(n);
  n.role = allowed.some((x) => x.id === v.role)
    ? v.role
    : allowed[0]?.id || "farmer";
  n.outfit = outfitsFor(n).some((x) => x.id === v.outfit)
    ? v.outfit
    : roleOf(n)?.outfit || "daily";
  n.pose = posesFor(n).some((x) => x.alias === v.pose)
    ? v.pose
    : roleOf(n)?.pose || "farming";
  if (!posesFor(n).some((x) => x.alias === n.pose)) n.pose = "study";
  for (const [k, list] of [
    ["hair", hairsFor()],
    ["cloth", D.clothes],
    ["emotion", D.emotions],
  ])
    if (list.some((x) => x.alias === v[k])) n[k] = v[k];
  if (Number.isInteger(v.skin) && v.skin >= 0 && v.skin < 5) n.skin = v.skin;
  for (const key of ["hairColor", "top", "bottom", "layer"])
    if (/^#[\da-f]{6}$/i.test(v[key] || "")) n[key] = v[key];
  if (
    L.figures.some(
      (f) =>
        f.id === v.figure && f.status === n.status && f.gender === n.gender,
    )
  )
    n.figure = v.figure;
  if (n.status === "royal") {
    const f =
      figureOf(n) ||
      L.figures.find((f) => f.status === "royal" && f.gender === n.gender);
    n.figure = f.id;
    n.name = f.name;
    n.role = f.role;
    if (!outfitsFor(n).some((o) => o.id === n.outfit))
      n.outfit = roleOf(n).outfit;
  }
  // Old untouched palettes shared the same brown vest for every outfit.
  if (
    !v.outfitVersion &&
    n.outfit !== "daily" &&
    n.top.toUpperCase() === DEFAULT.top &&
    n.bottom.toUpperCase() === DEFAULT.bottom &&
    n.layer.toUpperCase() === DEFAULT.layer.toUpperCase()
  ) {
    [n.top, n.bottom, n.layer] = window.GARMENTS[n.outfit].colors;
  }
  n.outfitVersion = 1;
  return n;
}
