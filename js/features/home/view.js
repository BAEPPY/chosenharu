"use strict";

function landingHtml() {
  const figures = [
    {
      pose: "reading_writing_01",
      top: "#F4EFE2",
      bottom: "#748975",
      hair: "sangtu",
    },
    {
      pose: "dancing_hansam_02",
      top: "#BBC5A0",
      bottom: "#7E8D9B",
      hair: "short_hair",
    },
    {
      pose: "holding_fan_03",
      top: "#D3AD7C",
      bottom: "#806D57",
      hair: "sangtu",
    },
  ];
  return `<section class="welcome" aria-labelledby="welcomeTitle">
    <div class="welcome-heading"><p class="eyebrow">사회 시간에 만나는 옛사람들의 생활</p>
      <div class="welcome-title-row"><h1 id="welcomeTitle">조선의 하루</h1><span class="title-seal" aria-hidden="true">우리<br>이야기</span></div>
      <p class="welcome-intro">옛사람의 삶을 상상하고,<br>우리 반의 <em>풍속화</em>를 그려요.</p>
      <p class="welcome-description">어떤 일을 하고, 누구를 만났을까요?<br>한 사람의 하루에서 조선의 생활을 발견해 보세요.</p>
      <div class="welcome-actions">${studentActivityActionsHtml()}<p class="resume-note">${state.status ? "이 기기에서 만들던 인물을 이어서 꾸밀 수 있어요." : "만들던 인물이 생기면 이어 만들기가 열려요."}</p><button class="text-button" data-action="guide">처음이라면, 활동 방법 살펴보기</button></div>
      <p class="welcome-subject">초등 사회 <span aria-hidden="true">·</span> 조선 시대의 생활과 문화</p>
    </div>
    <figure class="welcome-art"><img src="images/ui/hero.webp" alt="창호문과 기와지붕이 있는 한옥 앞마당에 조선 시대 인물들이 모인 풍경" fetchpriority="high" width="1536" height="1024"><div class="welcome-people" aria-hidden="true">${figures.map((f, i) => `<div class="welcome-person person-${i}">${avatarSvg({ ...DEFAULT, ...f, status: "common", role: "farmer", outfit: "daily", emotion: "smiling", skin: 2 })}</div>`).join("")}</div><figcaption><span>오늘의 물음</span> 나와 다른 삶을 살았다면, 어떤 하루였을까?</figcaption></figure>
  </section>
  <section class="learning-path" aria-labelledby="pathTitle"><div class="section-caption"><p class="eyebrow">살펴보고 · 상상하고 · 함께 그려요</p><h2 id="pathTitle">우리의 이야기는 이렇게 시작돼요</h2></div><ol>${[
    [
      "draw",
      "인물을 만나고",
      "신분과 동작을 고르며<br>조선의 사람들을 알아봐요.",
    ],
    [
      "book",
      "하루를 상상하고",
      "옷차림과 하는 일을 살펴<br>나만의 이야기를 써요.",
    ],
    [
      "classroom",
      "함께 풍속화로",
      "친구들의 인물과 모여<br>우리 반의 하루를 완성해요.",
    ],
  ]
    .map(
      ([art, title, copy], i) =>
        `<li>${icon(art)}<div><span class="path-number">0${i + 1}</span><h3>${title}</h3><p>${copy}</p></div></li>`,
    )
    .join("")}</ol></section>
  <section class="home-teacher"><div class="home-teacher-title">${icon("teacher")}<div><p class="eyebrow">선생님과 함께</p><h2>각자의 하루가 모이는 우리 반 교실</h2><p>학생 참여 링크를 나누고, 함께 만드는 풍속화를 살펴보세요.</p></div></div><button class="secondary" data-action="teacherHome">교사용 교실 열기 <span aria-hidden="true">→</span></button></section>`;
}
function renderLanding() {
  $("#page").innerHTML = landingHtml();
}
function showHome(push = true) {
  if (spinning) return;
  landing = true;
  if (push) window.history.pushState({}, "", "#home");
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}
function startActivity() {
  if (!state.status) return;
  landing = false;
  go(step === FLOW.BOARD ? returnStep : step);
}

function studentActivityActionsHtml() {
  return `<div class="student-activity-actions" role="group" aria-label="인물 만들기"><button class="primary" data-action="start">${icon("ring")} 새로 만들기</button><button class="secondary" data-action="resume" ${state.status ? "" : "disabled"}>${icon("book")} 이어 만들기</button></div>`;
}

function startNewActivity() {
  const stored = saved.find((s) => s.id === state.id);
  if (state.status && JSON.stringify(stored) !== JSON.stringify(state)) {
    openModal(
      "새 인물을 만들까요?",
      '<p>작성 중인 인물은 새 인물로 바뀌어요. 인물 모음에 저장한 작품과 공동 풍속화에 올린 인물은 남아 있어요.</p><div class="student-activity-actions"><button class="secondary" data-action="close">계속 만들기</button><button class="primary" data-action="new">새로 만들기</button></div>',
    );
    return;
  }
  newCharacter();
}
