"use strict";

function drawHistoryHtml() {
  return `<div class="draw-history" role="group" aria-label="회차별 추첨 결과 중 신분 선택">
    ${Array.from({ length: DrawModel.limit }, (_, index) => {
      const result = L.statuses.find((item) => item.id === drawHistory[index]);
      const selected = index === selectedDraw && !!result;
      return `<button class="draw-card ${selected ? "is-selected" : ""}"
        data-draw-index="${index}" aria-pressed="${selected}"
        ${spinning || !result ? "disabled" : ""}
        aria-label="${index + 1}번째 추첨: ${result?.name || (index < draws ? "이전 기록 없음" : "아직 뽑지 않음")}">
        <span class="draw-card-round">${index + 1}번째</span>
        ${result ? icon(result.id) : '<span class="draw-card-empty" aria-hidden="true">· · ·</span>'}
        <strong>${result?.short || (index < draws ? "기록 없음" : "아직 안 뽑음")}</strong>
        <span class="draw-card-state">${selected ? "선택됨" : result ? "선택하기" : index < draws ? "이전 버전 결과" : "추첨 대기"}</span>
      </button>`;
    }).join("")}
  </div>`;
}
