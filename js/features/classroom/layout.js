"use strict";

const BW = 100,
  BH = 110;

// Begin on the open ground, leaving the houses at upper left unobstructed.
const BOARD_PLACES = [
  ...Array.from({ length: 5 }, (_, i) => ({ x: 350 + i * 130, y: 130 })),
  ...Array.from({ length: 6 }, (_, i) => ({ x: 250 + i * 130, y: 245 })),
  ...Array.from({ length: 7 }, (_, i) => ({ x: 50 + i * 130, y: 360 })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 10 + i * 125, y: 475 })),
];

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
  if (!others.some((b) => overlaps(item, b))) return { ...item };
  let best = null,
    distance = Infinity;
  for (let y = 45; y <= 475; y += 5)
    for (let x = 0; x <= 900; x += 5) {
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

function boardInDepthOrder() {
  return [...classroomBoard()].sort((a, b) => a.y - b.y);
}

function resolveBoard() {
  // Preserve intentional overlaps and imported positions exactly.
  board = cleanBoard(board, saved);
}

function addToBoard(id, quiet = false) {
  if (sharedRoom) return sharedAddCharacter(saved.find((s) => s.id === id));
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
      ...BOARD_PLACES[board.length],
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
  if (step === FLOW.BOARD) renderBoard();
  return true;
}

function arrangeBoard() {
  if (sharedRoom) return sharedOperation("arrange");
  const fixed = board.filter((x) => x.locked);
  const moving = board.filter((x) => !x.locked),
    placed = [...fixed];
  for (let i = 0; i < moving.length; i++) {
    const target = {
      ...moving[i],
      ...BOARD_PLACES[i],
    };
    placed.push(freePosition(target, placed) || moving[i]);
  }
  board = placed;
  persist();
  renderBoard();
  toast("고정한 인물은 그대로 두고 나머지를 정돈했어요.");
}

function finishMove(item) {
  if (sharedRoom) {
    queueSharedMove(item, true);
    sharedDragFinished();
    return;
  }
  persist();
  renderBoard();
}
