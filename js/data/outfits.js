"use strict";
window.LESSON_OUTFITS = [
  ["daily", "생활 한복", ["technical", "common", "low"], "#ddca9a"],
  ["scholar", "학자·기술관의 포", ["yangban", "technical"], "#b5c3bb"],
  ["official", "문관 관복", ["yangban"], "#436f86"],
  ["military", "무관 차림", ["yangban"], "#81574b"],
  ["student", "유생 차림", ["yangban"], "#acc3d1"],
  ["graduate", "급제 축하 차림", ["yangban"], "#b86254"],
  ["yangbanwoman", "양반 여성 한복", ["yangban"], "#ab7077"],
  ["royal", "왕의 곤룡포", ["royal"], "#a94d3d"],
  ["prince", "왕자·세자 예복", ["royal"], "#3e6681"],
  ["queen", "왕비의 예복", ["royal"], "#749987"],
  ["princess", "공주의 예복", ["royal"], "#d5a25c"],
  ["performer", "풍물 공연복", ["low"], "#7d9d87"],
  ["dance_robe", "황초삼 공연복", ["low"], "#d4b150"],
  ["palace", "앞치마 나인복", ["royal", "low"], "#8fa48e"],
].map(([id, name, statuses, color]) => ({ id, name, statuses, color }));
