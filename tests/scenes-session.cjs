const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const output = process.env.SCREENSHOT_DIR || "/tmp/joseon-scenes-qa";
const port = Number(process.env.TEST_PORT || 4188);
const origin = `http://127.0.0.1:${port}`;
(async () => {
  fs.mkdirSync(output, { recursive: true });
  const server = spawn(
    "python",
    ["-m", "http.server", String(port), "--bind", "127.0.0.1"],
    { cwd: root, stdio: "ignore" },
  );
  let browser;
  try {
    for (let i = 0; i < 30; i++) {
      try {
        if ((await fetch(origin)).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(r.status() + " " + r.url());
    });
    await page.goto(origin);
    // The narrow 0.5% royal wedge must still be the exact landing target.
    await page.evaluate(() => {
      go(FLOW.STATUS);
      const random = Math.random;
      Math.random = () => 0.001;
      spin();
      Math.random = random;
    });
    await page.waitForFunction(() => !spinning);
    assert.equal(await page.evaluate(() => drawHistory[0]), "royal");
    assert.equal(
      await page.evaluate(() => {
        const point = (360 - (rotation % 360)) % 360;
        return DrawModel.segments(L.statuses, weights).find(
          (s) => point >= s.start && point < s.end,
        ).id;
      }),
      "royal",
    );
    await page.evaluate(() => {
      for (const pose of D.lessonPoses) {
        const key = pose.alias.replace(/_\d+$/, "");
        if (!POSE_SCENES[key]) throw Error("Unmapped pose " + pose.alias);
        const s = { ...DEFAULT, pose: pose.alias };
        for (let i = 0; i < 10; i++) {
          ensureScene(s, true);
          if (!scenesFor(s).includes(s.scene))
            throw Error("Wrong recommendation");
          const previous = s.scene;
          if (ensureScene(s) || previous !== s.scene)
            throw Error("Background changed on render");
        }
      }
      state = normalize({
        ...DEFAULT,
        status: "common",
        name: "봄이",
        pose: "reading_writing_01",
        poseConfirmed: true,
        story: "서당 앞에서 책을 읽었다.",
      });
      go(FLOW.CARD);
    });
    const first = await page.evaluate(() => state.scene);
    assert.ok(["study", "porch"].includes(first));
    await page.reload();
    assert.equal(await page.evaluate(() => state.scene), first);
    await page.locator('[data-action="changeScene"]').click();
    const second = await page.evaluate(() => state.scene);
    assert.notEqual(first, second);
    assert.ok(["study", "porch"].includes(second));
    await page.evaluate(() => {
      saveRecord(true);
    });
    const work = await page.evaluate(() => ({ ...state }));
    await page.evaluate(async (work) => {
      const f = new File(
        [JSON.stringify({ format: "joseon-day-v2", records: [work] })],
        "work.json",
      );
      saved = [];
      await importFiles([f]);
      if (saved[0].scene !== work.scene || normalize(work).scene !== work.scene)
        throw Error("Import lost scene");
    }, work);
    await page.evaluate(() => {
      state.scene = "study";
      state.scenePose = state.pose;
      persist();
      render();
    });
    await page.screenshot({
      path: path.join(output, "card-desktop.png"),
      fullPage: true,
    });
    const download = page.waitForEvent("download");
    await page.locator('[data-action="png"]').click();
    await (await download).saveAs(path.join(output, "reading-card.png"));
    // Compare the actual downloaded card with separately drawn source background + avatar.
    const parity = await page.evaluate(async () => {
      let blob;
      const original = download;
      download = (value) => {
        blob = value;
      };
      await exportPng();
      download = original;
      const actual = await createImageBitmap(blob);
      const c = document.createElement("canvas");
      c.width = c.height = 1040;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(actual, 80, 170, 1040, 1040, 0, 0, 1040, 1040);
      const a = ctx.getImageData(0, 0, 1040, 1040).data;
      const bg = new Image();
      bg.src = SCENES[state.scene].file;
      await bg.decode();
      ctx.drawImage(bg, 0, 0, 1040, 1040);
      await drawAvatar(ctx, state, 0, 0, 1040);
      const b = ctx.getImageData(0, 0, 1040, 1040).data;
      let differences = 0;
      for (let i = 0; i < a.length; i += 4)
        if (
          Math.abs(a[i] - b[i]) +
            Math.abs(a[i + 1] - b[i + 1]) +
            Math.abs(a[i + 2] - b[i + 2]) >
          35
        )
          differences++;
      return differences / (1040 * 1040);
    });
    assert.ok(parity < 0.015, "PNG scene mismatch " + parity);
    await page.evaluate(() => {
      state.pose = "working_out_01";
      render();
    });
    assert.ok(
      ["courtyard", "study"].includes(await page.evaluate(() => state.scene)),
    );
    await page.evaluate(() => {
      state.pose = "resting_02";
      render();
    });
    assert.ok(
      ["shade", "porch"].includes(await page.evaluate(() => state.scene)),
    );
    // Board accepts intentional overlap, persists exactly, and exports in the same depth order.
    await page.evaluate(() => {
      saved = ["하나", "둘", "셋"].map((name, i) => ({
        ...state,
        id: "person" + i,
        name,
        pose: ["reading_writing_01", "dancing_hansam_02", "working_out_01"][i],
      }));
      board = [
        { id: "person0", x: 400, y: 250, locked: false },
        { id: "person1", x: 520, y: 280, locked: false },
        { id: "person2", x: 750, y: 400, locked: true },
      ];
      go(FLOW.BOARD);
    });
    let pos = await page.locator('[data-person="person0"]').boundingBox();
    let boardBox = await page.locator("#classBoard").boundingBox();
    await page.mouse.move(pos.x + pos.width / 2, pos.y + pos.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      pos.x + pos.width / 2 + (120 * boardBox.width) / 1000,
      pos.y + pos.height / 2 + (30 * boardBox.width) / 1000,
      { steps: 8 },
    );
    await page.mouse.up();
    const moved = await page.evaluate(() => ({ ...board[0] }));
    assert.ok(Math.abs(moved.x - 520) < 1 && Math.abs(moved.y - 280) < 1);
    await page.reload();
    assert.deepEqual(await page.evaluate(() => board[0]), moved);
    await page.locator('[data-person="person0"]').focus();
    await page.keyboard.press("ArrowDown");
    assert.ok(Math.abs((await page.evaluate(() => board[0].y)) - 290) < 1);
    await page.locator('[data-person="person2"]').focus();
    await page.keyboard.press("ArrowLeft");
    assert.equal(await page.evaluate(() => board[2].x), 750);
    const boardDownload = page.waitForEvent("download");
    await page.locator('[data-action="boardPng"]').click();
    await (await boardDownload).saveAs(path.join(output, "classroom.png"));
    // Fill the whole class and verify that no characters disappear on reload.
    await page.evaluate(() => {
      const poses = D.lessonPoses;
      saved = Array.from({ length: 26 }, (_, i) =>
        outfitState(
          {
            ...DEFAULT,
            id: "class" + i,
            status: "common",
            name: "인물 " + (i + 1),
            pose: poses[i % poses.length].alias,
            poseConfirmed: true,
            story: "함께 하루를 보냈다.",
          },
          L.outfits[i % L.outfits.length].id,
        ),
      );
      board = [];
      for (const s of saved) addToBoard(s.id, true);
      renderBoard();
    });
    assert.equal(await page.locator("[data-person]").count(), 26);
    await page.waitForFunction(
      () => !document.querySelector("#toast").classList.contains("show"),
    );
    await page
      .locator("#classBoard")
      .screenshot({ path: path.join(output, "village-class.png") });
    // Phone card stays large enough to see the illustration and fits the viewport.
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => {
        state = normalize({
          ...DEFAULT,
          status: "common",
          name: "봄이",
          pose: "eating_drinking_01",
          poseConfirmed: true,
          story: "마루에서 국수를 먹었다.",
          scene: "porch",
          scenePose: "eating_drinking_01",
        });
        go(FLOW.CARD);
      });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
      assert.ok((await page.locator("#avatar").boundingBox()).width >= 250);
      await page.screenshot({
        path: path.join(output, `card-mobile-${width}.png`),
        fullPage: true,
      });
    }
    // Returning before one hour keeps work; returning at one hour resets all app state, including deep links.
    await page.evaluate(() => {
      persist();
      const a = readActivity();
      a.lastActiveAt = Date.now() - 59 * 60000;
      localStorage.setItem(SESSION_KEY, JSON.stringify(a));
    });
    await page.reload();
    assert.equal(await page.evaluate(() => state.name), "봄이");
    await page.evaluate(() => {
      const a = readActivity();
      a.lastActiveAt = Date.now() - 3600001;
      localStorage.setItem(SESSION_KEY, JSON.stringify(a));
      localStorage.setItem("unrelated-key", "keep");
    });
    await page.reload();
    assert.equal(new URL(page.url()).hash, "#home");
    assert.deepEqual(
      await page.evaluate(() => [
        state.name,
        saved.length,
        board.length,
        draws,
        landing,
      ]),
      ["", 0, 0, 0, true],
    );
    assert.equal(
      await page.evaluate(() => localStorage.getItem("unrelated-key")),
      "keep",
    );
    // Actual user activity renews idle time; an open tab also expires on resume.
    await page.locator('[data-action="start"]').click();
    await page.evaluate(() => {
      const a = readActivity();
      a.lastActiveAt = Date.now() - 59 * 60000;
      localStorage.setItem(SESSION_KEY, JSON.stringify(a));
    });
    await page.locator(".spin-button").click();
    assert.ok(
      await page.evaluate(
        () => Date.now() - readActivity().lastActiveAt < 2000,
      ),
    );
    await page.waitForFunction(() => !spinning);
    await page.evaluate(() => {
      const a = readActivity();
      a.lastActiveAt = Date.now() - 3600001;
      localStorage.setItem(SESSION_KEY, JSON.stringify(a));
      window.dispatchEvent(new Event("focus"));
    });
    assert.equal(await page.evaluate(() => landing), true);
    assert.equal(await page.evaluate(() => drawHistory.length), 0);
    // A reset in another tab cannot be overwritten by this tab's stale character.
    await page.evaluate(() => {
      state.name = "이전 인물";
      persist();
    });
    const tab = await context.newPage();
    await tab.goto(origin);
    await tab.evaluate(() => {
      const a = readActivity();
      a.lastActiveAt = Date.now() - 3600001;
      localStorage.setItem(SESSION_KEY, JSON.stringify(a));
      checkSession();
    });
    await page.waitForFunction(() => state.name === "");
    await page.evaluate(() => persist());
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem(KEY)).state.name,
      ),
      "",
    );
    await tab.close();
    // An import that finishes after expiry cannot restore an old session.
    await page.evaluate(async () => {
      const records = [
        { ...DEFAULT, id: "late", status: "common", name: "늦게 온 작품" },
      ];
      let finish;
      const pending = importFiles([
        {
          size: 100,
          text: () =>
            new Promise((resolve) => {
              finish = resolve;
            }),
        },
      ]);
      const a = readActivity();
      a.lastActiveAt = Date.now() - 3600001;
      localStorage.setItem(SESSION_KEY, JSON.stringify(a));
      checkSession();
      finish(JSON.stringify({ format: "joseon-day-v2", records }));
      await pending;
      if (saved.length) throw Error("Expired import restored old work");
    });
    // Migration keeps untimestamped old work on first use.
    await page.evaluate(() => {
      localStorage.removeItem(SESSION_KEY);
      localStorage.setItem(
        KEY,
        JSON.stringify({
          flowVersion: FLOW_VERSION,
          state: {
            ...DEFAULT,
            name: "오래된 작품",
            status: "common",
            poseConfirmed: true,
          },
          saved: [],
        }),
      );
    });
    await page.reload();
    assert.equal(await page.evaluate(() => state.name), "오래된 작품");
    // Visual review: actual composed scenes, not standalone generated backgrounds.
    await page.setViewportSize({ width: 1200, height: 1000 });
    await page.evaluate(() => {
      const examples = [
        ["reading_writing_01", "study", "daily", "책 읽기 · 서당 돌뜰"],
        ["eating_drinking_01", "porch", "work_skirt", "식사 · 마루"],
        ["dancing_hansam_02", "courtyard", "princess", "춤 · 넓은 마당"],
        ["resting_02", "shade", "daily", "휴식 · 나무 그늘"],
        ["sitting_01", "stream", "daily", "앉아 쉬기 · 물가"],
        ["trudging_01", "lane", "myeonbok", "걷기 · 마을 골목"],
      ];
      document.body.innerHTML =
        '<div id="review" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px;background:#fff">' +
        examples
          .map(([pose, scene, outfit, label]) => {
            const s = outfitState(
              { ...DEFAULT, pose, name: label, scene, scenePose: pose },
              outfit,
            );
            if (outfit === "myeonbok") s.hair = "myeonryugwan";
            return (
              '<figure style="margin:0">' +
              sceneSvg(s) +
              '<figcaption style="text-align:center;padding:10px">' +
              label +
              "</figcaption></figure>"
            );
          })
          .join("") +
        "</div>";
    });
    await page
      .locator("#review")
      .screenshot({ path: path.join(output, "pose-backgrounds.png") });
    assert.deepEqual(errors, []);
    console.log(
      "PASS: 37 pose mappings, suitable random scenes, stable reload/JSON, background switching, actual PNG pixel parity, precise overlapping placement/keyboard/locks, 26-character village, 390/320px cards, idle expiry/load/resume/activity/cross-tab/legacy; no browser or network errors.",
    );
    console.log("PNG differing pixels:", parity);
  } finally {
    await browser?.close();
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
