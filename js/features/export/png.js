"use strict";

function drawLines(ctx, text, x, y, width, lineHeight) {
  let line = "";
  for (const ch of String(text)) {
    if (ch === "\n" || ctx.measureText(line + ch).width > width) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = ch === "\n" ? "" : ch;
    } else line += ch;
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function canvasBlob(c) {
  return new Promise((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(Error("그림을 저장하지 못했어요."))),
      "image/png",
    ),
  );
}

async function exportPng(characterOnly = false) {
  try {
    await document.fonts.ready;
    toast("그림을 준비하고 있어요…");
    const s = { ...state };
    const c = document.createElement("canvas");
    c.width = 1200;
    c.height = characterOnly ? 1200 : 4200;
    const ctx = c.getContext("2d");
    if (characterOnly) {
      await drawAvatar(ctx, s, 0, 0, 1200);
      download(await canvasBlob(c), fileName("_인물", "png"));
      toast("배경 없는 인물 PNG를 저장했어요.");
      return;
    }
    ctx.fillStyle = "#fbf8ee";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#375443";
    ctx.font = 'bold 36px "Pretendard", sans-serif';
    ctx.fillText("조선의 하루", 80, 87);
    ctx.fillStyle = "#777e6b";
    ctx.font = '22px "Pretendard", sans-serif';
    ctx.fillText("역사 속 생활에 나의 상상을 더한 인물 이야기", 80, 128);
    await drawAvatar(ctx, s, 270, 160, 660);
    ctx.fillStyle = "#304837";
    ctx.font = 'bold 45px "Pretendard", sans-serif';
    let y = drawLines(ctx, s.name || "나의 인물", 80, 875, 1040, 60);
    ctx.font = '25px "Pretendard", sans-serif';
    y =
      drawLines(
        ctx,
        (statusOf(s)?.name || "") + " · " + roleOf(s).name,
        80,
        y + 10,
        1040,
        40,
      ) + 35;
    for (const [label, text] of [
      ["살아가는 곳", s.place || "—"],
      ["나의 하루", s.story || "—"],
      ["상상을 더해요", s.imagination || "—"],
    ]) {
      ctx.fillStyle = "#788565";
      ctx.font = 'bold 24px "Pretendard", sans-serif';
      ctx.fillText(label, 80, y);
      y += 42;
      ctx.fillStyle = "#3a4637";
      ctx.font = '26px "Pretendard", sans-serif';
      y = drawLines(ctx, text, 80, y, 1040, 42) + 35;
    }
    ctx.fillStyle = "#838675";
    ctx.font = '17px "Pretendard", sans-serif';
    y =
      drawLines(
        ctx,
        "그림 부품: 모두의 풍속도 2026 · 국가유산진흥원 / 추가 의상·동작: 수업용 간략화 그림",
        80,
        y + 15,
        1040,
        27,
      ) + 40;
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = Math.min(c.height, y);
    out.getContext("2d").drawImage(c, 0, 0);
    download(await canvasBlob(out), fileName("_인물카드", "png"));
    toast("인물 카드 PNG를 저장했어요.");
  } catch (e) {
    toast("이미지 저장 실패: " + e.message);
  }
}

async function exportBoardPng() {
  try {
    await document.fonts.ready;
    if (!board.length) {
      toast("풍속화에 인물을 먼저 넣어 주세요.");
      return;
    }
    toast("우리 반 풍속화를 그리는 중이에요…");
    const c = document.createElement("canvas");
    c.width = 2400;
    c.height = 1488;
    const ctx = c.getContext("2d");
    ctx.scale(2.4, 2.4);
    const bg = new Image();
    bg.src =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(landscape());
    await bg.decode();
    ctx.drawImage(bg, 0, 0, 1000, 620);
    ctx.fillStyle = "#3d5741";
    ctx.font = 'bold 23px "Pretendard", sans-serif';
    ctx.fillText("조선의 하루", 32, 39);
    ctx.font = '12px "Pretendard", sans-serif';
    ctx.fillText(
      "우리 반이 함께 만든 풍속화 · " + board.length + "명의 이야기",
      190,
      38,
    );
    for (const p of [...board].sort((a, b) => a.y - b.y)) {
      const s = saved.find((s) => s.id === p.id);
      await drawAvatar(ctx, s, p.x, p.y, BW);
      ctx.fillStyle = "#3b4d38";
      ctx.font = 'bold 10px "Pretendard", sans-serif';
      ctx.textAlign = "center";
      const name = s.name.length > 12 ? s.name.slice(0, 11) + "…" : s.name;
      ctx.fillText(name, p.x + BW / 2, p.y + 110);
      ctx.textAlign = "left";
    }
    ctx.fillStyle = "#737b66";
    ctx.font = '9px "Pretendard", sans-serif';
    ctx.fillText(
      "모두의 풍속도 2026 · 국가유산진흥원 그림 부품 / 수업용 추가 그림",
      26,
      607,
    );
    download(await canvasBlob(c), "조선의하루_우리반풍속화.png");
    toast("우리 반 풍속화 PNG를 저장했어요.");
  } catch (e) {
    toast("풍속화 저장 실패: " + e.message);
  }
}
