"use strict";

const TEACHER_ENTRY_KEY = "joseon-teacher-entry";
let teacherEntryUnlocked = false,
  teacherBannerClicks = 0,
  teacherLastClickAt = 0,
  pendingTeacherRoute = "";
try {
  teacherEntryUnlocked = sessionStorage.getItem(TEACHER_ENTRY_KEY) === "open";
} catch {}

function resetTeacherClicks() {
  teacherBannerClicks = 0;
  teacherLastClickAt = 0;
}
function resetTeacherEntry() {
  teacherEntryUnlocked = false;
  pendingTeacherRoute = "";
  resetTeacherClicks();
  try {
    sessionStorage.removeItem(TEACHER_ENTRY_KEY);
  } catch {}
}
function requireTeacherEntry(route = "#teacher") {
  if (teacherEntryUnlocked) return true;
  pendingTeacherRoute = route;
  showHome(false);
  return false;
}
function handleBrandClick() {
  if (spinning) return;
  const now = Date.now();
  teacherBannerClicks =
    now - teacherLastClickAt <= 4000 ? teacherBannerClicks + 1 : 1;
  teacherLastClickAt = now;
  if (teacherBannerClicks < 5) {
    // A normal single click still returns home; consecutive clicks do not
    // add duplicate history entries or lose a pending teacher invite.
    if (!landing) showHome(!pendingTeacherRoute);
    return;
  }
  resetTeacherClicks();
  teacherEntryUnlocked = true;
  try {
    sessionStorage.setItem(TEACHER_ENTRY_KEY, "open");
  } catch {}
  const route = pendingTeacherRoute || "#teacher";
  pendingTeacherRoute = "";
  $("#modal")?.close();
  history.pushState({}, "", route);
  restoreSharedRoute();
}
