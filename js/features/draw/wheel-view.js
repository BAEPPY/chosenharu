"use strict";

// Equal display wedges keep labels legible. DrawModel.pick owns probabilities.
const WHEEL_ENTRIES = [
  "common",
  "low",
  "common",
  "yangban",
  "common",
  "low",
  "technical",
  "common",
  "low",
  "common",
  "royal",
  "low",
  "common",
  "yangban",
  "common",
  "low",
  "technical",
  "common",
  "low",
  "common",
];

function wheelSvg() {
  const radius = 294,
    center = 300,
    angle = 360 / WHEEL_ENTRIES.length;
  return `<svg viewBox="0 0 600 600" aria-hidden="true">${WHEEL_ENTRIES.map(
    (id, index) => {
      const start = (index * angle * Math.PI) / 180;
      const end = ((index + 1) * angle * Math.PI) / 180;
      const middle = (index + 0.5) * angle;
      const status = L.statuses.find((item) => item.id === id);
      return `<path d="M ${center} ${center} L ${center + radius * Math.cos(start)} ${center + radius * Math.sin(start)} A ${radius} ${radius} 0 0 1 ${center + radius * Math.cos(end)} ${center + radius * Math.sin(end)} Z" fill="${status.color}" stroke="#fffdf7" stroke-width="1.5"/><text transform="translate(300 300) rotate(${middle})" x="265" y="9" text-anchor="end" fill="${["yangban", "low"].includes(id) ? "#ffffff" : "#302E2B"}">${esc(status.short)}</text>`;
    },
  ).join("")}<circle cx="300" cy="300" r="59" fill="#fffdf7"/></svg>`;
}

function renderWheel() {
  const selected = statusOf(state);
  $("#page").innerHTML =
    `<section class="roulette-page" aria-labelledby="rouletteTitle">
    <div class="roulette-heading"><h1 id="rouletteTitle">나는 어떤 사람일까?</h1><p>최대 네 번 뽑고, 마음에 드는 신분을 골라요.</p></div>
    <div class="roulette-layout">
      <div class="roulette-stage"><div class="roulette-frame">
        <div id="wheel" class="roulette-disc" style="transform:rotate(${spinning ? wheelStart : rotation}deg)">${wheelSvg()}</div>
        <span class="roulette-pointer" aria-hidden="true"></span>
        <button class="wheel-center" data-action="spin" aria-label="돌림판 돌리기" ${spinning || draws >= DrawModel.limit ? "disabled" : ""}>${icon("draw")}<span>${spinning ? "두근두근" : "돌려요"}</span></button>
      </div></div>
      <div class="roulette-controls">
        <div class="draw-result" role="status" aria-live="polite">${spinning ? "<span>새로운 사람을 만나는 중</span><strong>어떤 신분이 나올까요?</strong>" : selected ? `<span>${selectedDraw + 1}번째 결과를 골랐어요</span><strong>${icon(selected.id)} ${selected.name}</strong><p>${selected.text}</p>` : "<span>돌림판을 돌려 시작해요</span><strong>나의 첫 번째 만남</strong><p>돌림판을 돌려 보세요.</p>"}</div>
        <div class="draw-history-heading"><h2>내가 만난 신분</h2><span>${draws} / ${DrawModel.limit}회</span></div>
        ${drawHistoryHtml()}
        <p class="selection-hint">${draws === 4 ? "네 번 모두 뽑았어요. 하나를 선택하세요." : "나온 결과를 눌러 선택하세요."}</p>
        <button class="primary spin-button" data-action="spin" ${spinning || draws >= DrawModel.limit ? "disabled" : ""}>${icon("draw")} ${spinning ? "돌아가는 중…" : draws === 0 ? "첫 번째 신분 뽑기" : draws >= 4 ? "네 번의 추첨 완료" : `${draws + 1}번째 신분 뽑기`}</button>
        <button class="secondary accept-button" data-action="next" ${spinning || !selected ? "disabled" : ""}>${selected ? `선택한 신분으로 시작하기` : "신분을 뽑고 선택해 주세요"} <span aria-hidden="true">→</span></button>
      </div>
    </div>
    <details class="probability-details"><summary>신분별 추첨 확률</summary>${probabilityHistoryHtml()}<button class="text-button" data-action="weights" ${spinning ? "disabled" : ""}>선생님용 확률 설정</button></details>
    <div class="roulette-bottom"><button class="text-button" data-action="home" ${spinning ? "disabled" : ""}>← 처음 화면</button></div>
  </section>`;
}
