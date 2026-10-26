"use strict";

function go(n, push = true) {
  if (spinning) return;
  landing = false;
  if (n > 0 && n < FLOW.BOARD && !state.status) {
    toast("먼저 신분 돌림판을 돌려 주세요.");
    return;
  }
  if (n > FLOW.POSE && n < FLOW.BOARD && !state.poseConfirmed) {
    toast("동작을 먼저 선택해 주세요.");
    return;
  }
  if (n > FLOW.IDENTITY && n < FLOW.BOARD && !state.name.trim()) {
    toast("인물 이름을 먼저 정해 주세요.");
    return;
  }
  step = n;
  if (push && window.history)
    window.history.pushState(
      {},
      "",
      n === FLOW.BOARD ? roomHash() : "#step-" + (n + 1),
    );
  persist();
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
  $("#main").focus({ preventScroll: true });
}

function next() {
  if (step === 0) {
    go(FLOW.POSE);
  } else if (step === FLOW.STORY && !state.story.trim())
    toast("하루 이야기를 한 문장 이상 적어 주세요.");
  else if (step === FLOW.CARD) saveRecord();
  else go(step + 1);
}

function newCharacter() {
  state = { ...DEFAULT };
  draws = 0;
  drawHistory = [];
  selectedDraw = -1;
  undo = [];
  spinning = false;
  rotation = 0;
  if ($("#modal").open) $("#modal").close();
  persist();
  go(0);
  toast("새 인물의 하루를 시작해요. 저장한 인물들은 모음에 남아 있어요.");
}
