// Render every outfit/pose pairing from the same compositor used for PNG export.
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE || "playwright-core",
);
const out = process.argv[2] || "/tmp/garment-review";
fs.mkdirSync(path.join(out, "poses"), { recursive: true });
fs.mkdirSync(path.join(out, "cells"), { recursive: true });
(async () => {
  const b = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    args: ["--no-sandbox"],
  });
  try {
    const p = await b.newPage();
    await p.goto(process.env.APP_URL || "http://127.0.0.1:4178");
    await p.waitForFunction(() => typeof drawAvatar === "function");
    await p.evaluate(() => document.fonts.ready);
    const manifest = await p.evaluate(() => ({
      poses: D.lessonPoses.map((p) => ({
        alias: p.alias,
        label: p.label || p.name,
      })),
      outfits: L.outfits.map((o) => ({ id: o.id, name: o.name })),
    }));
    for (const [index, pose] of manifest.poses.entries()) {
      const data = await p.evaluate(
        async ({ pose, index }) => {
          const sheet = document.createElement("canvas");
          sheet.width = 1800;
          sheet.height = 2090;
          const ctx = sheet.getContext("2d");
          ctx.fillStyle = "#FAF9F5";
          ctx.fillRect(0, 0, sheet.width, sheet.height);
          ctx.fillStyle = "#292A25";
          ctx.font = "600 30px Pretendard";
          ctx.textAlign = "center";
          ctx.fillText(`${index + 1}. ${pose.label}`, 900, 48);
          const cells = [];
          for (const [i, outfit] of L.outfits.entries()) {
            const c = document.createElement("canvas");
            c.width = c.height = 360;
            const cc = c.getContext("2d");
            await drawAvatar(
              cc,
              outfitState(
                { ...DEFAULT, pose: pose.alias, hair: "jjog_meori" },
                outfit.id,
              ),
              0,
              0,
              360,
            );
            const x = (i % 5) * 360,
              y = 70 + Math.floor(i / 5) * 400;
            ctx.drawImage(c, x, y);
            ctx.fillStyle = "#292A25";
            ctx.font = "500 20px Pretendard";
            ctx.fillText(
              `${String(i + 1).padStart(2, "0")} · ${outfit.name}`,
              x + 180,
              y + 377,
            );
            cells.push({ id: outfit.id, png: c.toDataURL().split(",")[1] });
          }
          return { png: sheet.toDataURL().split(",")[1], cells };
        },
        { pose, index },
      );
      fs.writeFileSync(
        path.join(
          out,
          "poses",
          `${String(index + 1).padStart(2, "0")}-${pose.alias}.png`,
        ),
        Buffer.from(data.png, "base64"),
      );
      for (const cell of data.cells)
        fs.writeFileSync(
          path.join(out, "cells", `${pose.alias}--${cell.id}.png`),
          Buffer.from(cell.png, "base64"),
        );
      if ((index + 1) % 8 === 0)
        console.log(`${index + 1}/${manifest.poses.length} poses exported`);
    }
    fs.writeFileSync(
      path.join(out, "manifest.json"),
      JSON.stringify(manifest, null, 2),
    );
    console.log(
      `Exported ${manifest.poses.length * manifest.outfits.length} outfit/pose combinations.`,
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
