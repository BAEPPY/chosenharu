"use strict";

function probabilityLabel(fraction) {
  const percent = fraction * 100;
  return (
    (percent > 0 && percent < 0.001 ? "<0.001" : Number(percent.toFixed(3))) +
    "%"
  );
}

function wheelSvg() {
  const radius = 294,
    center = 300;
  const segments = DrawModel.segments(L.statuses, weights).filter(
    (s) => s.fraction > 0,
  );
  return `<svg viewBox="0 0 600 600" aria-hidden="true">${segments
    .map((s) => {
      const start = (s.start * Math.PI) / 180,
        end = (s.end * Math.PI) / 180;
      const middle = (start + end) / 2;
      const shape =
        s.fraction === 1
          ? `<circle cx="300" cy="300" r="${radius}" fill="${s.color}"/>`
          : `<path data-status="${s.id}" data-start="${s.start}" data-end="${s.end}" d="M ${center} ${center} L ${center + radius * Math.cos(start)} ${center + radius * Math.sin(start)} A ${radius} ${radius} 0 ${s.fraction > 0.5 ? 1 : 0} 1 ${center + radius * Math.cos(end)} ${center + radius * Math.sin(end)} Z" fill="${s.color}"/>`;
      // Small sectors retain their true area. The legend labels every sector.
      const x = center + 204 * Math.cos(middle),
        y = center + 204 * Math.sin(middle);
      return (
        shape +
        (s.end - s.start >= 12
          ? `<text x="${x}" y="${y - 2}" text-anchor="middle" fill="${["yangban", "low"].includes(s.id) ? "#fff" : "#302E2B"}">${esc(s.short)}<tspan x="${x}" dy="26" class="wheel-percent">${probabilityLabel(s.fraction)}</tspan></text>`
          : "")
      );
    })
    .join("")}<circle cx="300" cy="300" r="59" fill="#fbf5e7"/></svg>`;
}

function wheelLegend() {
  return `<ul class="wheel-legend" aria-label="돌림판 조각별 실제 추첨 확률">${DrawModel.segments(
    L.statuses,
    weights,
  )
    .map(
      (s) =>
        `<li><i style="background:${s.color}" aria-hidden="true"></i>${esc(s.short)} <b>${probabilityLabel(s.fraction)}</b></li>`,
    )
    .join("")}</ul>`;
}

function renderWheel() {
  const selected = DrawModel.canSelect(drawHistory, selectedDraw)
    ? L.statuses.find((status) => status.id === drawHistory[selectedDraw])
    : null;
  const canResume = !selected && !!state.status;
  $("#page").innerHTML =
    `<section class="roulette-page" aria-labelledby="rouletteTitle">
    <div class="roulette-heading"><div class="chapter-kicker">${icon("draw")}<span>활동 01 · 신분 뽑기</span></div><h1 id="rouletteTitle">나는 어떤 사람일까?</h1><p>최대 네 번 뽑고, 마음에 드는 신분을 골라요.</p></div>
    <div class="roulette-layout">
      <div class="roulette-stage"><div class="roulette-frame">
        <div id="wheel" class="roulette-disc" style="transform:rotate(${spinning ? wheelStart : rotation}deg)">${wheelSvg()}</div>
        <span class="roulette-pointer" aria-hidden="true"></span>
        <button class="wheel-center" data-action="spin" aria-label="돌림판 돌리기" ${spinning || draws >= DrawModel.limit ? "disabled" : ""}>${icon("draw")}<span>${spinning ? "두근두근" : "돌려요"}</span></button>
      </div>${wheelLegend()}</div>
      <div class="roulette-controls">
        <div class="draw-result" role="status" aria-live="polite">${spinning ? "<span>새로운 사람을 만나는 중</span><strong>어떤 신분이 나올까요?</strong>" : selected ? `<span>${selectedDraw + 1}번째 결과를 골랐어요</span><strong>${icon(selected.id)} ${selected.name}</strong><p>${selected.text}</p>` : "<span>돌림판을 돌려 시작해요</span><strong>나의 첫 번째 만남</strong><p>돌림판을 돌려 보세요.</p>"}</div>
        <div class="draw-history-heading"><h2>내가 만난 신분</h2><span>${draws} / ${DrawModel.limit}회</span></div>
        ${drawHistoryHtml()}
        <p class="selection-hint">${draws === 4 ? "네 번 모두 뽑았어요. 하나를 선택하세요." : "나온 결과를 눌러 선택하세요."}</p>
        <button class="primary spin-button" data-action="spin" ${spinning || draws >= DrawModel.limit ? "disabled" : ""}>${icon("draw")} ${spinning ? "돌아가는 중…" : draws === 0 ? "첫 번째 신분 뽑기" : draws >= 4 ? "네 번의 추첨 완료" : `${draws + 1}번째 신분 뽑기`}</button>
        <button class="secondary accept-button" data-action="next" ${spinning || (!selected && !canResume) ? "disabled" : ""}>${selected ? "선택한 신분으로 시작하기" : canResume ? "기존 인물 이어하기" : "신분을 뽑고 선택해 주세요"} <span aria-hidden="true">→</span></button>
      </div>
    </div>
    <details class="probability-details"><summary>신분별 추첨 확률</summary>${probabilityHistoryHtml()}<button class="text-button" data-action="weights" ${spinning ? "disabled" : ""}>선생님용 확률 설정</button></details>
    <div class="roulette-bottom"><button class="text-button" data-action="home" ${spinning ? "disabled" : ""}>← 처음 화면</button></div>
  </section>`;
}
