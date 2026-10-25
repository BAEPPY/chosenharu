"use strict";

const ICONS = {
  draw: "🎲",
  royal: "👑",
  yangban: "📚",
  technical: "🧰",
  common: "🌱",
  low: "🧺",
  history: "📜",
  palette: "🎨",
  help: "💡",
  gallery: "🖼️",
  classroom: "🏡",
  done: "✅",
};

function icon(name, className = "") {
  return `<span class="toss-icon ${className}" aria-hidden="true">${ICONS[name] || ICONS.draw}</span>`;
}
