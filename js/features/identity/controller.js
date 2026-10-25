"use strict";

function applyRole(id) {
  const r = rolesFor(state).find((x) => x.id === id);
  if (!r) return;
  state.role = r.id;
}

function suggestName() {
  let pool = L.figures.filter(
    (f) => f.status === state.status && f.gender === state.gender,
  );
  if (pool.length) {
    const f = choose(
      pool.filter((f) => f.id !== state.figure).length
        ? pool.filter((f) => f.id !== state.figure)
        : pool,
    );
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
