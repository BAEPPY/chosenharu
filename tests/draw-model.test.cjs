const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
function model() {
  const context = vm.createContext({ window: {} });
  for (const file of [
    "js/data/history.js",
    "js/data/statuses.js",
    "js/features/draw/model.js",
  ])
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
  return {
    model: vm.runInContext("DrawModel", context),
    statuses: context.window.LESSON_STATUSES,
    history: context.window.JOSEON_HISTORY,
  };
}
const plain = (value) => JSON.parse(JSON.stringify(value));
test("four rounds remain independently selectable, including duplicate statuses", () => {
  const { model: m } = model();
  let history = [];
  for (const id of ["common", "low", "common", "yangban"])
    history = m.append(history, id);
  assert.deepEqual(plain(history), ["common", "low", "common", "yangban"]);
  assert.equal(m.append(history, "royal"), history);
  for (let i = 0; i < 4; i++) assert.ok(m.canSelect(history, i));
  assert.equal(m.canSelect(history, 4), false);
  assert.equal(m.canSelect(history, -1), false);
});
test("reload preserves the chosen earlier round", () => {
  const { model: m, statuses } = model();
  const data = {
    draws: 4,
    drawHistory: ["common", "yangban", "technical", "low"],
    selectedDraw: 1,
  };
  assert.deepEqual(plain(m.restore(data, "yangban", statuses)), {
    history: data.drawHistory,
    selected: 1,
  });
});
test("legacy storage preserves the known result and spent chances without inventing outcomes", () => {
  const { model: m, statuses } = model();
  const restored = m.restore({ draws: 4 }, "low", statuses);
  assert.deepEqual(plain(restored), {
    history: [null, null, null, "low"],
    selected: 3,
  });
  assert.equal(m.canSelect(restored.history, 0), false);
});
test("invalid history entries and a mismatching selection cannot select an unearned status", () => {
  const { model: m, statuses } = model();
  const restored = m.restore(
    { draws: 2, drawHistory: ["invented", "common"], selectedDraw: 0 },
    "common",
    statuses,
  );
  assert.deepEqual(plain(restored), { history: [null, "common"], selected: 1 });
  assert.equal(m.canSelect(restored.history, 0), false);
});
test("weighted selection respects boundaries, zero weights and the cited defaults", () => {
  const { model: m, statuses, history } = model();
  const weights = statuses.map((s) => s.weight);
  assert.equal(
    weights.reduce((sum, n) => sum + n, 0),
    100,
  );
  assert.deepEqual(
    plain(weights),
    plain(history.rows.map((row) => row.applied)),
  );
  assert.equal(m.pick(statuses, weights, 0).id, "royal");
  assert.equal(m.pick(statuses, weights, 0.005).id, "yangban");
  assert.equal(m.pick(statuses, weights, 0.2).id, "technical");
  assert.equal(m.pick(statuses, weights, 0.6).id, "common");
  assert.equal(m.pick(statuses, weights, 0.99).id, "low");
  assert.equal(m.pick(statuses, [0, 0, 1, 0, 0], 0).id, "technical");
  assert.equal(m.pick(statuses, [0, 0, 1, 0, 0], 0.999999).id, "technical");
});
