"use strict";

function robeDetails(s, kind, f, pattern, sleeveClip) {
  const { t, b, x, y, waist, hem, unit: u } = f;
  let art = "";
  if (kind === "noui") {
    art += `<path d="M${x - 12 * u} ${t.y + 6}L${x - 18 * u} ${hem}H${x + 19 * u}L${x + 12 * u} ${t.y + 6}Z" fill="${s.bottom}"/>
      <path d="M${x - 12 * u} ${t.y + 6}L${x - 18 * u} ${hem}M${x + 12 * u} ${t.y + 6}L${x + 19 * u} ${hem}" fill="none" stroke="${s.layer}" stroke-width="2"/>
      <rect x="${x - 19 * u}" y="${y + 20}" width="${38 * u}" height="${Math.max(1, hem - y - 20)}" fill="url(#${pattern})"/>`;
  }
  if (kind === "dangui") {
    art += `<path d="M${t.x + 2} ${waist - 15 * u}Q${t.x - 6 * u} ${waist + 12 * u} ${t.x + 12 * u} ${waist + 37 * u}Q${x} ${waist + 50 * u} ${x + 22 * u} ${waist + 28 * u}L${x + 26 * u} ${waist - 15 * u}Z" fill="${s.top}"/>
      <path d="M${t.x + 2} ${waist - 15 * u}Q${t.x - 6 * u} ${waist + 12 * u} ${t.x + 12 * u} ${waist + 37 * u}Q${x} ${waist + 50 * u} ${x + 22 * u} ${waist + 28 * u}" fill="none" stroke="#453D32" stroke-width="1.2"/>
      <g opacity=".55" color="#E1C983"><g transform="translate(${x - 8 * u} ${waist + 21 * u}) scale(.65)">${phoenixMedallion()}</g><g transform="translate(${x + 12 * u} ${waist - 13 * u}) scale(.6)">${phoenixMedallion()}</g></g>`;
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
    art += skirtFolds(
      { ...f, b: { ...b, y: waist + 6, h: Math.max(1, hem - waist - 6) } },
      true,
    );
    art += `<path d="M${x - 5 * u} ${waist}L${x - 22 * u} ${waist + 42 * u}L${x - 15 * u} ${waist + 44 * u}L${x} ${waist}" fill="${s.layer}"/>`;
  }
  if (!["jeogori", "samhoejang", "dangui"].includes(kind)) {
    art += `<g fill="none" stroke="${GARMENT_INK.color}" stroke-width="${GARMENT_INK.seam}" opacity=".35">${[-1, 0, 1].map((side) => `<path d="M${x + side * 18 * u} ${waist + 11 * u}Q${x + side * 25 * u} ${(waist + hem) / 2} ${x + side * 30 * u} ${hem - 5}"/>`).join("")}</g>`;
  }
  art += courtGarmentDetails(s, kind, f);
  art += garmentCollar(f, "#FFF9EA", ["dragon", "official"].includes(kind));
  art += rankBadge(f, kind, s.layer, s.outfit === "prince");
  if (["jeogori", "dangui", "samhoejang"].includes(kind))
    art += garmentRibbon(f, s.layer, kind === "dangui");
  if (kind === "samhoejang") art += garmentCollar(f, s.layer);
  return art;
}
