"use strict";

const BW = 100,
  BH = 130;

function overlaps(a, b) {
  return (
    a.id !== b.id &&
    a.x < b.x + BW + 5 &&
    a.x + BW + 5 > b.x &&
    a.y < b.y + BH + 5 &&
    a.y + BH + 5 > b.y
  );
}

function freePosition(item, others) {
  let best = null,
    distance = Infinity;
  for (let y = 65; y <= 470; y += 5)
    for (let x = 20; x <= 880; x += 5) {
      const candidate = { ...item, x, y };
      if (!others.some((b) => overlaps(candidate, b))) {
        const d = (x - item.x) ** 2 + (y - item.y) ** 2;
        if (d < distance) {
          best = candidate;
          distance = d;
        }
      }
    }
  return best;
}

function resolveBoard() {
  const placed = [];
  for (const item of [
    ...board.filter((b) => b.locked),
    ...board.filter((b) => !b.locked),
  ]) {
    const target = placed.some((b) => overlaps(item, b))
      ? freePosition(item, placed)
      : item;
    if (target) placed.push(target);
  }
  board = placed;
}

function addToBoard(id, quiet = false) {
  if (board.some((b) => b.id === id)) {
    if (!quiet) toast("이미 풍속화에 있는 인물이에요.");
    return false;
  }
  if (board.length >= 26) {
    if (!quiet) toast("한 풍속화에는 26명까지 넣을 수 있어요.");
    return false;
  }
  const p = freePosition(
    {
      id,
      x: 50 + (board.length % 7) * 135,
      y: 65 + Math.floor(board.length / 7) * 135,
      locked: false,
    },
    board,
  );
  if (!p) {
    toast("배치할 자리가 부족해요. 인물을 조금 옮겨 주세요.");
    return false;
  }
  board.push(p);
  persist();
  if (step === 5) renderBoard();
  return true;
}

function arrangeBoard() {
  const fixed = board.filter((x) => x.locked);
  const moving = board.filter((x) => !x.locked),
    placed = [...fixed];
  for (let i = 0; i < moving.length; i++) {
    const target = {
      ...moving[i],
      x: 50 + (i % 7) * 135,
      y: 65 + Math.floor(i / 7) * 135,
    };
    placed.push(freePosition(target, placed) || moving[i]);
  }
  board = placed;
  persist();
  renderBoard();
  toast("고정한 인물은 그대로 두고 나머지를 정돈했어요.");
}

function finishMove(item, previous) {
  if (board.some((b) => overlaps(item, b))) {
    toast("겹쳐요! 가까운 빈자리로 옮겼어요.");
    const free = freePosition(
      item,
      board.filter((b) => b.id !== item.id),
    );
    Object.assign(item, free || previous);
  }
  persist();
  renderBoard();
}
