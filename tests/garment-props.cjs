const assert = require("node:assert/strict");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const p = await b.newPage();
    await p.goto(process.env.APP_URL || "http://127.0.0.1:4178");
    const result = await p.evaluate(async () => {
      const c = document.createElement("canvas");
      c.width = c.height = 360;
      const ctx = c.getContext("2d", { willReadFrequently: true }),
        out = [];
      for (const pose of [
        "reading_writing_01",
        "reading_writing_03",
        "playing_music_05",
        "crafting_03",
        "with_child_04",
      ])
        for (const outfit of ["work_skirt", "queen", "princess", "myeonbok"]) {
          const s = outfitState({ ...DEFAULT, pose }, outfit),
            n = nativeLook(s),
            i = new Image();
          i.src = imageAsset(
            `assets/images/result/${pose}/clothes/${n.cloth}_overlay@2x.png`,
          );
          await i.decode();
          ctx.clearRect(0, 0, 360, 360);
          ctx.drawImage(i, 0, 0, 360, 360);
          const ref = ctx.getImageData(0, 0, 360, 360).data;
          ctx.clearRect(0, 0, 360, 360);
          await drawAvatar(ctx, s, 0, 0, 360);
          const actual = ctx.getImageData(0, 0, 360, 360).data;
          let painted = 0,
            lost = 0;
          for (let k = 0; k < ref.length; k += 4) {
            const rgb = [ref[k], ref[k + 1], ref[k + 2]];
            if (
              ref[k + 3] !== 255 ||
              Math.max(...rgb) - Math.min(...rgb) < 45 ||
              rgb.reduce((a, b) => a + b, 0) < 220
            )
              continue;
            painted++;
            if (rgb.some((v, j) => Math.abs(v - actual[k + j]) > 15)) lost++;
          }
          out.push({ pose, outfit, painted, lost });
        }
      return out;
    });
    for (const r of result)
      assert.ok(
        r.lost <= Math.max(6, r.painted * 0.01),
        `Props remain above clothing: ${JSON.stringify(r)}`,
      );
    console.log(
      "PASS: painted books, desks, instruments, flowers and child clothing remain above 20 garment/pose combinations.",
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
