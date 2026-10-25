"use strict";

const POSE_GROUPS = [
  ["lying", "누워있는 모습"],
  ["eating_drinking", "먹고 마시는 모습"],
  ["trudging", "걷거나 서 있는 모습"],
  ["dancing", "춤을 추는 모습"],
  ["dancing_hansam", "한삼을 들고 춤추는 모습"],
  ["working_out", "운동하는 모습"],
  ["posing", "포즈 취하는 모습"],
  ["holding_fan", "부채를 들고 있는 모습"],
  ["playing_music", "악기를 연주하는 모습"],
  ["cheering", "응원하는 모습"],
  ["with_child", "아이와 함께 있는 모습"],
  ["sitting", "앉아있는 모습"],
  ["reading_writing", "읽고 쓰는 모습"],
  ["crafting", "일하는 모습"],
].map(([id, label]) => ({ id, label }));

function groupedPoses(group) {
  return D.lessonPoses.filter(
    (p) => (p.group || p.alias.replace(/_\d+$/, "")) === group,
  );
}
