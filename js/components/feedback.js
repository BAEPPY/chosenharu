"use strict";

function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("show"), 3800);
}

function openModal(title, html) {
  $("#modal").classList.remove("winner-dialog");
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  if (!$("#modal").open) $("#modal").showModal();
}
