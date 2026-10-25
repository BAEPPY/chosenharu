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
test("a legacy count or character alone never creates a draw", () => {
  const { model: m, statuses } = model();
  for (const data of [{}, { draws: 0 }, { draws: 1 }, { draws: 4 }]) {
    assert.deepEqual(plain(m.restore(data, "common", statuses)), {
      history: [],
      selected: -1,
    });
  }
});
test("the already-persisted phantom fourth result is cleared", () => {
  const { model: m, statuses } = model();
  const data = {
    draws: 4,
    drawHistory: [null, null, null, "common"],
    selectedDraw: 3,
  };
  assert.deepEqual(plain(m.restore(data, "common", statuses)), {
    history: [],
    selected: -1,
  });
  assert.deepEqual(data.drawHistory, [null, null, null, "common"]);
});
test("invalid or incomplete histories cannot select an unearned status", () => {
  const { model: m, statuses } = model();
  for (const history of [
    ["invented", "common"],
    [null, "common"],
    Array(2),
    "common",
  ]) {
    assert.deepEqual(
      plain(
        m.restore(
          { draws: 4, drawHistory: history, selectedDraw: 1 },
          "common",
          statuses,
        ),
      ),
      { history: [], selected: -1 },
    );
  }
});
test("the recorded history alone determines the count and cannot invent a selection", () => {
  const { model: m, statuses } = model();
  assert.deepEqual(
    plain(
      m.restore(
        { draws: 4, drawHistory: ["common"], selectedDraw: 3 },
        "common",
        statuses,
      ),
    ),
    { history: ["common"], selected: 0 },
  );
  assert.deepEqual(
    plain(
      m.restore(
        { draws: 4, drawHistory: [], selectedDraw: 3 },
        "common",
        statuses,
      ),
    ),
    { history: [], selected: -1 },
  );
  assert.deepEqual(
    plain(
      m.restore(
        { draws: 1, drawHistory: ["low"], selectedDraw: 0 },
        "common",
        statuses,
      ),
    ),
    { history: ["low"], selected: -1 },
  );
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
