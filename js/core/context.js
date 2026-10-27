"use strict";

const D = window.CATALOG,
  A = window.ASSET_DATA,
  L = window.LESSON,
  $ = (s) => document.querySelector(s);

const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

const choose = (a) => a[Math.floor(Math.random() * a.length)],
  uid = () =>
    crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now() + "-" + Math.random().toString(36).slice(2);

const FLOW = Object.freeze({
  STATUS: 0,
  POSE: 1,
  IDENTITY: 2,
  LOOK: 3,
  STORY: 4,
  CARD: 5,
  BOARD: 6,
});
const FLOW_VERSION = 3;
let restoredLegacyFlow = false;

const DEFAULT = {
  id: "",
  status: "",
  gender: "male",
  name: "",
  figure: "",
  role: "farmer",
  outfit: "daily",
  pose: "holding_fan_03",
  poseConfirmed: false,
  hair: "sangtu",
  cloth: "baji",
  emotion: "smiling",
  skin: 2,
  hairColor: "#1F1814",
  top: "#FFFFFF",
  bottom: "#6A5BA8",
  layer: "#BD8A63",
  place: "",
  story: "",
  imagination: "",
  scene: "",
  scenePose: "",
};

const statusOf = (s) => L.statuses.find((x) => x.id === s.status),
  roleOf = (s) => L.roles.find((x) => x.id === s.role),
  figureOf = (s) => L.figures.find((x) => x.id === s.figure);

const rolesFor = (s) =>
  L.roles.filter(
    (r) =>
      r.status === s.status && (r.gender === "any" || r.gender === s.gender),
  );

const outfitsFor = (s) => L.outfits;

function recommendedOutfits(s) {
  const role = rolesFor(s).find((r) => r.id === s.role);
  return role ? window.OUTFIT_SUGGESTIONS[role.id]?.[s.gender] || [] : [];
}

const hairsFor = () => [
  ...L.headgear,
  ...D.hairs.filter((h) => h.alias !== "jjimjilbang_yangmeori"),
];

const posesFor = (s) => [...L.poses, ...D.lessonPoses];

let state = { ...DEFAULT },
  saved = [],
  board = [],
  weights = L.statuses.map((x) => x.weight),
  draws = 0,
  drawHistory = [],
  selectedDraw = -1,
  step = 0,
  returnStep = 0,
  styleTab = "outfit",
  landing = !window.location.hash || window.location.hash === "#home",
  spinning = false,
  rotation = 0,
  selectedBoard = "",
  undo = [];

const KEY = "joseon-classroom-v2";
