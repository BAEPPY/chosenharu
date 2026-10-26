"use strict";

const SPIN_MS = 6200;
let wheelStart = 0;

function weightedStatus(value = Math.random()) {
  return DrawModel.pick(L.statuses, weights, value);
}

function selectDraw(index, refresh = true) {
  if (spinning || !DrawModel.canSelect(drawHistory, index)) return false;
  selectedDraw = index;
  if (state.status !== drawHistory[index]) {
    state.status = drawHistory[index];
    state.name = "";
    state.figure = "";
    applyRole(rolesFor(state)[0].id);
  }
  persist();
  if (refresh) {
    render();
    $(`[data-draw-index="${index}"]`)?.focus({ preventScroll: true });
  }
  return true;
}

function commitDraw(result) {
  if (draws >= DrawModel.limit) return false;
  drawHistory = DrawModel.append(drawHistory, result.id);
  draws = drawHistory.length;
  selectDraw(draws - 1, false);
  return true;
}

function spin() {
  if (spinning || draws >= DrawModel.limit) return;
  spinning = true;
  const epoch = sessionEpoch;
  const result = weightedStatus();
  const segment = DrawModel.segments(L.statuses, weights).find(
    (s) => s.id === result.id,
  );
  const middle =
    segment.start + (0.2 + Math.random() * 0.6) * (segment.end - segment.start);
  const target = (360 - middle) % 360;
  wheelStart = rotation;
  rotation += 360 * 7 + ((target - (rotation % 360) + 360) % 360);
  render();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduced ? 50 : SPIN_MS;
  if (!reduced) playSpinSound(duration);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const wheel = $("#wheel");
      if (wheel) wheel.style.transform = `rotate(${rotation}deg)`;
    }),
  );
  setTimeout(() => {
    if (!checkSession() || epoch !== sessionEpoch) return;
    spinning = false;
    commitDraw(result);
    render();
    toast(
      `${draws}번째 결과는 ${result.name}! 나온 결과 중 하나를 고를 수 있어요.`,
    );
    $(`[data-draw-index="${selectedDraw}"]`)?.focus({ preventScroll: true });
  }, duration + 80);
}
