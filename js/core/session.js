"use strict";

const SESSION_KEY = KEY + "-activity";
const SESSION_IDLE_MS = 60 * 60 * 1000;
let sessionEpoch = "",
  sessionActivity = null,
  sessionBound = false;

function readActivity() {
  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (
      value &&
      typeof value.epoch === "string" &&
      Number.isFinite(value.lastActiveAt)
    )
      return value;
  } catch {}
  return sessionActivity;
}

function writeActivity(value) {
  sessionActivity = value;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(value));
  } catch {}
}

function resetActivityState() {
  state = { ...DEFAULT };
  saved = [];
  board = [];
  weights = L.statuses.map((s) => s.weight);
  draws = 0;
  drawHistory = [];
  selectedDraw = -1;
  step = returnStep = 0;
  landing = true;
  spinning = false;
  rotation = 0;
  selectedBoard = "";
  styleTab = "outfit";
  undo = [];
  restoredLegacyFlow = false;
  window.history.replaceState({}, "", "#home");
  if (sessionBound) {
    $("#modal")?.close();
    render();
    toast("1시간 동안 이용하지 않아 처음 화면으로 돌아왔어요.");
  }
}

function openSession() {
  const now = Date.now(),
    activity = readActivity();
  if (activity && now - activity.lastActiveAt >= SESSION_IDLE_MS) {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem("joseon-records");
    } catch {}
    resetActivityState();
    sessionEpoch = uid();
  } else sessionEpoch = activity?.epoch || uid();
  // Legacy records without a timestamp receive one on their first visit.
  writeActivity({ epoch: sessionEpoch, lastActiveAt: now });
}

function checkSession() {
  const activity = readActivity();
  if (activity?.epoch !== sessionEpoch) {
    sessionEpoch = activity?.epoch || uid();
    sessionActivity = activity;
    resetActivityState();
    return false;
  }
  if (Date.now() - activity.lastActiveAt >= SESSION_IDLE_MS) {
    try {
      localStorage.removeItem(KEY);
      localStorage.removeItem("joseon-records");
    } catch {}
    sessionEpoch = uid();
    writeActivity({ epoch: sessionEpoch, lastActiveAt: Date.now() });
    resetActivityState();
    return false;
  }
  return true;
}

function touchSession() {
  const now = Date.now(),
    activity = readActivity();
  if (!activity || now - activity.lastActiveAt >= 1000)
    writeActivity({ epoch: sessionEpoch, lastActiveAt: now });
}

function bindSessionActivity() {
  sessionBound = true;
  const activity = (event) => {
    if (!checkSession()) {
      if (event.cancelable) event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (event.isTrusted) touchSession();
  };
  for (const name of [
    "pointerdown",
    "pointermove",
    "keydown",
    "input",
    "click",
    "scroll",
  ])
    document.addEventListener(name, activity, { capture: true });
  const resume = () => {
    if (document.visibilityState === "visible" && checkSession())
      touchSession();
  };
  window.addEventListener("focus", resume);
  window.addEventListener("pageshow", resume);
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("storage", (event) => {
    if (event.key === SESSION_KEY) checkSession();
  });
}
