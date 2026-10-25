"use strict";

function landingHtml() {
  return `<section class="welcome" aria-labelledby="welcomeTitle"><div class="welcome-heading"><p>사회 시간에 만나는 옛사람들의 생활</p><h1 id="welcomeTitle">조선의 하루</h1></div><div class="welcome-figure" role="img" aria-label="파란 한복을 입고 그림을 보여 주는 인물"><div class="welcome-sprite"></div><img class="welcome-speech" src="images/speech.png" alt="같이 그려 볼 사람?"></div><div class="welcome-bottom"><button class="start-button" data-action="start">시작하기</button><button class="welcome-credit" data-action="sources">그림 출처</button></div></section>`;
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
  landing = false;
  go(step === 5 ? 0 : step);
}
