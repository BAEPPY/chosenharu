"use strict";

function landscape() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" aria-hidden="true"><image href="images/scenes/village.webp" width="1000" height="620" preserveAspectRatio="xMidYMid slice"/></svg>`;
}

function renderLocalBoard() {
  const chosen = board.find((b) => b.id === selectedBoard),
    s = saved.find((s) => s.id === selectedBoard);
  $("#page").innerHTML =
    `<section class="classroom"><div class="board-heading"><div>${heading(6, "우리 반, 하나의 풍속화", "각자의 하루가 모여 우리 반의 조선이 펼쳐져요.")}</div><button class="secondary" data-action="backFromBoard">← 인물 만들기로</button></div><div class="board-toolbar"><button class="primary" data-action="teacherHome">공동 교실 만들기 →</button><span><b>${board.length}</b> / 26명</span><button data-action="import" class="secondary">작품 파일 가져오기</button><button data-action="addAll" class="secondary">모음에서 채우기</button><button data-action="arrange" class="secondary">자리 정돈</button><button data-action="boardPng" class="primary" ${board.length ? "" : "disabled"}>풍속화 PNG 저장 ↓</button></div><p class="small-note">인물을 끌어 옮기거나, 선택 후 방향키로 이동하세요. 원하는 곳에 자유롭게 놓을 수 있어요. 아래쪽 인물이 앞에 보여요. 여기는 이 기기의 개인 배치판이에요. 함께 편집하려면 교사용 페이지에서 교실을 만들어 주세요.</p>${boardCanvasHtml()}<div class="selection-bar" aria-live="polite"><span>${chosen ? `<strong>${esc(s.name)}</strong> · ${chosen.locked ? "위치가 고정되어 있어요" : "위치를 옮길 수 있어요"}` : "인물을 선택하면 위치를 고정할 수 있어요."}</span>${chosen ? `<div><button class="secondary" data-action="lock">${chosen.locked ? "고정 풀기" : "이 자리에 고정"}</button><button class="text-button" data-action="removeBoard">풍속화에서 빼기</button></div>` : ""}</div><details class="board-library" open><summary>내 인물 모음에서 한 명씩 넣기</summary>${saved.length ? `<div class="person-chips">${saved.map((s) => `<button data-add="${esc(s.id)}" ${board.some((b) => b.id === s.id) ? "disabled" : ""}>${esc(s.name)} <span>${board.some((b) => b.id === s.id) ? "배치됨" : "+ 넣기"}</span></button>`).join("")}</div>` : "<p>먼저 인물을 완성해 저장하거나 다른 기기의 작품 파일을 가져오세요.</p>"}</details><div class="board-bottom"><button class="text-button" data-action="exportAll">배치와 작품 파일 보관 ↓</button><button class="text-button" data-action="padlet">패들렛 공유 방법 ↗</button><span>1시간 동안 이용하지 않으면 초기화돼요. 작품 파일로 보관해 주세요.</span></div></section>`;
  bindBoard();
}

function boardCanvasHtml() {
  return `<div class="board-scroll"><div id="classBoard" class="class-board" aria-label="우리 반 풍속화 배치판">${landscape()}<div class="board-title">조선의 하루 <span>우리 반이 함께 만든 풍속화</span></div>${boardInDepthOrder()
    .map((p) => {
      const s = classroomRecords().find((s) => s.id === p.id);
      return `<button class="board-person ${!canEditPerson(p) ? "readonly" : ""} ${p.locked ? "locked" : ""} ${p.id === selectedBoard ? "selected" : ""}" data-person="${esc(p.id)}" style="left:${p.x / 10}%;top:${p.y / 6.2}%;width:10%;height:${115 / 6.2}%;z-index:${Math.round(p.y * 10) + 1}" aria-label="${esc(s.name)}${p.locked ? ", 위치 고정됨" : !canEditPerson(p) ? ", 정보 보기" : ", 이동 가능"}" aria-pressed="${p.id === selectedBoard}">${avatarSvg(s)}<span>${esc(s.name)}${p.locked ? " · 고정" : ""}</span></button>`;
    })
    .join(
      "",
    )}${classroomBoard().length ? "" : '<div class="board-empty">아직은 조용한 마을이에요.<br><strong>완성한 인물을 넣어 마을을 채워 주세요.</strong></div>'}</div></div>`;
}
