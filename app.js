"use strict";

// Bootstrap after the data, shared context, and feature modules have loaded.
if (window.location.hash === "#classroom") {
  returnStep = step;
  step = 5;
} else if (/^#step-[1-5]$/.test(window.location.hash)) {
  step = Number(window.location.hash.slice(-1)) - 1;
}
resolveBoard();
render();
