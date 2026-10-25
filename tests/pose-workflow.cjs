const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const p = await b.newPage({
        viewport: { width: 1280, height: 900 },
        reducedMotion: "reduce",
      }),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    await p.goto(process.env.APP_URL || "http://127.0.0.1:4178");
    await p.locator('[data-action="start"]').click();
    await p.locator(".spin-button").click();
    await p.waitForFunction(() => !spinning && draws === 1);
    await p.locator(".accept-button").click();
    assert.equal(await p.evaluate(() => step), 1);
    assert.equal(await p.locator(".pose-group").count(), 14);
    assert.ok(
      await p.locator('.chapter-footer [data-action="next"]').isDisabled(),
    );
    assert.equal(
      await p.locator('[data-field="name"], [data-choice="outfit"]').count(),
      0,
    );
    assert.equal(
      await p.evaluate(() => {
        const pose = D.lessonPoses[0].alias;
        return posePreviewSvg(pose).includes(
          imageAsset(`assets/images/result/${pose}/emotions/smiling@2x.png`),
        );
      }),
      false,
    );
    const before = await p.evaluate(() => JSON.stringify(state));
    await p.locator('[data-pose-group="dancing_hansam"]').click();
    assert.match(await p.locator(".pose-pager").innerText(), /1 \/ 4/);
    await p.keyboard.press("ArrowLeft");
    assert.match(await p.locator(".pose-pager").innerText(), /4 \/ 4/);
    await p.keyboard.press("Escape");
    assert.equal(await p.evaluate(() => JSON.stringify(state)), before);
    await p.locator('[data-pose-group="with_child"]').click();
    await p.locator('[data-pose-turn="1"]').click();
    await p.locator('[data-action="confirmPose"]').click();
    assert.equal(await p.evaluate(() => step), 2);
    assert.equal(await p.evaluate(() => state.pose), "with_child_04");
    await p.locator('.chapter-footer [data-action="next"]').click();
    assert.equal(await p.evaluate(() => step), 3);
    await p.locator('[data-choice="outfit"][data-value="queen"]').click();
    const chosen = await p.evaluate(() => ({
      pose: state.pose,
      top: state.top,
      outfit: state.outfit,
    }));
    await p.reload();
    assert.deepEqual(
      await p.evaluate(() => ({
        pose: state.pose,
        top: state.top,
        outfit: state.outfit,
      })),
      chosen,
    );
    await p.locator('[data-action="changePose"]').click();
    for (const width of [390, 320]) {
      await p.setViewportSize({ width, height: 844 });
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await p.locator('[data-pose-group="lying"]').click();
      assert.ok(await p.locator('[data-pose-turn="1"]').isDisabled());
      const rect = await p.locator("#modal").boundingBox();
      assert.ok(rect.x >= 0 && rect.x + rect.width <= width);
      await p.locator('[data-action="close"]').last().click();
    }
    fs.mkdirSync("/workspace/chosenharu-review/round-2", { recursive: true });
    await p.screenshot({
      path: "/workspace/chosenharu-review/round-2/pose-groups-mobile.png",
      fullPage: true,
    });
    await p.locator('[data-pose-group="dancing_hansam"]').click();
    await p.screenshot({
      path: "/workspace/chosenharu-review/round-2/pose-picker-mobile.png",
    });
    await p.keyboard.press("Escape");
    // Existing saved creations retain their customization and resume at the same stage.
    await p.evaluate(() => {
      const old = {
        ...state,
        pose: "dancing_01",
        name: "이전 인물",
        top: "#123456",
      };
      delete old.poseConfirmed;
      localStorage.setItem(
        KEY,
        JSON.stringify({ state: old, step: 2, saved: [] }),
      );
      history.replaceState({}, "", "#step-3");
    });
    await p.reload();
    assert.equal(await p.evaluate(() => step), 3);
    assert.equal(await p.evaluate(() => state.poseConfirmed), true);
    assert.equal(await p.evaluate(() => state.top), "#123456");
    assert.equal(new URL(p.url()).hash, "#step-4");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: status → grouped faceless poses → identity → clothing; 14 groups, cancel/keyboard/confirmation, customization persistence, legacy migration, 320/390px screens.",
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
