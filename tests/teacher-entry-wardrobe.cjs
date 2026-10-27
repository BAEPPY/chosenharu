const assert = require("node:assert/strict");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const fs = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const { server } = require("../scripts/classroom-dev-server.cjs");
(async () => {
  const dir = await fs.mkdtemp(join(tmpdir(), "joseon-entry-"));
  const app = server({ dir });
  await new Promise((r) => app.listen(4194, "127.0.0.1", r));
  const origin = "http://127.0.0.1:4194";
  let b;
  try {
    b = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const p = await b.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(origin);
    assert.equal(await p.locator('[data-action="teacherHome"]').count(), 0);
    await p.locator('[data-action="board"]').first().click();
    assert.equal(await p.locator('[data-action="teacherHome"]').count(), 0);
    await p.goto(origin + "/#teacher");
    assert.equal(await p.locator("#createClassroom").count(), 0);
    for (let i = 0; i < 4; i++) await p.locator(".brand").click();
    assert.equal(await p.locator("#createClassroom").count(), 0);
    await p.locator(".brand").focus();
    await p.keyboard.press("Enter");
    await p.locator("#createClassroom").waitFor();
    await p.locator("#createClassroom button").click();
    await p.locator(".teacher-classroom").waitFor();
    const links = await p.evaluate(() => ({
      teacher:
        location.origin + "/#teacher/" + sharedRoom.id + "/" + sharedRoom.token,
      student:
        location.origin +
        "/#join/" +
        sharedRoom.id +
        "/" +
        sharedRoom.inviteToken,
    }));
    const q = await b.newPage({ viewport: { width: 390, height: 844 } });
    await q.goto(links.teacher);
    assert.equal(await q.locator(".teacher-classroom").count(), 0);
    for (let i = 0; i < 5; i++) await q.locator(".brand").click();
    await q.locator(".teacher-classroom").waitFor();
    await q.reload();
    await q.locator(".teacher-classroom").waitFor();
    await q.evaluate(() => {
      const activity = readActivity();
      activity.lastActiveAt = Date.now() - 3600001;
      localStorage.setItem(SESSION_KEY, JSON.stringify(activity));
      window.dispatchEvent(new Event("focus"));
    });
    assert.equal(await q.evaluate(() => teacherEntryUnlocked), false);
    assert.equal(await q.locator(".teacher-classroom").count(), 0);
    const student = await b.newPage({ viewport: { width: 320, height: 844 } });
    await student.goto(links.student);
    await student.locator(".student-classroom").waitFor();
    assert.equal(
      await student.locator('[data-action="teacherHome"]').count(),
      0,
    );
    assert.ok(
      await student.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await student.locator('[data-action="start"]').click();
    const setPerson = async (status, gender, role) =>
      student.evaluate(
        ({ status, gender, role }) => {
          const figure = L.figures.find(
            (f) =>
              f.status === status && f.role === role && f.gender === gender,
          );
          state = normalize({
            ...DEFAULT,
            status,
            gender,
            role,
            figure: figure?.id || "",
            name: "시험 인물",
            poseConfirmed: true,
            story: "마을의 하루를 보냈다.",
          });
          go(FLOW.LOOK);
        },
        { status, gender, role },
      );
    for (const [status, role] of [
      ["common", "farmer"],
      ["low", "farmservant"],
      ["technical", "doctor"],
      ["yangban", "civil"],
    ]) {
      await setPerson(status, "male", role);
      for (const id of ["royal", "prince", "emperor", "myeonbok", "noui"])
        assert.equal(
          await student
            .locator(`[data-choice="outfit"][data-value="${id}"]`)
            .count(),
          0,
        );
      await student.locator('[data-style="hair"]').click();
      for (const id of ["ikseongwan", "myeonryugwan"])
        assert.equal(
          await student
            .locator(`[data-choice="hair"][data-value="${id}"]`)
            .count(),
          0,
        );
      await student.locator('[data-style="outfit"]').click();
    }
    await setPerson("royal", "male", "king");
    await student
      .locator('[data-choice="outfit"][data-value="myeonbok"]')
      .click();
    await student.locator('[data-style="hair"]').click();
    await student
      .locator('[data-choice="hair"][data-value="myeonryugwan"]')
      .click();
    // Changing the drawn status repairs both costume and crown and clears undo.
    await student.evaluate(() => {
      drawHistory = ["royal", "common"];
      draws = 2;
      selectedDraw = 0;
      selectDraw(1);
    });
    assert.equal(await student.evaluate(() => state.hair), "sangtu");
    assert.equal(await student.evaluate(() => state.outfit), "daily");
    assert.equal(await student.evaluate(() => undo.length), 0);
    await student.reload();
    assert.equal(await student.evaluate(() => state.outfit), "daily");
    const raw = await student.evaluate(() => ({
      ...state,
      id: "imported_king_costume",
      name: "불러온 농민",
      story: "밭에서 채소를 돌보았다.",
      outfit: "royal",
      hair: "ikseongwan",
      status: "common",
      role: "farmer",
    }));
    await student.locator("#importFile").setInputFiles({
      name: "old-work.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({ format: "joseon-day-v2", records: [raw] }),
      ),
    });
    await student.waitForFunction(() =>
      saved.some((s) => s.id === "imported_king_costume"),
    );
    assert.deepEqual(
      await student.evaluate(() => {
        const s = saved.find((s) => s.id === "imported_king_costume");
        return [s.outfit, s.hair];
      }),
      ["daily", "sangtu"],
    );
    // A fabricated button cannot bypass the filtering.
    await student.evaluate(() => {
      const button = document.createElement("button");
      button.dataset.choice = "outfit";
      button.dataset.value = "royal";
      document.body.append(button);
      button.click();
      button.remove();
    });
    assert.equal(await student.evaluate(() => state.outfit), "daily");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: teacher UI hidden, five banner clicks including keyboard, gated teacher links and reload/expiry, student room, royal wardrobe restrictions, status changes/undo, imported files, forged choice buttons and 320px layout.",
    );
  } finally {
    if (b) await b.close();
    await new Promise((r) => app.close(r));
    await fs.rm(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
