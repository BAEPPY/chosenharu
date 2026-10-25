"use strict";

function identityHtml() {
  const f = figureOf(state),
    figures = L.figures.filter(
      (f) => f.status === state.status && f.gender === state.gender,
    );
  return (
    heading(
      2,
      "이 사람을 소개해 주세요.",
      "성별과 이름, 하는 일을 정하며 인물을 알아가요.",
    ) +
    `<div class="status-banner"><b>${statusOf(state).name}</b><span>${statusOf(state).text}</span></div><div class="field"><span>성별 선택</span><div class="segmented">${[
      ["male", "남성"],
      ["female", "여성"],
    ]
      .map(
        ([v, t]) =>
          `<button data-gender="${v}" class="${v === state.gender ? "selected" : ""}" aria-pressed="${v === state.gender}">${t}</button>`,
      )
      .join(
        "",
      )}</div></div><div class="name-row"><label class="field">${state.status === "royal" ? "실제 왕실 인물" : "인물 이름"}<input data-field="name" value="${esc(state.name)}" maxlength="24" ${state.status === "royal" ? "readonly" : ""} placeholder="상상한 이름을 직접 써도 좋아요"></label><button class="secondary" data-action="name">이름 다시 추천 ↻</button></div>${figures.length ? `<label class="field">역사 속 인물에서 고르기<select data-field="figure"><option value="">인물을 선택하세요</option>${figures.map((x) => `<option value="${x.id}" ${x.id === state.figure ? "selected" : ""}>${x.label}</option>`).join("")}</select></label>` : ""}${f ? `<div class="figure-info"><strong>${f.label}</strong><p>${f.bio}</p><a href="${f.url}" target="_blank" rel="noopener">이 인물 알아보기 ↗</a></div>` : ""}${state.status === "royal" ? '<p class="small-note">왕 역할은 남성, 왕비·공주는 여성 인물에서 선택해요. 왕과 왕의 자녀는 이씨이며, 왕비는 본래의 성씨를 유지했어요. 실제 인물의 이름·칭호를 고르고, 하루의 사건은 상상해 보세요.</p>' : `<p class="small-note">추천 이름을 바꾸거나 직접 입력할 수 있어요. ${state.status === "yangban" ? "실제 인물을 고른 뒤 역할을 바꾸면 가상 이야기로 표현해요." : "이름 목록은 여러 시기의 예시이며 특정 시대의 모든 이름을 대표하지 않아요."}</p>`}${state.status === "low" ? '<button class="text-button" data-action="recordNames">옛 기록의 이름과 차별 이야기 살펴보기 ↗</button>' : ""}<h2 class="small-heading">어떤 일을 하며 지낼까요?</h2><div class="choice-grid roles">${rolesFor(
      state,
    )
      .map(
        (r) =>
          `<button data-role="${r.id}" class="choice ${state.role === r.id ? "selected" : ""}" aria-pressed="${state.role === r.id}" ${state.status === "royal" && f && f.role !== r.id ? "disabled" : ""}>${r.name}</button>`,
      )
      .join(
        "",
      )}</div><div class="fact-box"><strong>${roleOf(state).name}</strong><p>${roleOf(state).text}</p></div><p class="small-note">신분과 직업이 언제나 하나씩 연결되지는 않았어요. 당시의 제약을 살피기 위해 대표적인 역할을 모았어요.</p>`
  );
}
