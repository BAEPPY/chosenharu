"use strict";

// Silhouette, construction and starting colors are independent of identity.
window.GARMENTS = {
  daily: { cloth: null, colors: ["#FFFFFF", "#6A5BA8", "#BD8A63"] },
  work: {
    cloth: "baji",
    everyday: "work",
    colors: ["#DDE7E7", "#69798A", "#4F6972"],
  },
  vest: {
    cloth: "baji",
    everyday: "vest",
    colors: ["#D9C9BB", "#7F685B", "#9BAFB8"],
  },
  apron: {
    cloth: "chima",
    everyday: "apron",
    colors: ["#D9B4AB", "#8F9F6D", "#FFF9EA"],
  },
  work_skirt: {
    cloth: "chima",
    everyday: "shortskirt",
    colors: ["#C4B1B3", "#697A88", "#72808C"],
  },
  work_apron: {
    cloth: "baji",
    everyday: "work-apron",
    colors: ["#B9A78E", "#DDE0D5", "#776453"],
  },
  emperor: {
    cloth: "dopo_baeja",
    kind: "dragon",
    colors: ["#E3BE51", "#C6573D", "#B58B35"],
  },
  myeonbok: {
    cloth: "dopo_baeja",
    kind: "myeonbok",
    colors: ["#272C32", "#AF3942", "#D6B85C"],
  },
  scholar: {
    cloth: "dopo_baeja",
    kind: "dopo",
    colors: ["#DDE7E7", "#FFFFFF", "#384D59"],
  },
  official: {
    cloth: "dopo_baeja",
    kind: "official",
    colors: ["#006B87", "#FFFFFF", "#262C30"],
  },
  military: {
    cloth: "dopo_baeja",
    kind: "military",
    colors: ["#682325", "#FFFFFF", "#303B50"],
  },
  student: {
    cloth: "dopo_baeja",
    kind: "student",
    colors: ["#C6DDE5", "#FFFFFF", "#2D4664"],
  },
  graduate: {
    cloth: "dopo_baeja",
    kind: "graduate",
    colors: ["#E9D975", "#FFFFFF", "#7C9C62"],
  },
  yangbanwoman: {
    cloth: "chima",
    kind: "jeogori",
    colors: ["#9ED6C0", "#B82647", "#6D1B43"],
  },
  royal: {
    cloth: "dopo_baeja",
    kind: "dragon",
    colors: ["#B82647", "#FFFFFF", "#D8B45F"],
  },
  prince: {
    cloth: "dopo_baeja",
    kind: "dragon",
    colors: ["#2D4D80", "#FFFFFF", "#D8B45F"],
  },
  queen: {
    cloth: "chima",
    kind: "dangui",
    colors: ["#9DB881", "#2D4263", "#6D1B43"],
  },
  princess: {
    cloth: "dopo_baeja",
    kind: "hwarot",
    colors: ["#C43C44", "#B82647", "#D8B45F"],
  },
  wonsam: {
    cloth: "dopo_baeja",
    kind: "wonsam",
    colors: ["#417141", "#B82647", "#C23352"],
  },
  noui: {
    cloth: "dopo_baeja",
    kind: "noui",
    colors: ["#B82647", "#244C83", "#D8B45F"],
  },
  saenggaksi: {
    cloth: "chima",
    kind: "samhoejang",
    colors: ["#F6CF7A", "#B82647", "#6D1B43"],
  },
  gisaeng: {
    cloth: "chima",
    kind: "samhoejang",
    colors: ["#F3E59F", "#427ABA", "#244C83"],
  },
  performer: { cloth: "pungmulbok", colors: ["#FFFFFF", "#FFFFFF", "#15719A"] },
  dance_robe: {
    cloth: "hwangchosam",
    colors: ["#F6CF7A", "#B82647", "#D8B45F"],
  },
  palace: {
    cloth: "chima",
    everyday: "apron",
    colors: ["#A9CBB3", "#293F66", "#FFF9EA"],
  },
};

function outfitState(s, outfit) {
  if (s.outfit === outfit) return { ...s };
  const [top, bottom, layer] = window.GARMENTS[outfit].colors;
  return { ...s, outfit, top, bottom, layer, outfitVersion: 1 };
}
