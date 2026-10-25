"use strict";

function robeDetails(s, kind, f, pattern, sleeveClip) {
  const { t, b, x, y, waist, hem, unit: u } = f;
  let art = "";
  if (kind === "dangui") {
    art += `<g opacity=".55" color="#E1C983"><g transform="translate(${x - 8 * u} ${waist + 21 * u}) scale(.65)">${phoenixMedallion()}</g><g transform="translate(${x + 12 * u} ${waist - 13 * u}) scale(.6)">${phoenixMedallion()}</g></g>`;
  }
  if (["wonsam", "hwarot", "noui"].includes(kind)) {
    art += garmentBelt(f, s.layer, kind !== "wonsam");
    art += `<path d="M${x} ${waist + 8 * u}L${x - 8 * u} ${hem - 5}L${x + 5 * u} ${hem - 3}L${x + 5 * u} ${waist + 7 * u}Z" fill="${s.layer}" stroke="#453D32" stroke-width=".7"/>`;
  }
  if (["dragon", "official"].includes(kind))
    art += garmentBelt(f, "#343839", true);
  if (kind === "student") {
    art += `<path d="M${t.x + 12 * u} ${t.y}L${t.x + 5 * u} ${hem}M${t.x + t.w - 12 * u} ${t.y}L${t.x + t.w - 5 * u} ${hem}" fill="none" stroke="${s.layer}" stroke-width="${8 * u}"/>`;
    art += garmentBelt(f, s.layer);
  }
  if (kind === "dopo")
    art += garmentRibbon({ ...f, y: waist - 4 * u }, s.layer, true);
  if (kind === "graduate")
    art += garmentRibbon({ ...f, y: waist - 4 * u }, s.layer, true);
  if (kind === "military") {
    art += garmentBelt(f, s.layer);
    art += `<path d="M${x - 5 * u} ${waist}L${x - 22 * u} ${waist + 42 * u}L${x - 15 * u} ${waist + 44 * u}L${x} ${waist}" fill="${s.layer}"/>`;
  }
  art += courtGarmentDetails(s, kind, f);
  art += rankBadge(f, kind, s.layer, s.outfit === "prince");
  if (["jeogori", "dangui", "samhoejang"].includes(kind))
    art += garmentRibbon(f, s.layer, kind === "dangui");
  return art;
}
