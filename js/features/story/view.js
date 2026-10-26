"use strict";

function storyHtml() {
  return (
    heading(
      4,
      "어떤 하루를 보냈을까요?",
      "인물의 눈으로 보고, 나의 상상으로 이야기를 써요.",
    ) +
    `<div class="prompt-box"><span>상상의 실마리</span><p>“오늘 내가 맡은 일은 ‘${esc(roleOf(state).name)}’. 무엇을 했을까?<br>누구를 만났고, 어떤 마음이 들었을까?”</p></div><label class="field">어디에서 지내나요?<input data-field="place" value="${esc(state.place)}" maxlength="60" placeholder="예: 한양의 장터, 궁궐, 마을의 논과 밭"></label><label class="field">나의 하루 이야기<textarea data-field="story" maxlength="600" placeholder="아침에 일어나서… / 나는 오늘…">${esc(state.story)}</textarea><span class="field-hint">하는 일, 필요한 도구, 만나는 사람을 떠올려 보세요.</span></label><label class="field">상상을 더해요<textarea data-field="imagination" maxlength="600" placeholder="오늘 가장 기억에 남는 사건은? 나의 소원은? 친구의 인물과 만난다면?">${esc(state.imagination)}</textarea></label><div class="fact-box"><strong>생각을 넓혀요</strong><p>신분에 따라 할 수 있는 일이 달랐다면 어떤 기분이 들었을까요? 오늘날의 생활과도 비교해 보세요.</p></div>`
  );
}

function cardHtml() {
  return (
    heading(
      5,
      "한 사람의 하루가 완성됐어요.",
      "친구에게 소개하고, 우리 반의 커다란 풍속화에 함께 담아요.",
    ) +
    `<div class="scene-choice"><div><span>동작에 어울리는 배경</span><strong>${esc(SCENES[state.scene].name)}</strong></div><button class="secondary" data-action="changeScene">다른 어울리는 배경 ↻</button></div><article class="story-card"><p class="eyebrow">나의 조선 인물</p><h2>${esc(state.name)}</h2><span>${statusOf(state).name} · ${roleOf(state).name}</span><dl><dt>살아가는 곳</dt><dd>${esc(state.place || "아직 정하지 않았어요")}</dd><dt>나의 하루</dt><dd>${esc(state.story || "이전 단계에서 이야기를 적어 주세요.")}</dd>${state.imagination ? `<dt>상상을 더해요</dt><dd>${esc(state.imagination)}</dd>` : ""}</dl></article><div class="download-actions"><button class="primary" data-action="png">인물 카드 PNG 저장 ↓</button><button class="secondary" data-action="characterPng">인물만 PNG 저장 ↓</button><button class="secondary" data-action="exportOne">우리 반에 보낼 작품 파일 ↓</button><button class="secondary" data-action="addCurrent">풍속화에 이 인물 넣기 →</button></div><p class="small-note">선택된 배경은 인물 카드와 작품 파일에 함께 저장돼요. PNG는 패들렛에 바로 첨부할 수 있어요. 작품 파일(JSON)은 선생님 기기로 모아 풍속화를 만들 때 사용해요.</p><p class="small-note session-note">1시간 동안 이용하지 않으면 작품과 배치가 초기화돼요. 간직할 작품은 파일로 내려받아 주세요.</p><div class="look-tools"><button class="text-button" data-action="padlet">패들렛에 올리는 방법 ↗</button><button class="text-button" data-action="new">새 인물 만들기</button></div>`
  );
}
