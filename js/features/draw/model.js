"use strict";

// Pure draw operations. Unknown legacy rounds remain null, never fabricated.
const DrawModel = (() => {
  const limit = 4;
  function restore(data, status, statuses) {
    const valid = (id) => statuses.some((item) => item.id === id);
    const count = Math.max(
      status ? 1 : 0,
      Math.min(limit, Math.floor(Number(data?.draws) || 0)),
    );
    const history = Array.from({ length: count }, (_, index) =>
      valid(data?.drawHistory?.[index]) ? data.drawHistory[index] : null,
    );
    let selected = Number.isInteger(data?.selectedDraw)
      ? data.selectedDraw
      : -1;
    if (
      selected < 0 ||
      selected >= count ||
      !history[selected] ||
      history[selected] !== status
    ) {
      selected = status ? history.lastIndexOf(status) : -1;
    }
    if (selected < 0 && count && valid(status)) {
      selected = count - 1;
      history[selected] = status;
    }
    return { history, selected };
  }
  function append(history, id) {
    return history.length >= limit ? history : [...history, id];
  }
  function canSelect(history, index) {
    return (
      Number.isInteger(index) &&
      index >= 0 &&
      index < history.length &&
      !!history[index]
    );
  }
  function pick(statuses, weights, value = Math.random()) {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let cumulative = 0;
    for (let index = 0; index < weights.length; index++) {
      cumulative += weights[index] / total;
      if (weights[index] > 0 && value < cumulative) return statuses[index];
    }
    return statuses[weights.findLastIndex((weight) => weight > 0)];
  }
  return { limit, restore, append, canSelect, pick };
})();
