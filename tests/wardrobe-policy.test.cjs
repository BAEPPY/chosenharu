const assert = require("node:assert/strict");
const { test } = require("node:test");
const { mkdtemp, rm } = require("node:fs/promises");
const { join } = require("node:path");
const { tmpdir } = require("node:os");
const { randomUUID } = require("node:crypto");
const policy = require("../js/data/wardrobe-policy.js");
const { createService } = require("../server/classroom-service.cjs");
const { fileStore } = require("../scripts/classroom-dev-server.cjs");
const { fixture } = require("./classroom-service.cjs");

test("royal-only garments and crowns require the correct status, gender and role", () => {
  for (const status of ["common", "low", "technical", "yangban", ""])
    for (const role of ["farmer", "merchant", "farmservant", "king", "prince"])
      for (const gender of ["male", "female"]) {
        const person = { status, role, gender };
        for (const outfit of ["royal", "prince", "emperor", "myeonbok", "noui"])
          assert.equal(policy.allows("outfit", outfit, person), false);
        for (const hair of ["ikseongwan", "myeonryugwan"])
          assert.equal(policy.allows("hair", hair, person), false);
      }
  const king = { status: "royal", role: "king", gender: "male" };
  for (const outfit of ["royal", "emperor", "myeonbok"])
    assert.ok(policy.allows("outfit", outfit, king));
  assert.ok(policy.allows("hair", "myeonryugwan", king));
  assert.ok(policy.allows("hair", "ikseongwan", king));
  const prince = { ...king, role: "prince" };
  assert.ok(policy.allows("outfit", "prince", prince));
  assert.ok(policy.allows("hair", "ikseongwan", prince));
  assert.equal(policy.allows("outfit", "royal", prince), false);
  assert.equal(policy.allows("hair", "myeonryugwan", prince), false);
  assert.equal(
    policy.allows("outfit", "royal", { ...king, gender: "female" }),
    false,
  );
  // Wedding garments are not royal-exclusive: preserve these existing choices.
  for (const outfit of ["princess", "wonsam", "daily"])
    assert.ok(
      policy.allows("outfit", outfit, {
        status: "common",
        gender: "female",
        role: "farmer",
      }),
    );
});

test("classroom API rejects forged royal clothes and crowns and repairs legacy snapshots", async () => {
  const dir = await mkdtemp(join(tmpdir(), "joseon-wardrobe-"));
  const store = fileStore(dir),
    service = createService(store);
  try {
    const room = await service.create("복식 검사"),
      student = await service.join(room.id, room.inviteToken);
    for (const status of ["common", "low", "yangban", "technical"])
      for (const item of [
        { outfit: "royal" },
        { outfit: "myeonbok" },
        { outfit: "prince" },
        { outfit: "emperor" },
        { outfit: "noui" },
        { hair: "ikseongwan" },
        { hair: "myeonryugwan" },
      ]) {
        await assert.rejects(
          service.change(room.id, student.token, {
            action: "add",
            opId: randomUUID(),
            character: { ...fixture(0), status, ...item },
          }),
          (e) => e.status === 400,
        );
      }
    assert.equal((await service.read(room.id, room.token)).records.length, 0);
    await service.change(room.id, student.token, {
      action: "add",
      opId: randomUUID(),
      character: {
        ...fixture(0),
        status: "royal",
        role: "king",
        outfit: "myeonbok",
        hair: "myeonryugwan",
      },
    });
    assert.equal(
      (await service.read(room.id, room.token)).records[0].outfit,
      "myeonbok",
    );
    const old = await store.read(room.id);
    old.data.items[0].character.status = "common";
    old.data.items[0].character.role = "farmer";
    await store.write(room.id, old.data, old.etag);
    const corrected = (await service.read(room.id, room.token)).records[0];
    assert.equal(corrected.outfit, "daily");
    assert.equal(corrected.hair, "sangtu");
    assert.equal(corrected.story, fixture(0).story);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
