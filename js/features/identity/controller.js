"use strict";

function applyRole(id) {
  const r = rolesFor(state).find((x) => x.id === id);
  if (!r) return;
  state.role = r.id;
}

const suggestedFigures = new Map();

function suggestName() {
  let pool = L.figures.filter(
    (f) => f.status === state.status && f.gender === state.gender,
  );
  if (pool.length) {
    const key = state.status + ":" + state.gender;
    let seen = suggestedFigures.get(key) || new Set();
    seen.add(state.figure);
    let remaining = pool.filter((f) => !seen.has(f.id));
    if (!remaining.length) {
      seen = new Set([state.figure]);
      remaining = pool.filter((f) => !seen.has(f.id));
    }
    const f = choose(remaining.length ? remaining : pool);
    seen.add(f.id);
    suggestedFigures.set(key, seen);
    state.figure = f.id;
    state.name = f.name;
    applyRole(f.role);
  } else {
    const list =
      state.status === "low"
        ? L.names[state.gender === "male" ? "lowMale" : "lowFemale"]
        : L.names[state.gender];
    state.name = choose(list.filter((n) => n !== state.name));
    state.figure = "";
  }
  persist();
  render();
}

function setGender(g) {
  state.gender = g;
  state.figure = "";
  state.name = "";
  applyRole(rolesFor(state)[0].id);
  suggestName();
}
