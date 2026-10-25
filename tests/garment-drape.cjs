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
    const page = await browser.newPage();
    await page.goto(process.env.APP_URL || "http://127.0.0.1:4178");
    const results = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 360;
      const ctx = canvas.getContext("2d", { willReadFrequently: true }),
        results = [];
      for (const outfit of ["myeonbok", "work_apron", "palace"])
        for (const pose of [
          "holding_fan_03",
          "dancing_hansam_03",
          "cheering_04",
          "posing_03",
        ]) {
          const s = outfitState({ ...DEFAULT, pose }, outfit);
          // An isolated custom panel color distinguishes the fabric from props,
          // shoes and the underlying clothing when measuring connected pixels.
          if (outfit === "myeonbok") s.bottom = "#DE39B7";
          s.layer = "#DE39B7";
          const xml = new DOMParser().parseFromString(
            avatarSvg(s),
            "image/svg+xml",
          );
          const cloth = xml.querySelector("[data-bulseul], [data-waist-apron]");
          const panel = new Path2D(cloth.getAttribute("d"));
          ctx.clearRect(0, 0, 360, 360);
          await drawAvatar(ctx, s, 0, 0, 360);
          const p = ctx.getImageData(0, 0, 360, 360).data,
            mask = new Uint8Array(360 * 360);
          let total = 0;
          for (let i = 0; i < mask.length; i++)
            if (
              ctx.isPointInPath(
                panel,
                (i % 360) + 0.5,
                Math.floor(i / 360) + 0.5,
              ) &&
              Math.abs(p[i * 4] - 222) < 4 &&
              Math.abs(p[i * 4 + 1] - 57) < 4 &&
              Math.abs(p[i * 4 + 2] - 183) < 4 &&
              p[i * 4 + 3] > 240
            ) {
              mask[i] = 1;
              total++;
            }
          let largest = 0;
          for (let i = 0; i < mask.length; i++)
            if (mask[i]) {
              const queue = [i];
              mask[i] = 0;
              for (let j = 0; j < queue.length; j++) {
                const k = queue[j];
                for (const n of [
                  k - 360,
                  k + 360,
                  ...(k % 360 ? [k - 1] : []),
                  ...(k % 360 < 359 ? [k + 1] : []),
                ])
                  if (n >= 0 && n < mask.length && mask[n]) {
                    mask[n] = 0;
                    queue.push(n);
                  }
              }
              largest = Math.max(largest, queue.length);
            }
          results.push({ outfit, pose, total, connected: largest / total });
        }
      const xml = new DOMParser().parseFromString(
        wrapSvg(courtHeadShape("myeonryugwan")),
        "image/svg+xml",
      );
      const strings = [...xml.querySelectorAll('[data-ryu="front"]')].map(
        (g) => ({
          beads: g.querySelectorAll("circle").length,
          path: g.querySelector("path").getAttribute("d"),
        }),
      );
      const shoulders = [];
      for (const [pose, x, y] of [
        ["holding_fan_03", 239, 140],
        ["reading_writing_01", 228, 168],
      ]) {
        ctx.clearRect(0, 0, 360, 360);
        await drawAvatar(
          ctx,
          outfitState({ ...DEFAULT, pose }, "wonsam"),
          0,
          0,
          360,
        );
        shoulders.push({
          pose,
          rgb: Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3),
        });
      }
      return { results, strings, shoulders };
    });
    for (const r of results.results) {
      assert.ok(r.total > 200, `Visible fabric: ${JSON.stringify(r)}`);
      assert.ok(
        r.connected > 0.96,
        `A single connected front cloth: ${JSON.stringify(r)}`,
      );
    }
    for (const s of results.shoulders)
      assert.ok(
        s.rgb.every((v, i) => Math.abs(v - [65, 113, 65][i]) < 4),
        `Cuff stays away from shoulder: ${JSON.stringify(s)}`,
      );
    assert.equal(results.strings.length, 9);
    for (const s of results.strings) {
      assert.equal(s.beads, 9);
      assert.match(
        s.path,
        / -25V13$/,
        "Every front ryu starts at the board edge and remains continuous",
      );
    }
    console.log(
      "PASS: 12 standing/spread-leg robe and apron panels remain connected; 9 crown strings each carry 9 beads and meet the board.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
