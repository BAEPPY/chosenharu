"use strict";

// Household heads, not a census of every person in Joseon.
window.JOSEON_HISTORY = {
  title: "1717년 단성현 호적",
  unit: "호주(가구 대표)의 신분 구성비",
  sourceTitle: "국사편찬위원회 우리역사넷 · 각 신분의 존재 양상, 표 3",
  sourceUrl:
    "https://contents.history.go.kr/front/nh/view.do?levelId=nh_031_0030_0040_0030",
  rows: [
    { id: "royal", label: "왕·왕족", historical: null, applied: 0.5 },
    { id: "yangban", label: "양반", historical: 18.6, applied: 18.3 },
    {
      id: "technical",
      label: "중인",
      historical: 8.6,
      applied: 8.7,
    },
    { id: "common", label: "상민", historical: 45.6, applied: 46.1 },
    { id: "low", label: "노비 → 천민", historical: 26.1, applied: 26.4 },
  ],
  unclassified: 1.1,
  legacyWeights: [0.5, 6, 3.5, 57, 33],
};
