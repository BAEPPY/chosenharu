/* Derive skin masks from the native layer outlines; originals stay unchanged.
   Runs in a browser Canvas, once while generating pose modules. */
module.exports = async function deriveAnatomy(data) {
  function filledMask(ctx) {
    const raw = ctx.getImageData(0, 0, 720, 720).data,
      solid = Uint8Array.from({ length: 518400 }, (_, i) =>
        raw[i * 4 + 3] > 35 ? 1 : 0,
      ),
      outside = new Uint8Array(518400),
      queue = new Int32Array(518400);
    let start = 0,
      end = 0;
    for (let i = 0; i < 720; i++) {
      for (const n of [i, 719 * 720 + i, i * 720, i * 720 + 719])
        if (!solid[n] && !outside[n]) {
          queue[end++] = n;
          outside[n] = 1;
        }
    }
    while (start < end) {
      const a = queue[start++],
        x = a % 720,
        y = (a / 720) | 0;
      for (const b of [
        x ? a - 1 : -1,
        x < 719 ? a + 1 : -1,
        y ? a - 720 : -1,
        y < 719 ? a + 720 : -1,
      ])
        if (b >= 0 && !solid[b] && !outside[b]) {
          queue[end++] = b;
          outside[b] = 1;
        }
    }
    return { solid, inside: Uint8Array.from(outside, (v) => 1 - v) };
  }
  function pathFor(mask) {
    let d = "";
    for (let y = 0; y < 720; y++) {
      for (let x = 0; x < 720;) {
        if (!mask[y * 720 + x]) {
          x++;
          continue;
        }
        const start = x;
        while (x < 720 && mask[y * 720 + x]) x++;
        d += `M${start / 2} ${y / 2}h${(x - start) / 2}v.5h-${(x - start) / 2}z`;
      }
    }
    return d;
  }
  function removeSpecks(mask) {
    const seen = new Uint8Array(mask.length);
    const queue = new Int32Array(mask.length);
    for (let seed = 0; seed < mask.length; seed++) {
      if (!mask[seed] || seen[seed]) continue;
      let head = 0,
        tail = 1;
      queue[0] = seed;
      seen[seed] = 1;
      while (head < tail) {
        const a = queue[head++],
          x = a % 720,
          y = (a / 720) | 0;
        for (const b of [
          x ? a - 1 : -1,
          x < 719 ? a + 1 : -1,
          y ? a - 720 : -1,
          y < 719 ? a + 720 : -1,
        ]) {
          if (b >= 0 && mask[b] && !seen[b]) {
            seen[b] = 1;
            queue[tail++] = b;
          }
        }
      }
      if (tail < 16) for (let i = 0; i < tail; i++) mask[queue[i]] = 0;
    }
    return mask;
  }
  const out = {};
  for (const { pose, files } of data) {
    const c = document.createElement("canvas");
    c.width = c.height = 720;
    const ctx = c.getContext("2d", { willReadFrequently: true }),
      images = {};
    for (const [k, src] of Object.entries(files)) {
      const im = new Image();
      im.src = src;
      await im.decode();
      images[k] = im;
    }
    const draw = (names) => {
      ctx.clearRect(0, 0, 720, 720);
      names
        .filter((k) => images[k])
        .forEach((k) => ctx.drawImage(images[k], 0, 0, 720, 720));
    };
    const head = [
      "skintones/face_overlay@2x.png",
      "hairs/short_hair_fill.svg",
      "hairs/short_hair_overlay@2x.png",
    ];
    draw(head);
    // The sleeves/hands close some neck contours. Keep their native occlusion:
    // fill only visible skin from the combined baji outline inside the head bounds.
    const face = filledMask(ctx).inside;
    let minx = 720,
      miny = 720,
      maxx = 0,
      maxy = 0;
    for (let i = 0; i < face.length; i++)
      if (face[i]) {
        const x = i % 720,
          y = (i / 720) | 0;
        minx = Math.min(x, minx);
        miny = Math.min(y, miny);
        maxx = Math.max(x, maxx);
        maxy = Math.max(y, maxy);
      }
    const body = new Uint8Array(518400);
    for (const cloth of [
      "baji",
      "chima",
      "dopo_baeja",
      "chima_baeja",
      "pojolbok",
      "pungmulbok",
      "hwangchosam",
      "nainbok",
    ]) {
      draw([
        `clothes/${cloth}_fill.svg`,
        `clothes/${cloth}_overlay@2x.png`,
        ...head,
      ]);
      const m = filledMask(ctx);
      for (let i = 0; i < body.length; i++) {
        if (!m.inside[i] || m.solid[i]) continue;
        body[i] = 1;
        const x = i % 720,
          y = (i / 720) | 0;
        if (
          cloth === "baji" &&
          x >= minx &&
          x <= maxx &&
          y >= miny &&
          y <= maxy
        )
          face[i] = 1;
      }
    }
    // Expand underneath anti-aliased native outlines by half a display pixel.
    const expanded = (mask) =>
      Uint8Array.from(mask, (v, i) =>
        v || mask[i - 1] || mask[i + 1] || mask[i - 720] || mask[i + 720]
          ? 1
          : 0,
      );
    out[pose] = {
      base: pathFor(expanded(removeSpecks(body))),
      face: pathFor(face),
      layout: {
        x: (minx + maxx) / 4,
        y: miny / 2,
        w: (maxx - minx) / 2,
        h: (maxy - miny) / 2,
      },
    };
  }
  return out;
};
