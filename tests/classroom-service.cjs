const assert = require("node:assert/strict");
const { test } = require("node:test");
const { mkdtemp, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { createService } = require("../server/classroom-service.cjs");
const { fileStore } = require("../scripts/classroom-dev-server.cjs");
const { randomUUID } = require("node:crypto");
const fixture = (i) => ({
  id: "character_" + i,
  status: "common",
  name: "인물 " + i,
  story: "아침에 책을 읽었다.",
  place: "서당",
  imagination: "친구와 이야기를 나누었다.",
  gender: "male",
  role: "farmer",
  outfit: "daily",
  pose: "reading_writing_01",
  hair: "sangtu",
  cloth: "baji",
  emotion: "smiling",
  top: "#FFFFFF",
  bottom: "#6A5BA8",
  layer: "#BD8A63",
  hairColor: "#1F1814",
  skin: 2,
  scene: "study",
  scenePose: "reading_writing_01",
});
async function exercise(store) {
  const a = createService(store),
    b = createService(store),
    room = await a.create("우리 반");
  try {
    const students = await Promise.all(
      Array.from({ length: 26 }, () => a.join(room.id, room.inviteToken)),
    );
    const add = await Promise.all(
      students.map((s, i) =>
        (i % 2 ? a : b).change(room.id, s.token, {
          action: "add",
          opId: randomUUID(),
          character: fixture(i),
        }),
      ),
    );
    assert.equal((await a.read(room.id, room.token)).board.length, 26);
    const result = await Promise.all(
      students.map((s, i) =>
        (i % 2 ? a : b).change(room.id, s.token, {
          action: "move",
          opId: randomUUID(),
          id: fixture(i).id,
          x: i * 20,
          y: 200 + i,
        }),
      ),
    );
    let snapshot = await b.read(room.id, room.token);
    for (let i = 0; i < 26; i++) {
      const p = snapshot.board.find((p) => p.id === fixture(i).id);
      assert.equal(p.x, i * 20);
      assert.equal(p.y, 200 + i);
    }
    await assert.rejects(
      a.change(room.id, students[0].token, {
        action: "move",
        opId: randomUUID(),
        id: fixture(1).id,
        x: 1,
        y: 100,
      }),
      (e) => e.status === 403,
    );
    await assert.rejects(
      a.change(room.id, students[0].token, {
        action: "lock",
        opId: randomUUID(),
        id: fixture(0).id,
        locked: true,
      }),
      (e) => e.status === 403,
    );
    await assert.rejects(
      a.read(room.id, room.inviteToken),
      (e) => e.status === 403,
    );
    await assert.rejects(
      a.read(room.id, "s.forged_token.invalid"),
      (e) => e.status === 403,
    );
    const studentView = await a.read(room.id, students[0].token);
    assert.equal(studentView.inviteToken, undefined);
    assert.equal(
      studentView.records.find((s) => s.id === fixture(1).id).story,
      "",
    );
    assert.equal(
      studentView.records.find((s) => s.id === fixture(0).id).story,
      fixture(0).story,
    );
    await a.change(room.id, room.token, {
      action: "lock",
      opId: randomUUID(),
      id: fixture(0).id,
      locked: true,
    });
    await assert.rejects(
      a.change(room.id, students[0].token, {
        action: "move",
        opId: randomUUID(),
        id: fixture(0).id,
        x: 50,
        y: 100,
      }),
      (e) => e.status === 423,
    );
    await a.change(room.id, room.token, {
      action: "pause",
      opId: randomUUID(),
      paused: true,
    });
    await assert.rejects(
      a.change(room.id, students[1].token, {
        action: "move",
        opId: randomUUID(),
        id: fixture(1).id,
        x: 50,
        y: 100,
      }),
      (e) => e.status === 423,
    );
    await a.change(room.id, room.token, {
      action: "pause",
      opId: randomUUID(),
      paused: false,
    });
    const duplicate = {
      action: "move",
      opId: randomUUID(),
      id: fixture(1).id,
      x: 5000,
      y: -100,
    };
    const once = await a.change(room.id, students[1].token, duplicate);
    const twice = await b.change(room.id, students[1].token, duplicate);
    assert.equal(once.revision, twice.revision);
    const bounded = twice.board.find((p) => p.id === fixture(1).id);
    assert.equal(bounded.x, 900);
    assert.equal(bounded.y, 45);
    await assert.rejects(
      a.change(room.id, students[0].token, {
        action: "add",
        opId: randomUUID(),
        character: fixture(99),
      }),
      (e) => e.status === 409,
    );
    assert.equal(
      (await createService(store).read(room.id, room.token)).records.length,
      26,
    );
    return room.id;
  } finally {
    await store.remove(room.id);
  }
}
module.exports = { exercise, fixture };
if (require.main === module)
  test("shared room: 26 simultaneous students across two services, durable moves, permissions, private stories, lock, pause, limits, idempotency and restart", async () => {
    const dir = await mkdtemp(join(tmpdir(), "joseon-room-"));
    try {
      await exercise(fileStore(dir));
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
