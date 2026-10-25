// Measure the visible sleeve adjoining each actual hand in the native avatar.
const fs = require("node:fs");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const page = await b.newPage();
    await page.goto(process.env.APP_URL || "http://127.0.0.1:4178");
    const data = await page.evaluate(async () => {
      const c = document.createElement("canvas");
      c.width = c.height = 360;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      async function pixels(svg) {
        const i = new Image();
        i.src =
          "data:image/svg+xml," +
          encodeURIComponent(await inlineSvgImages(wrapSvg(svg)));
        await i.decode();
        ctx.clearRect(0, 0, 360, 360);
        ctx.drawImage(i, 0, 0);
        return ctx.getImageData(0, 0, 360, 360).data;
      }
      ctx.fillStyle = D.skintones[DEFAULT.skin].rgba;
      ctx.fillRect(0, 0, 1, 1);
      const skin = ctx.getImageData(0, 0, 1, 1).data;
      const out = {};
      for (const [pose, d] of Object.entries(GARMENT_HAND_OPENINGS)) {
        out[pose] = {};
        const pix = await pixels(`<path d="${d}" fill="white"/>`),
          mask = new Uint8Array(129600),
          components = [];
        for (let i = 0; i < mask.length; i++)
          mask[i] = pix[i * 4 + 3] > 100 ? 1 : 0;
        for (let i = 0; i < mask.length; i++)
          if (mask[i]) {
            const q = [i];
            mask[i] = 0;
            for (let j = 0; j < q.length; j++) {
              const k = q[j];
              for (const n of [k - 360, k + 360, k - 1, k + 1])
                if (n >= 0 && n < mask.length && mask[n]) {
                  mask[n] = 0;
                  q.push(n);
                }
            }
            if (q.length > 3) components.push(q);
          }
        for (const cloth of ["chima", "dopo_baeja"]) {
          const parts = avatarLayers(
            {
              ...DEFAULT,
              pose,
              outfit: "daily",
              cloth,
              hair: "short_hair",
              top: "#FF00FF",
              bottom: "#000000",
              layer: "#000000",
            },
            { faceless: true },
          );
          const visible = await pixels(
            parts
              .map(
                (l) =>
                  l.svg || `<image href="${l.src}" width="360" height="360"/>`,
              )
              .join(""),
          );
          const centers = [];
          for (const component of components) {
            const skinPoints = component.filter((k) =>
              [0, 1, 2].every(
                (j) => Math.abs(visible[k * 4 + j] - skin[j]) < 12,
              ),
            );
            if (skinPoints.length < 4) continue;
            const x =
                skinPoints.reduce((s, v) => s + (v % 360) + 0.5, 0) /
                skinPoints.length,
              y =
                skinPoints.reduce((s, v) => s + Math.floor(v / 360) + 0.5, 0) /
                skinPoints.length;
            const near = centers.find(
              (v) => Math.hypot(v[0] - x, v[1] - y) < 20,
            );
            if (near) {
              near[0] = (near[0] + x) / 2;
              near[1] = (near[1] + y) / 2;
            } else centers.push([x, y]);
          }
          out[pose][cloth] = centers.flatMap(([x, y]) => {
            let vx = 0,
              vy = 0,
              n = 0;
            for (
              let py = Math.max(0, Math.floor(y - 30));
              py < Math.min(360, y + 30);
              py++
            )
              for (
                let px = Math.max(0, Math.floor(x - 30));
                px < Math.min(360, x + 30);
                px++
              ) {
                const dx = px - x,
                  dy = py - y,
                  dist = Math.hypot(dx, dy),
                  j = (py * 360 + px) * 4;
                if (
                  dist > 6 &&
                  dist < 30 &&
                  visible[j] > 245 &&
                  visible[j + 1] < 10 &&
                  visible[j + 2] > 245
                ) {
                  vx += dx / (dist * dist);
                  vy += dy / (dist * dist);
                  n++;
                }
              }
            return n < 5
              ? []
              : [
                  [x, y, (Math.atan2(vy, vx) * 180) / Math.PI].map(
                    (v) => Math.round(v * 100) / 100,
                  ),
                ];
          });
        }
      }
      return out;
    });
    fs.writeFileSync(
      "js/art/garment-cuff-directions.js",
      '"use strict";\n// Generated from visible native hands and sleeves, including prop occlusion.\nconst GARMENT_CUFF_DIRECTIONS = ' +
        JSON.stringify(data, null, 2) +
        ";\n",
    );
    console.log("Measured visible sleeve directions for 37 poses.");
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
