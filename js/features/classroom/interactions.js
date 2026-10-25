"use strict";

function bindBoard() {
  const el = $("#classBoard");
  let drag = null;
  el.addEventListener("pointerdown", (e) => {
    const target = e.target.closest("[data-person]");
    if (!target || e.button !== 0) return;
    const item = board.find((b) => b.id === target.dataset.person);
    selectedBoard = item.id;
    if (item.locked) {
      renderBoard();
      return;
    }
    const bounds = el.getBoundingClientRect();
    drag = {
      item,
      target,
      startX: e.clientX,
      startY: e.clientY,
      x: item.x,
      y: item.y,
      scale: 1000 / bounds.width,
    };
    target.setPointerCapture(e.pointerId);
    target.classList.add("dragging");
    e.preventDefault();
  });
  el.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const d = drag;
    d.item.x = Math.max(
      0,
      Math.min(900, d.x + (e.clientX - d.startX) * d.scale),
    );
    d.item.y = Math.max(
      45,
      Math.min(475, d.y + (e.clientY - d.startY) * d.scale),
    );
    d.target.style.left = d.item.x / 10 + "%";
    d.target.style.top = d.item.y / 6.2 + "%";
    const clash = board.some((b) => overlaps(d.item, b));
    d.target.classList.toggle("overlap", clash);
    if (clash && !d.warned) {
      toast("겹쳐요! 놓으면 빈자리로 옮겨져요.");
      d.warned = true;
    }
  });
  el.addEventListener("pointerup", () => {
    if (!drag) return;
    const d = drag;
    drag = null;
    finishMove(d.item, { x: d.x, y: d.y });
  });
  el.addEventListener("pointercancel", () => {
    if (!drag) return;
    Object.assign(drag.item, { x: drag.x, y: drag.y });
    drag = null;
    renderBoard();
  });
  el.addEventListener("keydown", (e) => {
    const target = e.target.closest("[data-person]");
    if (!target) return;
    const item = board.find((b) => b.id === target.dataset.person);
    selectedBoard = item.id;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      renderBoard();
      return;
    }
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key))
      return;
    e.preventDefault();
    if (item.locked) {
      toast("위치 고정을 먼저 풀어 주세요.");
      return;
    }
    const prev = { x: item.x, y: item.y },
      d = e.shiftKey ? 30 : 10;
    item.x = Math.max(
      0,
      Math.min(
        900,
        item.x + (e.key === "ArrowRight" ? d : e.key === "ArrowLeft" ? -d : 0),
      ),
    );
    item.y = Math.max(
      45,
      Math.min(
        475,
        item.y + (e.key === "ArrowDown" ? d : e.key === "ArrowUp" ? -d : 0),
      ),
    );
    finishMove(item, prev);
    const targetAgain = [...document.querySelectorAll("[data-person]")].find(
      (b) => b.dataset.person === item.id,
    );
    targetAgain?.focus();
  });
}
