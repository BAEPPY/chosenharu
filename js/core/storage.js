"use strict";

function cleanBoard(items, records) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  return items
    .filter(
      (x) =>
        x &&
        records.some((s) => s.id === x.id) &&
        !seen.has(x.id) &&
        seen.add(x.id),
    )
    .slice(0, 26)
    .map((x) => ({
      id: x.id,
      x: Math.max(0, Math.min(900, Number(x.x) || 0)),
      y: Math.max(45, Math.min(475, Number(x.y) || 45)),
      locked: !!x.locked,
    }));
}

try {
  const data = JSON.parse(localStorage.getItem(KEY) || "null");
  if (data) {
    state = normalize(data.state);
    saved = Array.isArray(data.saved)
      ? data.saved
          .slice(0, 100)
          .map(normalize)
          .filter((s) => s.id)
      : [];
    const restored = DrawModel.restore(data, state.status, L.statuses);
    drawHistory = restored.history;
    selectedDraw = restored.selected;
    draws = drawHistory.length;
    if (
      Array.isArray(data.weights) &&
      data.weights.length === 5 &&
      data.weights.every((x) => Number.isFinite(x) && x >= 0) &&
      data.weights.reduce((a, b) => a + b, 0) > 0
    )
      weights = data.weights.every(
        (value, index) => value === window.JOSEON_HISTORY.legacyWeights[index],
      )
        ? L.statuses.map((s) => s.weight)
        : data.weights;
    board = cleanBoard(data.board, saved);
    step = Math.max(0, Math.min(4, Number(data.step) || 0));
  } else {
    const old = JSON.parse(localStorage.getItem("joseon-records") || "[]");
    saved = Array.isArray(old) ? old.map(normalize).filter((s) => s.id) : [];
  }
} catch {
  state = { ...DEFAULT };
  saved = [];
  board = [];
}

function persist() {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        state,
        saved,
        board,
        draws,
        drawHistory,
        selectedDraw,
        weights,
        step: step === 5 ? returnStep : step,
      }),
    );
    return true;
  } catch {
    toast("기기에 저장하지 못했어요. 작품 파일을 내려받아 보관해 주세요.");
    return false;
  }
}
