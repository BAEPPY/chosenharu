const assert = require("node:assert/strict");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(process.env.APP_URL || "http://127.0.0.1:4190");
    assert.equal(
      await page
        .getByRole("button", { name: "새로 만들기", exact: true })
        .count(),
      1,
    );
    assert.equal(
      await page.locator('[data-action="resume"]').isDisabled(),
      true,
    );
    await page.locator('[data-action="start"]').click();
    assert.match(await page.locator(".wheel-legend").innerText(), /중인/);
    assert.equal(await page.locator(".wheel-note").count(), 0);
    await page.evaluate(() => {
      state = {
        ...DEFAULT,
        status: "common",
        gender: "female",
        role: "farmer",
        name: "고운",
        pose: "trudging_01",
        poseConfirmed: true,
        story: "밭에서 채소를 돌보았다.",
      };
      go(FLOW.LOOK);
    });
    const recommended = () =>
      page
        .locator('[data-choice="outfit"]')
        .evaluateAll((nodes) =>
          nodes
            .filter((n) => n.querySelector(".recommendation-badge"))
            .map((n) => n.dataset.value),
        );
    assert.deepEqual(await recommended(), ["daily", "work_skirt"]);
    assert.equal(await page.locator('[data-choice="outfit"]').count(), 20);
    await page.locator('[data-choice="outfit"][data-value="official"]').click();
    assert.deepEqual(
      await recommended(),
      ["daily", "work_skirt"],
      "choosing a costume does not change the role recommendation",
    );
    await page.evaluate(() => {
      go(FLOW.IDENTITY);
    });
    await page.locator('[data-role="artisan"]').click();
    await page.locator('.chapter-footer [data-action="next"]').click();
    assert.deepEqual(await recommended(), ["apron", "work_apron"]);
    await page.evaluate(() => {
      go(FLOW.IDENTITY);
    });
    await page.locator('[data-gender="male"]').click();
    await page.locator('[data-role="artisan"]').click();
    await page.locator('.chapter-footer [data-action="next"]').click();
    assert.deepEqual(await recommended(), ["work", "work_apron"]);
    const snapshot = await page.evaluate(() => ({ ...state }));
    await page.locator('[data-action="home"]').first().click();
    await page.reload();
    await page.locator('[data-action="resume"]').click();
    assert.equal(await page.evaluate(() => step), 3);
    assert.deepEqual(await page.evaluate(() => ({ ...state })), snapshot);
    // The board remembers the last editing step, including through the home page.
    await page.locator('[data-action="board"]').first().click();
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="resume"]').click();
    assert.equal(await page.evaluate(() => step), 3);
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="start"]').click();
    assert.equal(await page.locator("#modal").evaluate((n) => n.open), true);
    await page.locator('#modal [data-action="close"]').last().click();
    await page.locator('[data-action="resume"]').click();
    assert.deepEqual(
      await page.evaluate(() => ({ ...state })),
      snapshot,
      "cancelling new preserves work",
    );
    await page.evaluate(() => {
      saveRecord(true);
    });
    await page.locator('[data-action="home"]').first().click();
    await page.locator('[data-action="start"]').click();
    assert.equal(await page.evaluate(() => state.status), "");
    assert.equal(await page.evaluate(() => saved.length), 1);
    assert.equal(await page.evaluate(() => drawHistory.length), 0);
    await page.locator('[data-action="home"]').first().click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        true,
      );
      assert.equal(
        await page.locator('[data-action="resume"]').isDisabled(),
        true,
      );
    }
    // Every valid role/gender has suggestions, and every suggestion is selectable.
    const coverage = await page.evaluate(() =>
      L.roles.flatMap((role) =>
        (role.gender === "any" ? ["male", "female"] : [role.gender]).map(
          (gender) => {
            const ids = recommendedOutfits({
              ...DEFAULT,
              status: role.status,
              role: role.id,
              gender,
            });
            return {
              role: role.id,
              gender,
              ids,
              valid: ids.every((id) => L.outfits.some((o) => o.id === id)),
            };
          },
        ),
      ),
    );
    assert.ok(coverage.every((row) => row.ids.length && row.valid));
    assert.deepEqual(errors, []);
    console.log(
      "PASS: separate new/continue, resume after reload/board, cancellation and saved-work preservation, role/gender badges before selection, allowed choices and 320px layout.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
