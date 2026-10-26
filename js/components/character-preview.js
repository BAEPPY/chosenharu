"use strict";

function heading(k, title, sub) {
  const titles = [
    "신분 뽑기",
    "동작 정하기",
    "인물 정하기",
    "옷차림 꾸미기",
    "하루 이야기",
    "인물 완성",
    "풍속화 마당",
  ];
  const art = [
    "draw",
    "fan",
    "hanbok",
    "palette",
    "book",
    "scroll",
    "classroom",
  ];
  return `<div class="chapter-kicker">${icon(art[step])}<span>${step < FLOW.BOARD ? "활동 " + String(step + 1).padStart(2, "0") + " · " : ""}${titles[step] || "우리 반 풍속화"}</span></div><h1>${title}</h1><p class="lead">${sub}</p>`;
}

function portrait() {
  return `<aside class="portrait ${step === FLOW.CARD ? "portrait-scene" : ""}"><div class="portrait-top"><span>${esc(statusOf(state)?.name || "나의 인물")}</span></div><div id="avatar">${step === FLOW.CARD ? sceneSvg(state) : avatarSvg(state)}</div><div class="portrait-caption"><span id="previewRole">${esc(roleOf(state)?.name || "")}</span><h2 id="previewName">${esc(state.name || "어떤 사람을 만나게 될까요?")}</h2></div></aside>`;
}

function footer() {
  return `<div class="chapter-footer"><button class="secondary" data-action="prev">← 이전 단계</button><span>${step + 1} / 6</span><button class="primary" data-action="next" ${step === FLOW.POSE && !state.poseConfirmed ? "disabled" : ""}>${["동작 정하기 →", "인물 정하기 →", "옷차림 꾸미기 →", "하루 이야기 쓰기 →", "인물 카드 확인 →", "인물 모음에 저장 ✓"][step]}</button></div>`;
}
