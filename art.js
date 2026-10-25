"use strict";

// Compose the same native layers for previews and PNG exports.
function avatarLayers(s) {
  const n = nativeLook(s),
    base = `assets/images/result/${n.pose}/`,
    m = D.skinVectors[n.pose],
    skin = D.skintones[s.skin].rgba;
  const layers = [{ svg: `<path fill="${skin}" d="${m.base}"/>` }];
  if (!["nainbok", "hwangchosam"].includes(n.cloth)) {
    layers.push({
      svg: colorVector(base + `clothes/${n.cloth}_fill.svg`, n.palette),
    });
    const decoration = clothDecoration(n.palette, n.pose, n.cloth, base);
    if (decoration) layers.push({ svg: decoration });
  }
  layers.push(
    { src: imageAsset(base + `clothes/${n.cloth}_overlay@2x.png`) },
    { svg: `<path fill="${skin}" d="${m.face}"/>` },
    { src: imageAsset(base + "skintones/face_overlay@2x.png") },
    { svg: colorVector(base + `hairs/${n.hair}_fill.svg`, n.palette) },
    { src: imageAsset(base + `hairs/${n.hair}_overlay@2x.png`) },
    { src: imageAsset(base + `emotions/${s.emotion}@2x.png`) },
  );
  const head = ceremonialHead(s, n.pose),
    props = activityProps(s);
  if (head) layers.push({ svg: head });
  if (props) layers.push({ svg: props });
  return layers;
}

function avatarSvg(s) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" role="img" aria-label="${esc(s.name || "나의 인물")}">${avatarLayers(
    s,
  )
    .map((l) =>
      l.svg !== undefined
        ? l.svg
        : `<image href="${l.src}" width="360" height="360"/>`,
    )
    .join("")}</svg>`;
}

async function drawAvatar(ctx, s, x, y, size) {
  for (const l of avatarLayers(s)) {
    if (!l.svg && !l.src) continue;
    const pic = new Image();
    pic.src =
      l.svg !== undefined
        ? "data:image/svg+xml;charset=utf-8," +
          encodeURIComponent(wrapSvg(l.svg))
        : l.src;
    await pic.decode();
    ctx.drawImage(pic, x, y, size, size);
  }
}
