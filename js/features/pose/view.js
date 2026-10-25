"use strict";

function posePreviewSvg(pose) {
  return avatarSvg(
    {
      ...DEFAULT,
      pose,
      hair: "short_hair",
      top: "#F4F3EF",
      bottom: "#F4F3EF",
      layer: "#F4F3EF",
    },
    { faceless: true },
  );
}

function poseHtml() {
  const selected = nativeLook(state).pose;
  return (
    heading(
      2,
      "어떤 모습으로 만들어 볼까요?",
      "동작의 종류를 고른 뒤, 마음에 드는 자세를 선택하세요.",
    ) +
    `<div class="pose-groups">${POSE_GROUPS.map((group) => {
      const poses = groupedPoses(group.id);
      if (!poses.length) return "";
      const chosen =
        state.poseConfirmed && poses.find((p) => p.alias === selected);
      return `<button class="pose-group ${chosen ? "selected" : ""}" data-pose-group="${group.id}" aria-label="${group.label}, ${poses.length}개 동작" aria-pressed="${!!chosen}">${posePreviewSvg((chosen || poses[0]).alias)}<strong>${group.label}</strong><span>${chosen ? esc(chosen.label || chosen.name) : poses.length + "개 동작"}</span></button>`;
    }).join("")}</div>`
  );
}

function poseDialogBody() {
  const poses = groupedPoses(posePicker.group),
    pose = poses[posePicker.index];
  return `<div class="pose-stage">${posePreviewSvg(pose.alias)}</div><p class="pose-caption">${esc(pose.label || pose.name)}</p>
    <div class="pose-pager"><button class="pose-arrow" data-pose-turn="-1" aria-label="이전 동작" ${poses.length === 1 ? "disabled" : ""}>←</button><span aria-live="polite">${posePicker.index + 1} / ${poses.length}</span><button class="pose-arrow" data-pose-turn="1" aria-label="다음 동작" ${poses.length === 1 ? "disabled" : ""}>→</button></div>
    <div class="pose-dialog-actions"><button class="secondary" data-action="close">닫기</button><button class="primary" data-action="confirmPose">이 동작으로 계속 →</button></div>`;
}
