const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.goto(process.env.APP_URL || "http://127.0.0.1:4178");
    const result = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 360;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      async function pixels(svg) {
        const image = new Image();
        image.src =
          "data:image/svg+xml," +
          encodeURIComponent(await inlineSvgImages(wrapSvg(svg)));
        await image.decode();
        ctx.clearRect(0, 0, 360, 360);
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, 360, 360).data;
      }
      const measurements = [];
      for (const { alias: pose } of D.lessonPoses) {
        const base = `assets/images/result/${pose}/`;
        for (const outfit of ["queen", "princess"]) {
          const cloth = outfit === "queen" ? "chima" : "dopo_baeja";
          const native = await pixels(
            avatarLayers({
              ...DEFAULT,
              pose,
              outfit: "daily",
              cloth,
              hair: "short_hair",
              top: "#FFFFFF",
              bottom: "#FFFFFF",
              layer: "#FFFFFF",
            })
              .map(
                (l) =>
                  l.svg || `<image href="${l.src}" width="360" height="360"/>`,
              )
              .join(""),
          );
          const mask = await pixels(
            `<g fill="white">${garmentPaths(base, cloth, "top")}</g><g fill="black" stroke="black" stroke-width="6">${garmentPaths(base, cloth === "chima" ? "chima_baeja" : "dopo_baeja", "layer")}</g>`,
          );
          ctx.clearRect(0, 0, 360, 360);
          await drawAvatar(
            ctx,
            outfitState({ ...DEFAULT, pose, hair: "short_hair" }, outfit),
            0,
            0,
            360,
          );
          const actual = ctx.getImageData(0, 0, 360, 360).data;
          let ink = 0,
            lost = 0,
            addedWhite = 0;
          const neck = GARMENT_NECKLINES[pose];
          for (let j = 0; j < actual.length; j += 4) {
            if (mask[j] < 240 || mask[j + 3] < 240) continue;
            const x = (j / 4) % 360,
              y = Math.floor(j / 4 / 360);
            if (
              neck &&
              x > neck[0] - 14 &&
              x < neck[0] + neck[2] + 14 &&
              y > neck[1] - 14 &&
              y < neck[1] + neck[3] + 14
            )
              continue;
            if (
              native[j + 3] > 230 &&
              native[j] + native[j + 1] + native[j + 2] < 150
            ) {
              ink++;
              if (actual[j] + actual[j + 1] + actual[j + 2] > 400) lost++;
            }
            if (
              outfit === "princess" &&
              actual[j] > 235 &&
              actual[j + 1] > 235 &&
              actual[j + 2] > 225 &&
              actual[j + 3] > 240 &&
              !(
                native[j] > 210 &&
                native[j + 1] > 210 &&
                native[j + 2] > 200 &&
                native[j + 3] > 180
              )
            )
              addedWhite++;
          }
          measurements.push({ pose, outfit, ink, lost, addedWhite });
        }
      }
      return measurements;
    });
    require("node:fs").writeFileSync(
      "/tmp/garment-anatomy-measurements.json",
      JSON.stringify(result, null, 2),
    );
    for (const r of result) {
      assert.ok(
        r.lost <= Math.max(8, r.ink * 0.05),
        `Lost sleeve ink ${JSON.stringify(r)}`,
      );
      assert.ok(
        r.addedWhite < 12,
        `Unrequested hwarot cuff ${JSON.stringify(r)}`,
      );
    }
    console.log(
      `PASS: native sleeve ink preserved and hwarot cuff decorations absent in ${result.length} pose/outfit comparisons.`,
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
