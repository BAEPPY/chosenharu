const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const root = path.resolve(__dirname, "..");
(async () => {
  const port = process.env.GARMENT_TEST_PORT || "4180";
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
      await new Promise((r) => setTimeout(r, 100));
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
    await page.goto(`http://127.0.0.1:${port}`);
    await page.locator('[data-action="start"]').click();
    await page.evaluate(() => {
      state = normalize({ ...DEFAULT, status: "yangban", name: "시험 인물" });
      go(1);
    });
    assert.equal(
      await page.locator("#steps button, #steps a, #steps [tabindex]").count(),
      0,
    );
    for (const indicator of await page
      .locator("#steps .step-indicator")
      .all()) {
      await indicator.click();
      await page.keyboard.press("Enter");
      assert.equal(await page.evaluate(() => step), 1);
    }
    assert.equal(
      await page.locator('#steps [aria-current="step"]').innerText(),
      "2\n인물 정하기",
    );
    for (const status of ["royal", "yangban"])
      for (const gender of ["male", "female"]) {
        await page.evaluate(
          ({ status, gender }) => {
            state = normalize({
              ...DEFAULT,
              status,
              gender,
              name: "시험 인물",
            });
            suggestedFigures.clear();
            go(1);
          },
          { status, gender },
        );
        const options = await page
          .locator('[data-field="figure"] option')
          .evaluateAll((nodes) =>
            nodes.filter((n) => n.value).map((n) => n.value),
          );
        assert.equal(options.length, 20, `${status}/${gender}`);
        const current = await page.evaluate(() => state.figure);
        const selected = new Set(current ? [current] : []);
        const remaining = 20 - selected.size;
        for (let i = 0; i < remaining; i++) {
          await page.locator('[data-action="name"]').click();
          selected.add(await page.evaluate(() => state.figure));
        }
        assert.equal(
          selected.size,
          20,
          `repeated recommendation in ${status}/${gender}`,
        );
        for (const id of options) {
          await page.locator('[data-field="figure"]').selectOption(id);
          assert.equal(await page.evaluate(() => state.figure), id);
          assert.ok(await page.locator(".figure-info p").innerText());
          assert.equal(
            await page.evaluate(() => state.role === figureOf(state).role),
            true,
          );
        }
      }
    await page.locator('.chapter-footer [data-action="next"]').click();
    assert.equal(await page.evaluate(() => step), 2);
    const outfits = await page.evaluate(() => L.outfits.map((o) => o.id));
    assert.equal(outfits.length, 25);
    for (const outfit of outfits) {
      const button = page.locator(
        `[data-choice="outfit"][data-value="${outfit}"]`,
      );
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      assert.equal(await page.evaluate(() => state.outfit), outfit);
    }
    await page.locator('[data-choice="outfit"][data-value="princess"]').click();
    await page.locator('[data-field="top"]').fill("#823456");
    const before = await page.evaluate(() => ({ ...state }));
    await page.reload();
    assert.deepEqual(await page.evaluate(() => ({ ...state })), before);
    // The selected thumbnail and portrait must show the same custom colors.
    const same = await page.evaluate(() => {
      const clean = (s) => s.replace(/garment\d+/g, "garment");
      return (
        clean(document.querySelector("#avatar").innerHTML) ===
        clean(
          document.querySelector(
            '[data-choice="outfit"][aria-pressed="true"] svg',
          ).outerHTML,
        )
      );
    });
    assert.equal(same, true);
    // Preserve authored palettes while repairing the old unedited brown default.
    assert.deepEqual(
      await page.evaluate(() => {
        const a = normalize({ ...DEFAULT, status: "yangban", outfit: "royal" });
        const b = normalize({
          ...DEFAULT,
          status: "yangban",
          outfit: "royal",
          top: "#123456",
        });
        return [a.top, b.top];
      }),
      ["#B82647", "#123456"],
    );
    const checks = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 360;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      let count = 0;
      const shapePNGs = [];
      for (const { alias: pose } of D.lessonPoses)
        for (const { id: outfit } of L.outfits) {
          const s = outfitState(
            { ...DEFAULT, pose, hair: "short_hair" },
            outfit,
          );
          for (const { svg } of avatarLayers(s))
            if (
              svg &&
              new DOMParser()
                .parseFromString(wrapSvg(svg), "image/svg+xml")
                .querySelector("parsererror")
            )
              throw Error(`Invalid SVG ${pose}/${outfit}`);
          ctx.clearRect(0, 0, 360, 360);
          await drawAvatar(ctx, s, 0, 0, 360);
          const data = ctx.getImageData(0, 0, 360, 360).data;
          let visible = 0;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 200) visible++;
          if (visible < 1000) throw Error(`Empty rendering ${pose}/${outfit}`);
          count++;
        }
      // Different construction remains visible with the SAME palette.
      for (const outfit of [
        "queen",
        "princess",
        "wonsam",
        "noui",
        "myeonbok",
        "work",
        "apron",
      ]) {
        const s = {
          ...outfitState(DEFAULT, outfit),
          top: "#888888",
          bottom: "#888888",
          layer: "#888888",
        };
        ctx.clearRect(0, 0, 360, 360);
        await drawAvatar(ctx, s, 0, 0, 360);
        shapePNGs.push(canvas.toDataURL());
      }
      const linked = avatarLayers(
        outfitState({ ...DEFAULT, pose: "posing_01" }, "princess"),
      ).find((l) => l.svg?.includes("<image")).svg;
      const embedded = await inlineSvgImages(linked);
      if (/href="art-library/.test(embedded))
        throw Error("Unembedded PNG in SVG export");
      // Compare standalone PNG compositing to the complete SVG used by the UI.
      const samples = ["holding_fan_03", "posing_01", "dancing_04"];
      for (const pose of samples) {
        const s = outfitState({ ...DEFAULT, pose }, "princess");
        ctx.clearRect(0, 0, 360, 360);
        await drawAvatar(ctx, s, 0, 0, 360);
        const png = ctx.getImageData(0, 0, 360, 360).data;
        const image = new Image();
        image.src =
          "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(await inlineSvgImages(avatarSvg(s)));
        await image.decode();
        ctx.clearRect(0, 0, 360, 360);
        ctx.drawImage(image, 0, 0, 360, 360);
        const svg = ctx.getImageData(0, 0, 360, 360).data;
        let diff = 0;
        for (let i = 0; i < png.length; i++)
          if (Math.abs(png[i] - svg[i]) > 8) diff++;
        if (diff > png.length * 0.005)
          throw Error(`PNG/preview mismatch ${pose}: ${diff}`);
      }
      return { count, shapes: new Set(shapePNGs).size };
    });
    assert.equal(checks.count, 900);
    assert.equal(checks.shapes, 7);
    for (const hair of ["myeonryugwan", "tanggeon"]) {
      await page.locator('[data-style="hair"]').click();
      await page.locator(`[data-choice="hair"][data-value="${hair}"]`).click();
      assert.equal(await page.evaluate(() => state.hair), hair);
    }
    await page.locator('[data-style="outfit"]').click();
    await page.locator('[data-choice="outfit"][data-value="myeonbok"]').click();
    await page.locator('[data-style="hair"]').click();
    await page
      .locator('[data-choice="hair"][data-value="myeonryugwan"]')
      .click();
    await page.locator('[data-style="outfit"]').click();
    const dir = process.env.GARMENT_SCREENSHOT_DIR || "/tmp/joseon-garments";
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({
      path: path.join(dir, "desktop.png"),
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
      path: path.join(dir, "mobile.png"),
      fullPage: true,
    });
    await page.locator('.chapter-footer [data-action="next"]').click();
    await page
      .locator('[data-field="story"]')
      .fill("옷을 갖추고 하루를 시작했다.");
    await page.locator('.chapter-footer [data-action="next"]').click();
    const download = page.waitForEvent("download");
    await page.locator('[data-action="characterPng"]').click();
    const file = path.join(dir, "myeonbok.png");
    await (await download).saveAs(file);
    assert.ok(fs.statSync(file).size > 10000);
    await page.locator('.chapter-footer [data-action="next"]').click();
    assert.equal(await page.locator("#savedCount").innerText(), "1");
    assert.deepEqual(errors, []);
    console.log(
      `PASS: passive steps, 80 historical figures, no early name repeats, 25 outfit choices, ${checks.count} pose/outfit PNG renders, 7 distinct constructions with equal colors, custom colors/reload, SVG/PNG agreement, headwear, save and mobile layouts.`,
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
