const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const selection = require("../art-library/pungsokdo/selection.json");

(async () => {
  const port = process.env.POSE_TEST_PORT || "4176";
  const server = spawn(
    "python",
    ["-m", "http.server", port, "--bind", "127.0.0.1"],
    { cwd: root, stdio: "ignore" },
  );
  let browser;
  try {
    for (let i = 0; i < 40; i++) {
      try {
        if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      args: ["--no-sandbox"],
    });
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.locator('[data-action="start"]').click();
    await page.evaluate(() => {
      state = normalize({
        ...DEFAULT,
        poseConfirmed: true,
        status: "common",
        role: "farmer",
        name: "봄날",
        story: "이웃과 함께 춤추었다.",
      });
      go(FLOW.POSE);
    });
    const poses = await page.evaluate(() =>
      window.LIBRARY_POSES.map((p) => p.alias),
    );
    assert.equal(poses.length, 13);
    assert.equal(await page.evaluate(() => D.lessonPoses.length), 37);
    const enabled = await page.evaluate(() =>
      posesFor(state).map((p) => p.alias),
    );
    for (const excluded of Object.keys(selection.excludedPoses))
      assert.ok(!enabled.includes(excluded), excluded);
    async function choosePose(alias) {
      const group = await page.evaluate((alias) => {
        go(FLOW.POSE);
        const p = D.lessonPoses.find((p) => p.alias === alias);
        return p.group || alias.replace(/_\d+$/, "");
      }, alias);
      await page.locator(`[data-pose-group="${group}"]`).click();
      while (
        await page.evaluate(
          (alias) =>
            groupedPoses(posePicker.group)[posePicker.index].alias !== alias,
          alias,
        )
      )
        await page.locator('[data-pose-turn="1"]').click();
      await page.locator('[data-action="confirmPose"]').click();
    }
    for (const pose of poses) {
      await choosePose(pose);
      assert.equal(await page.evaluate(() => state.pose), pose);
      assert.equal(
        await page.evaluate(
          () => normalize(JSON.parse(JSON.stringify(state))).pose,
        ),
        pose,
      );
    }
    // All native clothing, headwear, expressions and skin tones must survive PNG rendering.
    const combinations = await page.evaluate(async () => {
      const c = document.createElement("canvas");
      c.width = c.height = 360;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      const sample = document.createElement("canvas");
      sample.width = sample.height = 1;
      const sampleCtx = sample.getContext("2d", { willReadFrequently: true });
      let count = 0;
      for (const { alias: pose } of window.LIBRARY_POSES) {
        const base = { ...DEFAULT, pose, outfit: "daily", hair: "short_hair" };
        const variants = [
          ...D.clothes.map((cloth) => ({ ...base, cloth: cloth.alias })),
          ...hairsFor().map((hair) => ({ ...base, hair: hair.alias })),
          ...D.emotions.map((emotion) => ({ ...base, emotion: emotion.alias })),
          ...D.skintones.map((_, skin) => ({ ...base, skin })),
        ];
        let previousSkin = null;
        for (const variant of variants) {
          ctx.clearRect(0, 0, 360, 360);
          await drawAvatar(ctx, variant, 0, 0, 360);
          const pixels = ctx.getImageData(0, 0, 360, 360).data;
          let opaque = 0;
          for (let i = 3; i < pixels.length; i += 4)
            if (pixels[i] > 200) opaque++;
          if (opaque < 1000) throw Error(`Empty PNG: ${pose}`);
          if (
            variant.hair === "short_hair" &&
            variant.cloth === "baji" &&
            variant.emotion === "smiling"
          ) {
            sampleCtx.fillStyle = D.skintones[variant.skin].rgba;
            sampleCtx.fillRect(0, 0, 1, 1);
            const color = sampleCtx.getImageData(0, 0, 1, 1).data;
            const box = window.ART_LAYOUT[pose];
            let skinPixels = 0;
            for (let y = Math.ceil(box.y); y < box.y + box.h; y++) {
              for (
                let x = Math.ceil(box.x - box.w / 2);
                x < box.x + box.w / 2;
                x++
              ) {
                const i = (y * 360 + x) * 4;
                if (
                  pixels[i] === color[0] &&
                  pixels[i + 1] === color[1] &&
                  pixels[i + 2] === color[2] &&
                  pixels[i + 3] === 255
                )
                  skinPixels++;
              }
            }
            // Hands and sleeves intentionally occlude parts of several faces.
            // Require a visible face patch in the selected skin color, not a full oval.
            if (skinPixels < 300)
              throw Error(
                `Incomplete face color: ${pose} (${skinPixels} pixels)`,
              );
          }
          if (variant.skin !== base.skin) {
            const png = c.toDataURL();
            if (png === previousSkin)
              throw Error(`Skin color did not change: ${pose}`);
            previousSkin = png;
          }
          count++;
        }
      }
      return count;
    });
    await choosePose("dancing_04");
    await page.evaluate(() => {
      state.hair = "ikseongwan";
      state.top = "#9ED6C0";
      persist();
    });
    await page.reload();
    assert.equal(await page.evaluate(() => state.pose), "dancing_04");
    assert.equal(await page.evaluate(() => state.hair), "ikseongwan");
    const screenshotDir = process.env.SCREENSHOT_DIR || "/tmp/joseon-poses";
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotDir, "customize-desktop.png"),
      fullPage: true,
    });
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
    }
    await page.screenshot({
      path: path.join(screenshotDir, "customize-mobile.png"),
      fullPage: true,
    });
    const download = page.waitForEvent("download");
    await page.evaluate(() => exportPng(true));
    const png = await download;
    const file = path.join(screenshotDir, "new-pose.png");
    await png.saveAs(file);
    const bytes = fs.readFileSync(file);
    assert.equal(bytes.toString("hex", 0, 8), "89504e470d0a1a0a");
    assert.ok(bytes.length > 10000);
    await page.evaluate(() => {
      saveRecord(true);
      addToBoard(state.id, true);
    });
    await page.reload();
    assert.equal(await page.evaluate(() => saved[0].pose), "dancing_04");
    assert.equal(await page.evaluate(() => saved[0].top), "#9ED6C0");
    const boardDownload = page.waitForEvent("download");
    await page.evaluate(() => exportBoardPng());
    await (
      await boardDownload
    ).saveAs(path.join(screenshotDir, "new-pose-classroom.png"));
    assert.deepEqual(errors, []);
    console.log(
      `PASS: 13 grouped choices, 37 native poses, ${combinations} rendered combinations, excluded modern props, skin changes, reload, collection/classroom persistence, character/classroom PNG and 320/390px layouts.`,
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
