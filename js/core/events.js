"use strict";

document.addEventListener("click", async (e) => {
  const b = e.target.closest("button");
  if (!b || b.disabled) return;
  const d = b.dataset;
  if (d.drawIndex !== undefined) {
    selectDraw(Number(d.drawIndex));
    return;
  }
  if (d.palette) {
    undo.push({ ...state });
    if (undo.length > 25) undo.shift();
    state[d.palette] = d.color;
    persist();
    render();
    return;
  }
  if (d.step !== undefined) {
    go(Number(d.step));
    return;
  }
  if (d.gender) {
    setGender(d.gender);
    return;
  }
  if (d.role) {
    applyRole(d.role);
    persist();
    render();
    return;
  }
  if (d.style) {
    styleTab = d.style;
    render();
    return;
  }
  if (d.choice) {
    undo.push({ ...state });
    if (undo.length > 25) undo.shift();
    if (d.choice === "outfit") {
      state.outfit = d.value;
      if (!posesFor(state).some((p) => p.alias === state.pose))
        state.pose = "audience";
    } else state[d.choice] = d.choice === "skin" ? Number(d.value) : d.value;
    persist();
    render();
    return;
  }
  if (d.add) {
    addToBoard(d.add);
    return;
  }
  if (d.load) {
    state = { ...saved.find((x) => x.id === d.load) };
    draws = 4;
    drawHistory = [null, null, null, state.status];
    selectedDraw = 3;
    $("#modal").close();
    persist();
    go(1);
    return;
  }
  if (d.delete) {
    const s = saved.find((s) => s.id === d.delete);
    openModal(
      "인물을 삭제할까요?",
      `<p>${esc(s.name)}의 작품과 풍속화 배치가 이 기기에서 삭제돼요. 보관하려면 먼저 작품 파일을 내려받아 주세요.</p><button class="secondary" data-action="gallery">돌아가기</button> <button class="primary" data-confirm-delete="${esc(s.id)}">삭제하기</button>`,
    );
    return;
  }
  if (d.confirmDelete) {
    const before = { saved, board };
    saved = saved.filter((s) => s.id !== d.confirmDelete);
    board = board.filter((s) => s.id !== d.confirmDelete);
    if (!persist()) {
      saved = before.saved;
      board = before.board;
    }
    gallery();
    render();
    return;
  }
  switch (d.action) {
    case "home":
      showHome();
      break;
    case "start":
      startActivity();
      break;
    case "retryDraw":
      $("#modal").close();
      spin();
      break;
    case "acceptDraw":
      $("#modal").close();
      next();
      break;
    case "spin":
      spin();
      break;
    case "next":
      next();
      break;
    case "prev":
      go(Math.max(0, step - 1));
      break;
    case "name":
      suggestName();
      break;
    case "new":
      newCharacter();
      break;
    case "gallery":
      gallery();
      break;
    case "close":
      $("#modal").close();
      break;
    case "guide":
      guide();
      break;
    case "sources":
      sources();
      break;
    case "weights":
      weightsModal();
      break;
    case "resetWeights":
      weights = L.statuses.map((s) => s.weight);
      persist();
      render();
      weightsModal();
      break;
    case "padlet":
      padletGuide();
      break;
    case "recordNames":
      openModal(
        "옛 기록의 이름, 존중하며 읽어요",
        `<p>옛 기록에는 동물이나 생김새를 빗댄 이름도 남아 있어요. 당시의 차별이 담긴 표현일 수 있으므로 친구를 놀리는 별명으로 사용하지 않아요. 누구나 소중하며, 마음에 드는 이름으로 바꿀 수 있어요.</p><p class="record-names">${L.recordNames.join(" · ")}</p><p class="small-note">여러 시기의 기록을 바탕으로 제안된 이름 예시예요. 모두가 15~16세기 이름으로 확인된 것은 아니에요.</p><a href="https://encykorea.aks.ac.kr/Article/E0012757" target="_blank" rel="noopener">노비의 이름과 생활 자료 ↗</a>`,
      );
      break;
    case "undo":
      if (undo.length) {
        state = undo.pop();
        persist();
        render();
      }
      break;
    case "png":
      await exportPng();
      break;
    case "characterPng":
      await exportPng(true);
      break;
    case "exportOne":
      if (saveRecord(true)) exportRecords([state]);
      break;
    case "exportAll":
      exportRecords(saved, true);
      break;
    case "import":
      $("#importFile").click();
      break;
    case "board":
      if ($("#modal").open) $("#modal").close();
      if (step !== 5) returnStep = step;
      go(5);
      break;
    case "backFromBoard":
      go(returnStep);
      break;
    case "addCurrent":
      if (saveRecord(true)) {
        addToBoard(state.id);
        returnStep = 4;
        go(5);
      }
      break;
    case "addAll":
      for (const s of saved) {
        if (board.length >= 26) break;
        addToBoard(s.id, true);
      }
      renderBoard();
      toast(board.length + "명을 풍속화에 배치했어요.");
      break;
    case "arrange":
      arrangeBoard();
      break;
    case "boardPng":
      await exportBoardPng();
      break;
    case "lock": {
      const p = board.find((p) => p.id === selectedBoard);
      if (p) {
        p.locked = !p.locked;
        persist();
        renderBoard();
      }
      break;
    }
    case "removeBoard":
      board = board.filter((p) => p.id !== selectedBoard);
      selectedBoard = "";
      persist();
      renderBoard();
      break;
  }
});

document.addEventListener("input", (e) => {
  const k = e.target.dataset.field;
  if (
    ![
      "name",
      "place",
      "story",
      "imagination",
      "top",
      "bottom",
      "layer",
    ].includes(k)
  )
    return;
  if (k === "name" && state.status === "royal") return;
  state[k] = e.target.value;
  if (k === "name") {
    state.figure = "";
    const info = $(".figure-info");
    if (info) info.hidden = true;
    const picker = $('[data-field="figure"]');
    if (picker) picker.value = "";
  }
  persist();
  if ($("#previewName"))
    $("#previewName").textContent = state.name || "이름을 지어 주세요";
  if (["top", "bottom", "layer"].includes(k))
    $("#avatar").innerHTML = avatarSvg(state);
});

document.addEventListener("change", (e) => {
  if (e.target.dataset.field === "figure") {
    const f = L.figures.find(
      (f) =>
        f.id === e.target.value &&
        f.status === state.status &&
        f.gender === state.gender,
    );
    if (!f) return;
    state.name = f.name;
    state.figure = f.id;
    applyRole(f.role);
    persist();
    render();
  }
});

$("#importFile").addEventListener("change", (e) =>
  importFiles([...e.target.files]),
);

$("#modal").addEventListener("click", (e) => {
  if (e.target === $("#modal")) $("#modal").close();
});

window.addEventListener("popstate", () => {
  if (spinning) return;
  const hash = window.location.hash;
  if (!hash || hash === "#home") {
    showHome(false);
    return;
  }
  const n = hash === "#classroom" ? 5 : Number(hash.replace("#step-", "")) - 1;
  go(Number.isInteger(n) && n >= 0 && n <= 5 ? n : 0, false);
});
