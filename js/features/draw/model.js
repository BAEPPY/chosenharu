"use strict";

// Only a complete sequence of recorded spins is draw history.
// A saved character or legacy counter is not evidence that a spin occurred.
const DrawModel = (() => {
  const limit = 4;
  function restore(data, status, statuses) {
    const valid = (id) => statuses.some((item) => item.id === id);
    const recorded = data?.drawHistory;
    // Earlier releases synthesized [null, null, null, character.status].
    // Reset these unverifiable rounds without changing the character itself.
    const history =
      Array.isArray(recorded) &&
      recorded.length <= limit &&
      Array.from(recorded).every(valid)
        ? [...recorded]
        : [];
    let selected = Number.isInteger(data?.selectedDraw)
      ? data.selectedDraw
      : -1;
    if (
      selected < 0 ||
      selected >= history.length ||
      !history[selected] ||
      history[selected] !== status
    ) {
      selected = status ? history.lastIndexOf(status) : -1;
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
