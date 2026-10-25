"use strict";

function probabilityHistoryHtml() {
  const history = window.JOSEON_HISTORY;
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const customized = weights.some(
    (value, index) =>
      Math.abs((value / total) * 100 - history.rows[index].applied) > 0.05,
  );
  return `<section class="probability-history" aria-label="역사 자료와 추첨 확률 비교">
    <div class="probability-intro"><div><h3>역사 비율과 추첨 확률</h3><p>${history.title} · ${history.unit}</p></div></div>
    <div class="probability-table-wrap"><table class="probability-table">
      <caption class="sr-only">1717년 단성현 자료와 앱의 1회 추첨 확률</caption>
      <thead><tr><th scope="col">신분</th><th scope="col">역사 자료</th><th scope="col">기본 추첨</th>${customized ? '<th scope="col">현재 설정</th>' : ""}</tr></thead>
      <tbody>${history.rows.map((row, index) => `<tr><th scope="row">${row.label}</th><td>${row.historical === null ? "별도 설정" : row.historical + "%"}</td><td>${row.applied}%</td>${customized ? `<td>${((weights[index] / total) * 100).toFixed(1)}%</td>` : ""}</tr>`).join("")}</tbody>
    </table></div>
    <p>미기재 1.1% 제외 후 100%로 환산 · 양반에서 0.5%p를 나눠 왕실에 배정</p>
    <a class="history-source" href="${history.sourceUrl}" target="_blank" rel="noopener">우리역사넷 · 자료 보기 ↗</a>
  </section>`;
}
