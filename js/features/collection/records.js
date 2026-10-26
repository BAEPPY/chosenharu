"use strict";

function saveRecord(quiet = false) {
  if (!state.name.trim() || !state.status || !state.story.trim()) {
    toast("이름과 하루 이야기를 먼저 완성해 주세요.");
    return false;
  }
  ensureScene(state);
  const next = { ...state, id: state.id || uid() },
    idx = saved.findIndex((x) => x.id === next.id);
  if (idx < 0 && saved.length >= 100) {
    toast(
      "인물 모음은 100명까지 보관해요. 먼저 작품 파일을 저장한 뒤 정리해 주세요.",
    );
    return false;
  }
  const oldSaved = saved,
    oldState = state;
  saved =
    idx < 0
      ? [...saved, next]
      : saved.map((x) => (x.id === next.id ? next : x));
  state = next;
  if (!persist()) {
    saved = oldSaved;
    state = oldState;
    return false;
  }
  $("#savedCount").textContent = saved.length;
  if (!quiet) toast("이 기기의 인물 모음에 저장했어요.");
  return true;
}

function gallery() {
  openModal(
    "이 기기의 인물 모음",
    `<div class="gallery-tools"><button class="primary" data-action="new">새 인물 만들기</button><button class="secondary" data-action="import">작품 파일 가져오기</button><button class="secondary" data-action="exportAll">모두 파일로 보관</button></div><p class="small-note">다른 기기에서 만든 작품 파일(JSON)을 여러 개 한 번에 가져올 수 있어요.</p><div class="gallery-grid">${saved.map((s) => `<article>${avatarSvg(s)}<h3>${esc(s.name)}</h3><p>${statusOf(s)?.name || ""} · ${roleOf(s).name}</p><div><button class="secondary" data-load="${esc(s.id)}">불러오기</button><button class="text-button" data-delete="${esc(s.id)}">삭제</button></div></article>`).join("") || `<div class="empty">${icon("gallery")}<h3>나의 인물 보관함</h3><p>아직 저장한 인물이 없어요.<br>인물을 완성하고 이곳에 차곡차곡 모아 보세요.</p></div>`}</div>`,
  );
}
