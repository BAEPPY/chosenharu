"use strict";

function weightsModal() {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  openModal(
    "신분별 추첨 확률",
    `${probabilityHistoryHtml()}
    <details class="weight-settings"><summary>선생님용 · 추첨 확률 조정</summary>
      <p>합계가 100이 아니어도 입력한 수의 비율로 추첨해요. 바꾼 값은 다음 추첨부터 적용돼요.</p>
      <form id="weightForm">${L.statuses.map((status, index) => `<label class="weight-row"><span>${status.name}</span><input name="weight${index}" type="number" min="0" max="1000" step="0.1" value="${weights[index]}" required><small>현재 ${((weights[index] / total) * 100).toFixed(1)}%</small></label>`).join("")}
        <div class="weight-actions"><button class="primary" type="submit">설정 적용</button><button class="secondary" type="button" data-action="resetWeights">기본 확률로</button></div>
      </form>
    </details>`,
  );
  $("#weightForm").onsubmit = (event) => {
    event.preventDefault();
    const values = L.statuses.map((_, index) =>
      Number(event.target.elements["weight" + index].value),
    );
    if (
      values.some(
        (value) => !Number.isFinite(value) || value < 0 || value > 1000,
      ) ||
      values.reduce((sum, value) => sum + value, 0) <= 0
    ) {
      toast("0 이상의 수를 입력하고 적어도 한 항목은 0보다 크게 해 주세요.");
      return;
    }
    weights = values;
    persist();
    $("#modal").close();
    render();
    toast("다음 추첨부터 새 확률을 적용해요.");
  };
}
