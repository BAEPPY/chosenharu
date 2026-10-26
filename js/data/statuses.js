"use strict";
window.LESSON_STATUSES = [
  {
    id: "royal",
    name: "왕·왕족",
    short: "왕·왕족",
    color: "#D6B36D",
    text: "왕과 왕비, 왕의 자녀 등 왕실에 속한 사람들이에요.",
  },
  {
    id: "yangban",
    name: "양반",
    short: "양반",
    color: "#536777",
    text: "학문을 익히거나 관직에 나아가 정치에 참여하던 지배층이에요.",
  },
  {
    id: "technical",
    name: "기술관 계층",
    short: "기술관",
    color: "#BD956B",
    text: "의학·통역·법률 같은 전문 지식을 갖추고 관청에서 일했어요. 후대에는 중인으로 불린 사람들이 포함돼요.",
  },
  {
    id: "common",
    name: "상민",
    short: "상민",
    color: "#A7B38D",
    text: "농업·상업·수공업 등 여러 일을 맡아 사회를 떠받쳤어요.",
  },
  {
    id: "low",
    name: "천민",
    short: "천민",
    color: "#805537",
    text: "노비 등 신분 때문에 차별과 제약을 겪던 사람들이에요. 신분은 사람의 가치나 능력을 나타내지 않아요.",
  },
].map((status, index) => ({
  ...status,
  weight: window.JOSEON_HISTORY.rows[index].applied,
}));
