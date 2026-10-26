"use strict";

function render() {
  document.body.classList.toggle(
    "is-teacher",
    sharedView === "teacher-home" || isTeacherRoom(),
  );
  document.body.classList.toggle("is-home", landing);
  document.body.classList.toggle("is-roulette", !landing && step === 0);
  if (landing) {
    $("#savedCount").textContent = saved.length;
    renderLanding();
    return;
  }
  if (step > 0 && step < FLOW.BOARD && !state.status) step = 0;
  if (step > FLOW.POSE && step < FLOW.BOARD && !state.poseConfirmed)
    step = FLOW.POSE;
  $("#savedCount").textContent = saved.length;
  $("#steps").innerHTML = [
    "신분 뽑기",
    "동작 정하기",
    "인물 정하기",
    "꾸미기",
    "하루 이야기",
    "완성",
  ]
    .map(
      (t, i) =>
        `<div class="step-indicator ${step === i ? "active" : ""}" ${step === i ? 'aria-current="step"' : ""}><span>${i + 1}</span><b>${t}</b></div>`,
    )
    .join("");
  $("#main").classList.toggle("board-mode", step === FLOW.BOARD);
  if (step === FLOW.BOARD) {
    renderBoard();
    return;
  }
  if (step === 0) {
    renderWheel();
    return;
  }
  if (step === FLOW.POSE) {
    $("#page").innerHTML =
      `<section class="pose-chapter">${poseHtml()}${footer()}</section>`;
    return;
  }
  let content = "";
  if (step === FLOW.IDENTITY) content = identityHtml();
  if (step === FLOW.LOOK) content = lookHtml();
  if (step === FLOW.STORY) content = storyHtml();
  if (step === FLOW.CARD) {
    if (ensureScene(state)) persist();
    content = cardHtml();
  }
  $("#page").innerHTML =
    `<div class="work-layout">${portrait()}<section class="chapter-content">${content}${footer()}</section></div>`;
}
