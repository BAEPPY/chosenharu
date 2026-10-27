"use strict";

function renderTeacherHome() {
  if (!requireTeacherEntry()) return;
  const rooms = storedClassrooms()
    .filter((x) => x.role === "teacher")
    .reverse();
  $("#page").innerHTML =
    `<section class="teacher-home"><div class="teacher-welcome">${icon("teacher")}<div><p class="eyebrow">선생님을 위한 교실</p><h1>우리 반의 하루를 한눈에</h1><p class="lead">서로 다른 삶을 모아, 함께 역사를 배워요.<br>학생들이 만드는 풍속화와 인물 이야기를 살펴보세요.</p></div></div><form id="createClassroom" class="create-classroom"><label class="field">교실 이름<input name="title" maxlength="40" value="우리 반 풍속화" placeholder="예: 5학년 2반"></label><button class="primary" type="submit">공동 교실 만들기 →</button></form><div class="teacher-guide"><article>${icon("scroll")}<strong>1. 학생 링크 공유</strong><p>교실을 만들고 학생 참여 링크를 보내 주세요.</p></article><article>${icon("classroom")}<strong>2. 함께 풍속화 만들기</strong><p>학생은 자기 인물을 넣고 옮길 수 있어요.</p></article><article>${icon("book")}<strong>3. 인물 이야기 살펴보기</strong><p>인물을 누르면 이름·신분·하루 이야기가 열려요.</p></article></div>${rooms.length ? `<h2>이 기기에서 만든 교실</h2><div class="teacher-rooms">${rooms.map((r) => `<button class="secondary" data-open-classroom="${esc(r.id)}"><strong>${esc(r.title)}</strong><span>교사용 화면 열기 →</span></button>`).join("")}</div>` : ""}<p class="small-note">교사용 링크와 학생 참여 링크는 서로 달라요. 학생에게는 학생 참여 링크를 공유해 주세요. 공동 작품은 개인 화면의 1시간 초기화로 지워지지 않아요.</p></section>`;
  $("#createClassroom").addEventListener("submit", (event) => {
    event.preventDefault();
    void createClassroom(event.target);
  });
}
function personInspectorHtml() {
  const p = classroomBoard().find((x) => x.id === selectedBoard),
    s = classroomRecords().find((x) => x.id === selectedBoard);
  if (!p || !s)
    return `<div class="inspector-empty">${icon("book")}<h2>인물을 눌러 보세요</h2><p>${isTeacherRoom() ? "이름과 신분, 인물의 하루 이야기를 여기에서 확인할 수 있어요." : "내 인물을 선택하면 위치를 옮기거나 작품을 확인할 수 있어요."}</p></div>`;
  const own = isTeacherRoom() || p.ownerId === sharedRoom.actorId,
    readStory = isTeacherRoom() || p.ownerId === sharedRoom.actorId;
  return `<div class="inspector-portrait">${avatarSvg(s)}</div><p class="eyebrow">${isTeacherRoom() ? "인물 이야기" : own ? "내가 만든 인물" : "함께 만든 친구의 인물"}</p><h2>${esc(s.name)}</h2><dl class="person-details"><dt>신분</dt><dd>${esc(statusOf(s)?.name || "")}</dd><dt>역할</dt><dd>${esc(roleOf(s)?.name || "")}</dd>${readStory ? `<dt>살아가는 곳</dt><dd>${esc(s.place || "아직 정하지 않았어요")}</dd><dt>인물의 하루</dt><dd>${esc(s.story || "아직 이야기가 없어요")}</dd>${s.imagination ? `<dt>상상을 더해요</dt><dd>${esc(s.imagination)}</dd>` : ""}` : ""}</dl>${p.locked ? '<p class="small-note">이 인물의 위치는 고정되어 있어요.</p>' : ""}<div class="inspector-actions">${isTeacherRoom() ? `<button class="secondary" data-action="lock">${p.locked ? "위치 고정 풀기" : "이 자리에 고정"}</button>` : ""}${own ? '<button class="text-button" data-action="removeBoard">풍속화에서 빼기</button>' : ""}</div>`;
}
function renderSharedRoom() {
  if (isTeacherRoom() && !requireTeacherEntry(roomHash())) return;
  const teacher = isTeacherRoom(),
    mine = sharedRoom.board.filter((p) => p.ownerId === sharedRoom.actorId);
  $("#page").innerHTML =
    `<section class="classroom shared-classroom ${teacher ? "teacher-classroom" : "student-classroom"}"><div class="board-heading"><div><p class="eyebrow">${teacher ? "교사용 · 실시간 교실" : "학생용 · 우리 반 공동 작품"}</p><h1>${esc(sharedRoom.title)}</h1><p class="lead">${teacher ? "학생들의 이동을 보고 인물을 눌러 하루 이야기를 살펴보세요." : "친구들과 같은 풍속화를 보고 있어요. 내가 만든 인물만 옮길 수 있어요."}</p></div>${teacher ? '<button class="secondary" data-action="teacherHome">교실 목록</button>' : studentActivityActionsHtml()}</div><div class="shared-connection"><span id="sharedStatus" role="status">실시간 연결됨</span><span><b>${sharedRoom.board.length}</b> / 26명</span>${sharedRoom.paused ? '<strong class="paused-note">학생 이동이 잠겨 있어요</strong>' : ""}</div><div class="board-toolbar">${teacher ? `<button class="primary" data-action="shareStudents">학생 참여 링크 복사 ↗</button><button class="secondary" data-action="shareTeacher">교사용 링크 복사</button><button class="secondary" data-action="pauseClassroom">${sharedRoom.paused ? "학생 이동 다시 열기" : "학생 이동 잠그기"}</button><button class="secondary" data-action="arrange">자리 정돈</button>` : `<button class="primary" data-action="addCurrent" ${state.name && state.story && !sharedRoom.paused ? "" : "disabled"}>${sharedRoom.board.some((p) => p.id === state.id) ? "내 인물 작품 갱신" : "완성한 내 인물 넣기"}</button><span class="small-note">${mine.length ? "내 인물을 끌거나 선택 후 방향키로 움직여요." : "먼저 인물을 완성한 뒤 이 교실에 넣어 주세요."}</span>`}<button class="secondary" data-action="boardPng" ${sharedRoom.board.length ? "" : "disabled"}>풍속화 PNG 저장 ↓</button>${teacher ? '<button class="text-button" data-action="exportAll">모든 작품 파일 저장 ↓</button>' : ""}</div><div class="shared-board-layout"><div>${boardCanvasHtml()}<p class="small-note">${teacher ? "인물을 클릭하면 오른쪽에 이야기가 열려요. 위치 고정과 자리 정돈은 선생님이 관리해요." : "내 인물의 이동은 선생님과 친구들의 화면에도 반영돼요."}</p></div><aside id="personInspector" class="person-inspector" aria-label="선택한 인물 정보">${personInspectorHtml()}</aside></div><p class="small-note shared-storage-note">이 교실의 작품과 배치는 함께 저장돼요. 개인 화면이 1시간 미사용으로 초기화되어도 공동 작품은 남아 있어요.</p></section>`;
  bindBoard();
}
function renderBoard() {
  if (sharedView === "teacher-home") return renderTeacherHome();
  if (sharedView === "loading") {
    $("#page").innerHTML =
      '<section class="teacher-home"><h1>우리 반 교실에 연결하는 중…</h1><p class="lead" role="status">친구들의 풍속화를 불러오고 있어요.</p></section>';
    return;
  }
  if (sharedView === "error") {
    $("#page").innerHTML =
      `<section class="teacher-home"><h1>교실에 연결하지 못했어요</h1><p class="lead">${esc(sharedError)}</p><button class="primary" data-action="retryClassroom">다시 연결</button> <button class="secondary" data-action="home">처음 화면</button></section>`;
    return;
  }
  if (sharedRoom) return renderSharedRoom();
  renderLocalBoard();
}
