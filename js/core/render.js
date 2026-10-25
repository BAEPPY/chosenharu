"use strict";

function render() {
  document.body.classList.toggle("is-home", landing);
  document.body.classList.toggle("is-roulette", !landing && step === 0);
  if (landing) {
    $("#savedCount").textContent = saved.length;
    renderLanding();
    return;
  }
  if (step > 0 && step < 5 && !state.status) step = 0;
  $("#savedCount").textContent = saved.length;
  $("#steps").innerHTML = [
    "신분 뽑기",
    "인물 정하기",
    "꾸미기",
    "하루 이야기",
    "완성",
  ]
    .map(
      (t, i) =>
        `<button data-step="${i}" ${spinning ? "disabled" : ""} class="${step === i ? "active" : ""}" ${step === i ? 'aria-current="step"' : ""}><span>${i + 1}</span><b>${t}</b></button>`,
    )
    .join("");
  $("#main").classList.toggle("board-mode", step === 5);
  if (step === 5) {
    renderBoard();
    return;
  }
  if (step === 0) {
    renderWheel();
    return;
  }
  let content = "";
  if (step === 1) content = identityHtml();
  if (step === 2) content = lookHtml();
  if (step === 3) content = storyHtml();
  if (step === 4) content = cardHtml();
  $("#page").innerHTML =
    `<div class="work-layout">${portrait()}<section class="chapter-content">${content}${footer()}</section></div>`;
}
