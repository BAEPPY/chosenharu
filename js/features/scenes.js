"use strict";

// Backgrounds are drawn once, then chosen from scenes appropriate to the pose.
// The selected scene is part of the artwork, not a new random value each render.
const SCENES = Object.freeze({
  study: { name: "서당 앞 돌뜰", file: "images/scenes/study.webp" },
  porch: { name: "따뜻한 마루", file: "images/scenes/porch.webp" },
  courtyard: { name: "넓은 마당", file: "images/scenes/courtyard.webp" },
  shade: { name: "나무 그늘의 자리", file: "images/scenes/shade.webp" },
  stream: { name: "고요한 물가", file: "images/scenes/stream.webp" },
  lane: { name: "마을 골목", file: "images/scenes/lane.webp" },
});

const POSE_SCENES = Object.freeze({
  reading_writing: ["study", "porch"],
  crafting: ["porch", "study"],
  eating_drinking: ["porch", "shade"],
  resting: ["shade", "porch"],
  lying: ["shade", "porch"],
  sitting: ["shade", "stream", "porch"],
  with_child: ["shade", "porch", "lane"],
  trudging: ["lane", "courtyard"],
  dancing_hansam: ["courtyard", "study"],
  dancing: ["courtyard", "study"],
  working_out: ["courtyard", "study"],
  playing_music: ["porch", "courtyard"],
  cheering: ["courtyard", "lane"],
  posing: ["lane", "courtyard", "study"],
  holding_fan: ["lane", "courtyard", "shade"],
});

function scenesFor(s) {
  const pose = NATIVE_POSE[s.pose] || s.pose;
  return POSE_SCENES[pose.replace(/_\d+$/, "")] || ["courtyard", "lane"];
}

function ensureScene(s, replace = false) {
  const candidates = scenesFor(s);
  if (!replace && s.scenePose === s.pose && candidates.includes(s.scene))
    return false;
  const alternatives = candidates.filter((id) => id !== s.scene);
  s.scene = choose(alternatives.length ? alternatives : candidates);
  s.scenePose = s.pose;
  return true;
}

function sceneSvg(s) {
  const scene = SCENES[s.scene];
  if (!scene) return avatarSvg(s);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 360" role="img" aria-label="${esc(scene.name)}에서 ${esc(s.name || "나의 인물")}"><image href="${scene.file}" width="360" height="360" preserveAspectRatio="xMidYMid slice"/>${avatarSvg(s)}</svg>`;
}

async function drawScene(ctx, s, x, y, size) {
  const image = new Image();
  image.src =
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(await inlineSvgImages(sceneSvg(s)));
  await image.decode();
  ctx.drawImage(image, x, y, size, size);
}

function changeScene() {
  ensureScene(state, true);
  saved = saved.map((s) => (s.id === state.id ? { ...state } : s));
  persist();
  render();
  toast(`${SCENES[state.scene].name}으로 바꿨어요.`);
  $('[data-action="changeScene"]')?.focus({ preventScroll: true });
}
