const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const { server } = require("../scripts/classroom-dev-server.cjs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
(async () => {
  const dir = await fs.mkdtemp(join(tmpdir(), "joseon-live-ui-"));
  const app = server({ dir });
  await new Promise((r) => app.listen(4192, "127.0.0.1", r));
  const origin = "http://127.0.0.1:4192";
  let browser;
  const out =
    process.env.SCREENSHOT_DIR ||
    "/workspace/chosenharu-review/shared-classroom";
  await fs.mkdir(out, { recursive: true });
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const contexts = await Promise.all(
      Array.from({ length: 3 }, () =>
        browser.newContext({
          viewport: { width: 1520, height: 1100 },
          reducedMotion: "reduce",
          acceptDownloads: true,
        }),
      ),
    );
    const [teacher, alice, bob] = await Promise.all(
      contexts.map((c) => c.newPage()),
    );
    const errors = [];
    for (const p of [teacher, alice, bob])
      p.on("pageerror", (e) => errors.push(e.message));
    await teacher.goto(origin + "/#teacher");
    assert.equal(await teacher.locator("#createClassroom").count(), 0);
    for (let i = 0; i < 4; i++) await teacher.locator(".brand").click();
    assert.equal(await teacher.locator("#createClassroom").count(), 0);
    await teacher.locator(".brand").click();
    await teacher.locator('[name="title"]').fill("5학년 2반의 하루");
    await teacher.locator("#createClassroom button").click();
    await teacher.locator(".teacher-classroom").waitFor();
    const links = await teacher.evaluate(() => ({
      student:
        location.origin +
        "/#join/" +
        sharedRoom.id +
        "/" +
        sharedRoom.inviteToken,
      teacher:
        location.origin + "/#teacher/" + sharedRoom.id + "/" + sharedRoom.token,
    }));
    assert.notEqual(links.teacher, links.student);
    await Promise.all([alice.goto(links.student), bob.goto(links.student)]);
    await Promise.all([
      alice.locator(".student-classroom").waitFor(),
      bob.locator(".student-classroom").waitFor(),
    ]);
    assert.notEqual(
      await alice.evaluate(() => sharedRoom.actorId),
      await bob.evaluate(() => sharedRoom.actorId),
    );
    for (const [p, name, pose] of [
      [alice, "봄이", "reading_writing_01"],
      [bob, "가람", "dancing_hansam_02"],
    ]) {
      await p.locator('[data-action="start"]').click();
      assert.equal(await p.evaluate(() => step), 0);
      await p.evaluate(
        ({ name, pose }) => {
          state = normalize({
            ...DEFAULT,
            id: uid(),
            status: "common",
            name,
            pose,
            poseConfirmed: true,
            place: "우리 마을",
            story: name + "는 오늘 이웃과 즐거운 하루를 보냈다.",
            imagination: "친구들과 함께 공부하고 싶다.",
          });
          go(FLOW.CARD);
        },
        { name, pose },
      );
      await p.reload();
      await p.waitForFunction(() => sharedRoom && sharedRoom.revision > 0);
      assert.equal(await p.evaluate(() => step), 5);
      await p.locator('[data-action="addCurrent"]').click();
      await p.locator(".student-classroom").waitFor();
    }
    await teacher.waitForFunction(() => sharedRoom.board.length === 2);
    const aliceId = await alice.evaluate(() => state.id),
      bobId = await bob.evaluate(() => state.id);
    await teacher.locator(`[data-person="${aliceId}"]`).click();
    assert.match(await teacher.locator("#personInspector").innerText(), /봄이/);
    assert.match(await teacher.locator("#personInspector").innerText(), /상민/);
    assert.match(
      await teacher.locator("#personInspector").innerText(),
      /오늘 이웃과 즐거운 하루/,
    );
    assert.match(
      await teacher.locator("#personInspector").innerText(),
      /친구들과 함께 공부/,
    );
    // The teacher sees intermediate movement while the student's pointer is still held down.
    const before = await teacher.evaluate(
      (id) => sharedRoom.board.find((p) => p.id === id),
      aliceId,
    );
    const board = await alice.locator("#classBoard").boundingBox(),
      person = await alice.locator(`[data-person="${aliceId}"]`).boundingBox();
    await alice.mouse.move(
      person.x + person.width / 2,
      person.y + person.height / 2,
    );
    await alice.mouse.down();
    await alice.mouse.move(
      person.x + person.width / 2 + (130 * board.width) / 1000,
      person.y + person.height / 2 + (90 * board.width) / 1000,
      { steps: 12 },
    );
    await teacher.waitForFunction(
      ({ id, x }) => sharedRoom.board.find((p) => p.id === id).x > x + 100,
      { id: aliceId, x: before.x },
      { timeout: 10000 },
    );
    assert.equal(await alice.evaluate(() => sharedDragging), aliceId);
    await alice.mouse.up();
    // Student cannot move another student's person even with a forged direct API request.
    const denied = await alice.evaluate(async (id) => {
      const r = await fetch("/api/classrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sharedRoom.token,
        },
        body: JSON.stringify({
          action: "move",
          room: sharedRoom.id,
          id,
          x: 0,
          y: 45,
          opId: uid(),
          role: "teacher",
        }),
      });
      return r.status;
    }, bobId);
    assert.equal(denied, 403);
    // Independent students move at the same time; both positions are kept.
    await Promise.all([
      alice.evaluate(
        (id) => queueSharedMove({ id, x: 600, y: 300 }, true),
        aliceId,
      ),
      bob.evaluate(
        (id) => queueSharedMove({ id, x: 720, y: 410 }, true),
        bobId,
      ),
    ]);
    await teacher.waitForFunction(
      ({ a, b }) =>
        sharedRoom.board.find((p) => p.id === a).x === 600 &&
        sharedRoom.board.find((p) => p.id === b).x === 720,
      { a: aliceId, b: bobId },
    );
    // Lock and global pause propagate and are enforced on the server.
    await teacher.locator(`[data-person="${aliceId}"]`).click();
    await teacher.locator('[data-action="lock"]').click();
    await alice.waitForFunction(
      (id) => sharedRoom.board.find((p) => p.id === id).locked,
      aliceId,
    );
    const locked = await alice.evaluate(async (id) => {
      try {
        await classroomRequest({
          action: "move",
          room: sharedRoom.id,
          id,
          x: 1,
          y: 45,
          opId: uid(),
        });
        return 200;
      } catch (e) {
        return e.status;
      }
    }, aliceId);
    assert.equal(locked, 423);
    await teacher.locator('[data-action="pauseClassroom"]').click();
    await bob.waitForFunction(() => sharedRoom.paused);
    await teacher.locator('[data-action="pauseClassroom"]').click();
    await bob.waitForFunction(() => !sharedRoom.paused);
    // Reconnection retains membership, and the shared work survives personal idle expiry.
    const member = await alice.evaluate(() => sharedRoom.actorId);
    await alice.reload();
    await alice.locator(".student-classroom").waitFor();
    assert.equal(await alice.evaluate(() => sharedRoom.actorId), member);
    await bob.evaluate(() => {
      const a = readActivity();
      a.lastActiveAt = Date.now() - 3600001;
      localStorage.setItem(SESSION_KEY, JSON.stringify(a));
      window.dispatchEvent(new Event("focus"));
    });
    assert.equal(await bob.evaluate(() => landing), true);
    await bob.goto(links.student);
    await bob.locator(".student-classroom").waitFor();
    assert.equal(await bob.evaluate(() => sharedRoom.board.length), 2);
    const teacherAgain = await contexts[0].newPage();
    await teacherAgain.goto(links.teacher);
    for (let i = 0; i < 5; i++) await teacherAgain.locator(".brand").click();
    await teacherAgain.locator(".teacher-classroom").waitFor();
    assert.equal(await teacherAgain.locator("[data-person]").count(), 2);
    await teacherAgain.close();
    await teacher.screenshot({
      path: join(out, "teacher-desktop.png"),
      fullPage: true,
    });
    for (const width of [390, 320]) {
      await alice.setViewportSize({ width, height: 900 });
      await alice.screenshot({
        path: join(out, `student-${width}.png`),
        fullPage: true,
      });
      assert.ok(
        await alice.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
    }
    const dl = teacher.waitForEvent("download");
    await teacher.locator('[data-action="boardPng"]').click();
    await (await dl).saveAs(join(out, "shared-painting.png"));
    assert.deepEqual(errors, []);
    console.log(
      "PASS: separate teacher/student links, three independent browser sessions, live mid-drag updates, own-character authorization, concurrent moves, teacher stories, lock/pause, rejoin, one-hour reset isolation, 320/390px layouts and shared PNG.",
    );
  } finally {
    await browser?.close();
    await new Promise((r) => app.close(r));
    await fs.rm(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
