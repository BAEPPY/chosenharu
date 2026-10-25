const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const root = path.resolve(__dirname, "..");
(async () => {
  const port = process.env.TEST_PORT || "4174";
  const server = spawn(
    "python",
    ["-m", "http.server", port, "--bind", "127.0.0.1"],
    { cwd: root, stdio: "ignore" },
  );
  let browser;
  try {
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        if ((await fetch(`http://127.0.0.1:${port}`)).ok) break;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      headless: true,
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1050 },
      reducedMotion: "reduce",
      acceptDownloads: true,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    const origin = `http://127.0.0.1:${port}`;
    await page.goto(origin);
    await page.locator('[data-action="start"]').click();
    assert.equal(await page.locator(".draw-card").count(), 4);
    assert.equal(await page.locator(".accept-button").isDisabled(), true);
    const expected = ["common", "yangban", "technical", "low"];
    for (let index = 0; index < 4; index++) {
      await page.evaluate((value) => {
        Math.random = () => value;
      }, [0.6, 0.05, 0.2, 0.9][index]);
      await page.locator(".spin-button").click();
      await page.waitForFunction(
        (index) =>
          document
            .querySelector(`[data-draw-index="${index}"]`)
            ?.getAttribute("aria-pressed") === "true",
        index,
      );
      const stored = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("joseon-classroom-v2")),
      );
      assert.equal(stored.drawHistory[index], expected[index]);
      // The rendered wedge under the right pointer must match the recorded draw.
      assert.equal(
        await page.evaluate(() => {
          const style = document.querySelector("#wheel").style.transform;
          const angle = Number(style.match(/rotate\(([-\d.]+)deg\)/)[1]);
          const wedge = Math.floor(((360 - (angle % 360)) % 360) / 18);
          return WHEEL_ENTRIES[wedge];
        }),
        expected[index],
      );
    }
    assert.equal(new URL(page.url()).hash, "#step-1");
    assert.equal(await page.locator(".spin-button").isDisabled(), true);
    for (let index = 3; index >= 0; index--) {
      await page.locator(`[data-draw-index="${index}"]`).click();
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("joseon-classroom-v2"))
              .selectedDraw,
        ),
        index,
      );
    }
    await page.locator('[data-draw-index="1"]').focus();
    await page.keyboard.press("Enter");
    await page.reload();
    await page.locator(".draw-card.is-selected").waitFor();
    assert.equal(
      await page.locator('[data-draw-index="1"]').getAttribute("aria-pressed"),
      "true",
    );
    await page.evaluate(() => document.fonts.ready);
    assert.ok(
      await page.evaluate(() => document.fonts.check("16px Pretendard")),
    );
    assert.equal(
      await page
        .locator(".toss-icon")
        .first()
        .evaluate((el) => getComputedStyle(el).fontFamily),
      "Tossface, sans-serif",
    );
    const screenshotDir = process.env.SCREENSHOT_DIR || "/tmp/joseon-qa";
    fs.mkdirSync(screenshotDir, { recursive: true });
    await page.screenshot({
      path: path.join(screenshotDir, "desktop.png"),
      fullPage: true,
    });
    await page.locator(".probability-details summary").click();
    assert.match(
      await page.locator(".probability-history").innerText(),
      /1717년 단성현/,
    );
    assert.match(
      await page.locator(".probability-table").innerText(),
      /18\.6%/,
    );
    await page.locator(".probability-details summary").click();
    await page.locator(".accept-button").click();
    await page.locator('[data-pose-group="reading_writing"]').click();
    await page.locator('[data-action="confirmPose"]').click();
    await page.locator('[data-field="name"]').fill("봄날");
    await page.locator('.chapter-footer [data-action="next"]').click();
    await page.locator('[data-palette="top"][data-color="#9ED6C0"]').click();
    assert.equal(
      await page.locator('[data-field="top"]').inputValue(),
      "#9ed6c0",
    );

    await page.locator('.chapter-footer [data-action="next"]').click();
    await page
      .locator('[data-field="story"]')
      .fill("아침에 책을 읽고 이웃과 이야기를 나누었다.");
    await page.locator('.chapter-footer [data-action="next"]').click();
    assert.match(await page.locator(".story-card").innerText(), /봄날/);
    await page.locator('.chapter-footer [data-action="next"]').click();
    assert.equal(await page.locator("#savedCount").innerText(), "1");
    const download = page.waitForEvent("download");
    await page.locator('[data-action="png"]').click();
    const png = await download;
    assert.match(png.suggestedFilename(), /\.png$/);
    await page.locator('[data-action="addCurrent"]').click();
    assert.equal(await page.locator("[data-person]").count(), 1);
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="start"]').click();
    while (await page.locator('.chapter-footer [data-action="prev"]').count())
      await page.locator('.chapter-footer [data-action="prev"]').click();
    assert.equal(
      await page
        .locator(".draw-card.is-selected")
        .getAttribute("data-draw-index"),
      "1",
    );
    // Starting a new character resets just that character's draw history.
    await page.locator('[data-action="gallery"]').first().click();
    await page.locator('[data-action="new"]').click();
    assert.equal(await page.locator(".draw-card:disabled").count(), 4);
    assert.equal(await page.locator("#savedCount").innerText(), "1");
    // Gallery loading resumes a character, without synthesizing four spins.
    await page.locator('[data-action="gallery"]').first().click();
    await page.locator("[data-load]").first().click();
    while (await page.locator('.chapter-footer [data-action="prev"]').count())
      await page.locator('.chapter-footer [data-action="prev"]').click();
    assert.equal(await page.locator(".draw-card.is-selected").count(), 0);
    assert.equal(await page.locator(".spin-button").isDisabled(), false);
    assert.match(
      await page.locator(".draw-history-heading").innerText(),
      /0 \/ 4회/,
    );
    assert.match(
      await page.locator(".accept-button").innerText(),
      /기존 인물 이어하기/,
    );
    assert.equal(await page.evaluate(() => state.name), "봄날");

    // Both old storage and the already-persisted screenshot state repair on reload.
    for (const history of [undefined, [null, null, null, "common"], []]) {
      await page.evaluate((history) => {
        const data = JSON.parse(localStorage.getItem("joseon-classroom-v2"));
        localStorage.setItem(
          "joseon-classroom-v2",
          JSON.stringify({
            ...data,
            state: {
              ...data.state,
              status: "common",
              name: "옛 인물",
              story: "보존할 이야기",
              top: "#9ED6C0",
            },
            draws: 4,
            drawHistory: history,
            selectedDraw: 3,
            weights: [0, 10, 10, 70, 10],
            step: 0,
          }),
        );
      }, history);
      await page.reload();
      assert.equal(await page.locator(".draw-card:disabled").count(), 4);
      assert.equal(await page.locator(".draw-card.is-selected").count(), 0);
      assert.equal(await page.locator(".spin-button").isDisabled(), false);
      assert.match(
        await page.locator(".draw-history-heading").innerText(),
        /0 \/ 4회/,
      );
      assert.doesNotMatch(
        await page.locator(".draw-result").innerText(),
        /4번째|상민/,
      );
      assert.equal(await page.evaluate(() => state.story), "보존할 이야기");
      assert.equal(await page.evaluate(() => state.top), "#9ED6C0");
      assert.equal(await page.locator("#savedCount").innerText(), "1");
      assert.equal(await page.evaluate(() => board.length), 1);
      await page.locator(".accept-button").click();
      await page.locator('.chapter-footer [data-action="next"]').click();
      assert.equal(
        await page.locator('[data-field="name"]').inputValue(),
        "옛 인물",
      );
      while (await page.locator('.chapter-footer [data-action="prev"]').count())
        await page.locator('.chapter-footer [data-action="prev"]').click();
      await page.reload();
      assert.equal(await page.locator(".draw-card.is-selected").count(), 0);
      await page.evaluate(() => {
        Math.random = () => 0.5;
      });
      await page.locator(".spin-button").click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-draw-index="0"]')
            .getAttribute("aria-pressed") === "true",
      );
      assert.match(
        await page.locator(".draw-history-heading").innerText(),
        /1 \/ 4회/,
      );
      await page.reload();
      assert.equal(
        await page
          .locator(".draw-card.is-selected")
          .getAttribute("data-draw-index"),
        "0",
      );
      assert.equal(await page.locator(".draw-card:disabled").count(), 3);
    }
    assert.deepEqual(await page.evaluate(() => weights), [0, 10, 10, 70, 10]);
    await page.locator(".probability-details summary").click();
    assert.match(
      await page.locator(".probability-table").innerText(),
      /70\.0%/,
    );
    await page.locator('[data-action="weights"]').click();
    await page.locator(".weight-settings summary").click();
    for (let i = 0; i < 5; i++)
      await page.locator(`[name="weight${i}"]`).fill("0");
    await page.locator('#weightForm [type="submit"]').click();
    assert.equal(await page.locator("#modal").evaluate((el) => el.open), true);
    await page.locator('[name="weight2"]').fill("100");
    await page.locator('#weightForm [type="submit"]').click();
    assert.equal(await page.locator(".spin-button").isDisabled(), false);
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.screenshot({
        path: path.join(screenshotDir, `mobile-${width}.png`),
        fullPage: true,
      });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width}`,
      );
    }
    // Early acceptance still works and can return to remaining draws.
    await page.evaluate(() => localStorage.removeItem("joseon-classroom-v2"));
    await page.reload();
    await page.locator(".spin-button").click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-draw-index="0"]')
          .getAttribute("aria-pressed") === "true",
    );
    await page.locator(".accept-button").click();
    assert.equal(new URL(page.url()).hash, "#step-2");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: four draws, every selection, pointer agreement, reload, keyboard, historical/custom probabilities, migration, early acceptance, customization, story, PNG, collection, classroom, new character, local fonts, 390/320px layout; no page or network errors.",
    );
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
