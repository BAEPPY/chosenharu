const fs = require("fs");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
(async () => {
  const b = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const p = await b.newPage();
    await p.goto(process.env.APP_URL || "http://127.0.0.1:4178");
    const shapes = await p.evaluate(async () => {
      const c = document.createElement("canvas");
      c.width = c.height = 360;
      const ctx = c.getContext("2d", { willReadFrequently: true }),
        result = {};
      const trace = (pts) => {
        const rows = {};
        for (const k of pts) (rows[Math.floor(k / 360)] ??= []).push(k % 360);
        return Object.entries(rows)
          .map(([y, xs]) => {
            xs.sort((a, b) => a - b);
            let a = xs[0],
              z = a,
              s = "";
            for (const x of [...xs.slice(1), 999]) {
              if (x !== z + 1) {
                s += `M${a} ${y}h${z - a + 1}v1H${a}Z`;
                a = x;
              }
              z = x;
            }
            return s;
          })
          .join("");
      };
      for (const [pose, cuffs] of Object.entries(GARMENT_CUFF_DIRECTIONS)) {
        result[pose] = {};
        const base = `assets/images/result/${pose}/`;
        for (const cloth of ["chima", "dopo_baeja"]) {
          result[pose][cloth] = {};
          const top = garmentPaths(base, cloth, "top"),
            body = garmentPaths(
              base,
              cloth === "chima" ? "chima_baeja" : "dopo_baeja",
              "layer",
            );
          for (const depth of [7, 12, 17, 19, 22]) {
            const merged = new Set();
            for (const [x, y, angle] of cuffs[cloth]) {
              const rad = (angle * Math.PI) / 180,
                head = window.ART_LAYOUT[pose];
              const outward =
                -Math.sin(rad) * (x - (head.headX ?? head.x + 6)) +
                  Math.cos(rad) * (y - (head.headY ?? head.y + 10)) >=
                0;
              const lo = outward ? -5 : -65,
                hi = outward ? 65 : 5;
              const i = new Image();
              i.src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  wrapSvg(
                    `<defs><mask id="s" maskUnits="userSpaceOnUse" x="0" y="0" width="360" height="360"><g fill="white">${top}</g><g fill="black">${body}</g></mask></defs><g mask="url(#s)"><path transform="translate(${x} ${y}) rotate(${angle})" d="M-2 ${lo}L${depth} ${lo}Q${depth + 2} ${(lo + hi) / 2} ${depth} ${hi}H-2Z" fill="white"/></g>`,
                  ),
                );
              await i.decode();
              ctx.clearRect(0, 0, 360, 360);
              ctx.drawImage(i, 0, 0);
              const pix = ctx.getImageData(0, 0, 360, 360).data,
                m = new Uint8Array(129600);
              for (let k = 0; k < m.length; k++)
                m[k] = pix[k * 4 + 3] > 120 ? 1 : 0;
              let best = null,
                dist = Infinity;
              for (let k = 0; k < m.length; k++)
                if (m[k]) {
                  const q = [k];
                  m[k] = 0;
                  let near = Infinity;
                  for (let j = 0; j < q.length; j++) {
                    const v = q[j];
                    near = Math.min(
                      near,
                      Math.hypot((v % 360) - x, Math.floor(v / 360) - y),
                    );
                    for (const n of [v - 360, v + 360, v - 1, v + 1])
                      if (n >= 0 && n < m.length && m[n]) {
                        m[n] = 0;
                        q.push(n);
                      }
                  }
                  if (q.length > 8 && near < dist) {
                    dist = near;
                    best = q;
                  }
                }
              if (best && dist < 18) for (const v of best) merged.add(v);
            }
            result[pose][cloth][depth] = trace(merged);
          }
        }
      }
      return result;
    });
    fs.writeFileSync(
      "js/art/garment-cuff-shapes.js",
      '"use strict";\n// Sleeve-end bands, clipped to the connected fabric adjoining each hand.\nconst GARMENT_CUFF_SHAPES = ' +
        JSON.stringify(shapes, null, 2) +
        ";\n",
    );
    console.log("Built connected sleeve-end bands for 37 poses.");
  } finally {
    await b.close();
  }
})();
