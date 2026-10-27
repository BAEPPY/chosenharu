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
    const p = await browser.newPage();
    await p.goto(process.env.APP_URL || "http://127.0.0.1:4190");
    const result = await p.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 360;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const failures = [];
      let checked = 0;
      // All five skin tones and all clothes: a hand needs both skin and a contour,
      // and must emerge from the appropriate short/long sleeve opening.
      for (const pose of ["trudging_01", "trudging_03"])
        for (const outfit of [
          ...L.outfits,
          { id: "daily", cloth: "dopo_baeja" },
        ])
          for (let skin = 0; skin < 5; skin++) {
            const s = outfitState(
              { ...DEFAULT, outfit: "", pose, skin, hair: "short_hair" },
              outfit.id,
            );
            const long = nativeLook(s).cloth === "dopo_baeja";
            const regions =
              pose === "trudging_01"
                ? long
                  ? [
                      [152, 248, 167, 267],
                      [205, 247, 219, 266],
                    ]
                  : [
                      [153, 223, 168, 241],
                      [201, 222, 215, 238],
                    ]
                : long
                  ? [[136, 232, 153, 248]]
                  : [[148, 205, 164, 219]];
            ctx.clearRect(0, 0, 360, 360);
            await drawAvatar(ctx, s, 0, 0, 360);
            const actual = ctx.getImageData(0, 0, 360, 360).data;
            ctx.clearRect(0, 0, 360, 360);
            ctx.fillStyle = D.skintones[skin].rgba;
            ctx.fillRect(0, 0, 1, 1);
            const color = ctx.getImageData(0, 0, 1, 1).data;
            for (const [x0, y0, x1, y1] of regions) {
              let skinPixels = 0,
                ink = 0;
              for (let y = y0; y < y1; y++)
                for (let x = x0; x < x1; x++) {
                  const i = (y * 360 + x) * 4;
                  if (actual[i + 3] < 240) continue;
                  if (
                    [0, 1, 2].every(
                      (c) => Math.abs(actual[i + c] - color[c]) < 8,
                    )
                  )
                    skinPixels++;
                  if (actual[i] + actual[i + 1] + actual[i + 2] < 180) ink++;
                }
              if (skinPixels < 6 || ink < 10)
                failures.push({
                  pose,
                  outfit: outfit.id,
                  skin,
                  skinPixels,
                  ink,
                });
            }
            checked++;
          }
      return { checked, failures };
    });
    assert.deepEqual(result.failures, []);
    assert.equal(result.checked, 260);
    console.log(
      "PASS: visible, outlined hands at the cuff in both walking poses, all 25 outfits and all five skin tones, including the daily robe variant (260 rendered combinations).",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
