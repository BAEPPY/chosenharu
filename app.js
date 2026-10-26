"use strict";

// Bootstrap after the data, shared context, and feature modules have loaded.
if (window.location.hash === "#classroom") {
  returnStep = step;
  step = FLOW.BOARD;
} else if (/^#step-[1-6]$/.test(window.location.hash)) {
  step = Number(window.location.hash.slice(-1)) - 1;
  if (restoredLegacyFlow && step > 0) {
    step = Math.min(FLOW.CARD, step + 1);
    window.history.replaceState({}, "", "#step-" + (step + 1));
  }
}
resolveBoard();
render();
bindSessionActivity();
