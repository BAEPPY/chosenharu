"use strict";

// Original image-generated artwork, displayed from twelve equal square cells.
const UI_ART = {
  draw: 0,
  fan: 1,
  hanbok: 2,
  palette: 3,
  book: 4,
  scroll: 5,
  gallery: 6,
  classroom: 7,
  teacher: 8,
  ring: 9,
  seal: 10,
  help: 11,
  history: 4,
  done: 5,
  royal: 10,
  yangban: 4,
  technical: 3,
  common: 2,
  low: 1,
};
function icon(name, className = "") {
  const index = UI_ART[name] ?? 0;
  return `<span class="ui-icon ${className}" style="--art-x:${((index % 4) * 100) / 3}%;--art-y:${Math.floor(index / 4) * 50}%" aria-hidden="true"></span>`;
}
