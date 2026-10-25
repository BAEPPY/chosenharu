"use strict";

function landscape() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" aria-hidden="true"><rect width="1000" height="620" fill="#f7f1df"/><path d="M0 165L80 108L137 140L241 63L341 145L448 91L542 157L645 65L736 142L823 89L934 164L1000 117V286H0Z" fill="#dce2cc"/><path d="M0 217Q223 140 414 212T1000 193V620H0Z" fill="#e8e4cc"/><path d="M370 620Q276 459 569 344Q744 274 1000 319" fill="none" stroke="#f2ebd7" stroke-width="115"/><g stroke="#8f9275" stroke-width="2" fill="#d6c49a"><path d="M60 198H170V254H60Z"/><path d="M45 198L113 159L187 198Z" fill="#7b8170"/><path d="M105 217H130V254H105Z" fill="#a08d69"/><path d="M820 190H931V243H820Z"/><path d="M803 192Q874 174 877 155Q884 174 949 192Z" fill="#7b8170"/><path d="M862 208H887V243H862Z" fill="#a08d69"/></g><g fill="#9ea988" opacity=".55"><ellipse cx="40" cy="459" rx="55" ry="16"/><ellipse cx="963" cy="506" rx="82" ry="25"/><ellipse cx="792" cy="579" rx="57" ry="10"/></g></svg>`;
}

function renderBoard() {
  const chosen = board.find((b) => b.id === selectedBoard),
    s = saved.find((s) => s.id === selectedBoard);
  $("#page").innerHTML =
    `<section class="classroom"><div class="board-heading"><div>${heading(6, "우리 반, 하나의 풍속화", "각자의 하루가 모여 우리 반의 조선이 펼쳐져요.")}</div><button class="secondary" data-action="backFromBoard">← 인물 만들기로</button></div><div class="board-toolbar"><span><b>${board.length}</b> / 26명</span><button data-action="import" class="secondary">작품 파일 가져오기</button><button data-action="addAll" class="secondary">모음에서 채우기</button><button data-action="arrange" class="secondary">자리 정돈</button><button data-action="boardPng" class="primary" ${board.length ? "" : "disabled"}>풍속화 PNG 저장 ↓</button></div><p class="small-note">인물을 끌어 옮기거나, 선택 후 방향키로 이동하세요. 겹치면 빈자리로 조금 옮겨져요. 같은 화면에서 함께 배치하는 활동이에요.</p><div class="board-scroll"><div id="classBoard" class="class-board" aria-label="우리 반 풍속화 배치판">${landscape()}<div class="board-title">조선의 하루 <span>우리 반이 함께 만든 풍속화</span></div>${board
      .map((p) => {
        const s = saved.find((s) => s.id === p.id);
        return `<button class="board-person ${p.locked ? "locked" : ""} ${p.id === selectedBoard ? "selected" : ""}" data-person="${esc(p.id)}" style="left:${p.x / 10}%;top:${p.y / 6.2}%;width:10%;height:${130 / 6.2}%" aria-label="${esc(s.name)}${p.locked ? ", 위치 고정됨" : ", 이동 가능"}" aria-pressed="${p.id === selectedBoard}">${avatarSvg(s)}<span>${esc(s.name)}${p.locked ? " · 고정" : ""}</span></button>`;
      })
      .join(
        "",
      )}${board.length ? "" : '<div class="board-empty">아직은 조용한 마을이에요.<br><strong>완성한 인물을 불러와 마을을 채워 주세요.</strong></div>'}</div></div><div class="selection-bar" aria-live="polite"><span>${chosen ? `<strong>${esc(s.name)}</strong> · ${chosen.locked ? "위치가 고정되어 있어요" : "위치를 옮길 수 있어요"}` : "인물을 선택하면 위치를 고정할 수 있어요."}</span>${chosen ? `<div><button class="secondary" data-action="lock">${chosen.locked ? "고정 풀기" : "이 자리에 고정"}</button><button class="text-button" data-action="removeBoard">풍속화에서 빼기</button></div>` : ""}</div><details class="board-library" open><summary>내 인물 모음에서 한 명씩 넣기</summary>${saved.length ? `<div class="person-chips">${saved.map((s) => `<button data-add="${esc(s.id)}" ${board.some((b) => b.id === s.id) ? "disabled" : ""}>${esc(s.name)} <span>${board.some((b) => b.id === s.id) ? "배치됨" : "+ 넣기"}</span></button>`).join("")}</div>` : "<p>먼저 인물을 완성해 저장하거나 다른 기기의 작품 파일을 가져오세요.</p>"}</details><div class="board-bottom"><button class="text-button" data-action="exportAll">배치와 작품 파일 보관 ↓</button><button class="text-button" data-action="padlet">패들렛 공유 방법 ↗</button><span>배치와 작품은 현재 브라우저에 저장돼요.</span></div></section>`;
  bindBoard();
}
