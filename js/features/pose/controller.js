"use strict";

let posePicker = { group: "", index: 0 };
function openPoseGroup(group) {
  const poses = groupedPoses(group);
  if (!poses.length) return;
  const selected = state.poseConfirmed
    ? poses.findIndex((p) => p.alias === nativeLook(state).pose)
    : -1;
  posePicker = { group, index: Math.max(0, selected) };
  openModal(POSE_GROUPS.find((g) => g.id === group).label, poseDialogBody());
  $("#modal").classList.add("pose-dialog");
}
function turnPose(direction) {
  const poses = groupedPoses(posePicker.group);
  if (!poses.length) return;
  posePicker.index =
    (posePicker.index + direction + poses.length) % poses.length;
  $("#modalBody").innerHTML = poseDialogBody();
  $(`[data-pose-turn="${direction}"]`)?.focus();
}
function confirmPose() {
  const pose = groupedPoses(posePicker.group)[posePicker.index];
  if (!pose) return;
  state.pose = pose.alias;
  state.poseConfirmed = true;
  $("#modal").close();
  if (!state.name) suggestName();
  go(FLOW.IDENTITY);
}
document.addEventListener("keydown", (e) => {
  if (!$("#modal").open || !$("#modal").classList.contains("pose-dialog"))
    return;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    turnPose(e.key === "ArrowLeft" ? -1 : 1);
  }
});
