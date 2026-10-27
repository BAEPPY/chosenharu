"use strict";

const CLASSROOM_ACCESS_KEY = "joseon-shared-access-v1";
const CLASSROOM_CURRENT_KEY = "joseon-current-classroom";
let sharedRoom = null,
  sharedView = "local",
  sharedTimer = null,
  sharedGeneration = 0;
let sharedDragging = "",
  sharedError = "",
  sharedRefreshNeeded = false;
const sharedMoves = new Map();

function classroomBoard() {
  if (!sharedRoom) return board;
  return sharedRoom.board.map((p) => ({
    ...p,
    ...(sharedMoves.get(p.id)?.position || {}),
  }));
}
function classroomRecords() {
  return sharedRoom ? sharedRoom.records : saved;
}
function isTeacherRoom() {
  return sharedRoom?.role === "teacher";
}
function canEditPerson(p) {
  return (
    !sharedRoom ||
    isTeacherRoom() ||
    (!sharedRoom.paused && p.ownerId === sharedRoom.actorId)
  );
}
function roomHash() {
  return sharedRoom
    ? `#${isTeacherRoom() ? "teacher" : "classroom"}/${sharedRoom.id}`
    : sharedView === "teacher-home"
      ? "#teacher"
      : "#classroom";
}
function storedClassrooms() {
  try {
    const list = JSON.parse(localStorage.getItem(CLASSROOM_ACCESS_KEY) || "[]");
    return Array.isArray(list)
      ? list
          .filter(
            (x) => x && typeof x.id === "string" && typeof x.token === "string",
          )
          .slice(-40)
      : [];
  } catch {
    return [];
  }
}
function rememberClassroom(data, token) {
  const list = storedClassrooms().filter(
    (x) => x.id !== data.id || x.role !== data.role,
  );
  list.push({
    id: data.id,
    title: data.title,
    role: data.role,
    token,
    createdAt: data.createdAt,
  });
  try {
    localStorage.setItem(CLASSROOM_ACCESS_KEY, JSON.stringify(list.slice(-40)));
  } catch {}
}
function leaveSharedView() {
  try {
    sessionStorage.removeItem(CLASSROOM_CURRENT_KEY);
  } catch {}
  sharedGeneration++;
  clearTimeout(sharedTimer);
  sharedTimer = null;
  sharedRoom = null;
  sharedView = "local";
  sharedDragging = "";
  sharedMoves.clear();
  sharedRefreshNeeded = false;
}
function showTeacherHome(push = true) {
  if (!requireTeacherEntry()) return;
  if (step !== FLOW.BOARD) returnStep = step;
  leaveSharedView();
  sharedView = "teacher-home";
  landing = false;
  step = FLOW.BOARD;
  if (push) history.pushState({}, "", "#teacher");
  render();
}
function updateSharedStatus(message, failed = false) {
  const el = $("#sharedStatus");
  if (!el) return;
  el.textContent = message;
  el.classList.toggle("disconnected", failed);
}
async function classroomRequest(body, query = "", token = sharedRoom?.token) {
  const response = await fetch("/api/classrooms" + query, {
    method: body ? "POST" : "GET",
    cache: "no-store",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15000),
  });
  if (response.status === 204) return null;
  let data;
  try {
    data = await response.json();
  } catch {
    throw Object.assign(new Error("교실 연결을 확인해 주세요."), {
      status: response.status,
    });
  }
  if (!response.ok)
    throw Object.assign(new Error(data.error || "교실에 연결하지 못했어요."), {
      status: response.status,
    });
  return data;
}
function setRoomSnapshot(data, force = false) {
  if (
    !sharedRoom ||
    data.id !== sharedRoom.id ||
    data.revision < sharedRoom.revision
  )
    return;
  const normalizedRecords = data.records.map(normalize);
  const structural =
    JSON.stringify([
      sharedRoom.records,
      sharedRoom.board.map((p) => [p.id, p.locked]),
      sharedRoom.paused,
    ]) !==
    JSON.stringify([
      normalizedRecords,
      data.board.map((p) => [p.id, p.locked]),
      data.paused,
    ]);
  Object.assign(sharedRoom, data, { records: normalizedRecords });
  if (step !== FLOW.BOARD || landing) return;
  if ((structural || force) && !sharedDragging) {
    renderBoard();
    return;
  }
  if (structural) sharedRefreshNeeded = true;
  for (const p of classroomBoard()) {
    const el = [...document.querySelectorAll("[data-person]")].find(
      (el) => el.dataset.person === p.id,
    );
    if (el && p.id !== sharedDragging) {
      el.style.left = p.x / 10 + "%";
      el.style.top = p.y / 6.2 + "%";
      el.style.zIndex = Math.round(p.y * 10) + 1;
    }
  }
  updateSharedStatus(sharedMoves.size ? "내 이동 반영 중…" : "실시간 연결됨");
}
function scheduleRoomSync(delay = 1000) {
  clearTimeout(sharedTimer);
  const generation = sharedGeneration;
  sharedTimer = setTimeout(async () => {
    if (!sharedRoom || generation !== sharedGeneration) return;
    if (
      document.visibilityState !== "visible" ||
      landing ||
      step !== FLOW.BOARD
    ) {
      scheduleRoomSync(1500);
      return;
    }
    try {
      const data = await classroomRequest(
        null,
        `?room=${sharedRoom.id}&since=${sharedRoom.revision}`,
      );
      if (generation !== sharedGeneration) return;
      if (data) setRoomSnapshot(data);
      updateSharedStatus(
        sharedMoves.size ? "내 이동 반영 중…" : "실시간 연결됨",
      );
      scheduleRoomSync();
    } catch (error) {
      if (generation !== sharedGeneration) return;
      updateSharedStatus("연결이 끊겼어요 · 다시 연결 중", true);
      scheduleRoomSync(2500);
    }
  }, delay);
}
function activateClassroom(data, token) {
  leaveSharedView();
  sharedRoom = { ...data, records: data.records.map(normalize), token };
  sharedView = "room";
  rememberClassroom(data, token);
  try {
    sessionStorage.setItem(
      CLASSROOM_CURRENT_KEY,
      JSON.stringify({ id: data.id, role: data.role }),
    );
  } catch {}
  landing = false;
  returnStep = state.story
    ? FLOW.CARD
    : state.name
      ? FLOW.LOOK
      : state.poseConfirmed
        ? FLOW.IDENTITY
        : state.status
          ? FLOW.POSE
          : FLOW.STATUS;
  step = FLOW.BOARD;
  history.replaceState({}, "", roomHash());
  render();
  scheduleRoomSync();
}

// Keep the class association when a student reloads while making a character.
function resumeClassroomContext() {
  let current;
  try {
    current = JSON.parse(sessionStorage.getItem(CLASSROOM_CURRENT_KEY));
  } catch {}
  const access =
    current &&
    storedClassrooms().find(
      (x) => x.id === current.id && x.role === current.role,
    );
  if (!access) return;
  if (access.role === "teacher" && !teacherEntryUnlocked) return;
  sharedRoom = {
    ...access,
    actorId: access.role === "teacher" ? "teacher" : access.token.split(".")[1],
    records: [],
    board: [],
    revision: 0,
    paused: false,
  };
  sharedView = "room";
  const generation = sharedGeneration;
  classroomRequest(null, `?room=${encodeURIComponent(access.id)}`, access.token)
    .then((data) => {
      if (generation !== sharedGeneration) return;
      setRoomSnapshot(data, true);
      scheduleRoomSync();
    })
    .catch(() => {
      if (generation === sharedGeneration) scheduleRoomSync(2000);
    });
}
async function enterClassroom(id, token, role, invite) {
  if (
    role === "teacher" &&
    !requireTeacherEntry(`#teacher/${id}${token ? "/" + token : ""}`)
  )
    return;
  leaveSharedView();
  sharedView = "loading";
  landing = false;
  step = FLOW.BOARD;
  render();
  const generation = sharedGeneration;
  try {
    const cached = storedClassrooms().find(
      (x) => x.id === id && x.role === role,
    );
    token = token || cached?.token;
    let data;
    if (token) {
      try {
        data = await classroomRequest(
          null,
          `?room=${encodeURIComponent(id)}`,
          token,
        );
      } catch (error) {
        if (!invite || error.status !== 403) throw error;
        token = "";
      }
    }
    if (!token && invite) {
      data = await classroomRequest(
        { action: "join", room: id, invite },
        "",
        "",
      );
      token = data.token;
    }
    if (!data) throw Error("처음 받은 참여 링크로 들어와 주세요.");
    if (generation !== sharedGeneration) return;
    activateClassroom(data, token);
  } catch (error) {
    if (generation !== sharedGeneration) return;
    sharedView = "error";
    sharedError = error.message;
    render();
  }
}
function restoreSharedRoute() {
  const parts = location.hash.slice(1).split("/");
  if (parts[0] === "teacher" && !parts[1]) {
    showTeacherHome(false);
    return true;
  }
  if (["teacher", "classroom", "join"].includes(parts[0]) && parts[1]) {
    const role = parts[0] === "teacher" ? "teacher" : "student";
    void enterClassroom(
      parts[1],
      parts[0] === "teacher" ? parts[2] : null,
      role,
      parts[0] === "join" ? parts[2] : null,
    );
    return true;
  }
  return false;
}
async function createClassroom(form) {
  if (!requireTeacherEntry()) return;
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    const data = await classroomRequest(
      { action: "create", title: form.elements.title.value },
      "",
      "",
    );
    activateClassroom(data, data.token);
  } catch (error) {
    toast(error.message);
    button.disabled = false;
  }
}
async function sharedOperation(action, values = {}) {
  if (!sharedRoom) return false;
  const generation = sharedGeneration,
    room = sharedRoom.id,
    token = sharedRoom.token;
  const op = { action, room, opId: uid(), ...values };
  try {
    const data = await classroomRequest(op, "", token);
    if (generation !== sharedGeneration) return false;
    setRoomSnapshot(data, true);
    return true;
  } catch (error) {
    if (generation === sharedGeneration) {
      toast(error.message);
      updateSharedStatus("변경을 반영하지 못했어요", true);
    }
    return false;
  }
}
async function sharedAddCharacter(record) {
  if (!record) return false;
  const added = await sharedOperation("add", { character: record });
  if (added) toast("우리 반 풍속화에 내 인물을 넣었어요.");
  return added;
}
function queueSharedMove(item, immediate = false) {
  if (!sharedRoom) return;
  let move = sharedMoves.get(item.id);
  if (!move) {
    move = { position: { x: item.x, y: item.y }, sending: false, timer: null };
    sharedMoves.set(item.id, move);
  }
  move.position = { x: item.x, y: item.y };
  if (!move.sending && (immediate || !move.timer)) {
    clearTimeout(move.timer);
    move.timer = setTimeout(() => sendSharedMove(item.id), immediate ? 0 : 400);
  }
  updateSharedStatus("내 이동 반영 중…");
}
async function sendSharedMove(id) {
  const move = sharedMoves.get(id);
  if (!move || move.sending || !sharedRoom) return;
  move.timer = null;
  move.sending = true;
  const position = { ...move.position },
    generation = sharedGeneration;
  const op = {
    action: "move",
    room: sharedRoom.id,
    id,
    ...position,
    opId: uid(),
  };
  try {
    const data = await classroomRequest(op);
    if (generation !== sharedGeneration) return;
    move.sending = false;
    if (move.position.x === position.x && move.position.y === position.y)
      sharedMoves.delete(id);
    setRoomSnapshot(data);
    if (sharedMoves.has(id))
      move.timer = setTimeout(() => sendSharedMove(id), 150);
  } catch (error) {
    if (generation !== sharedGeneration) return;
    move.sending = false;
    if ([400, 403, 404, 423].includes(error.status)) {
      sharedMoves.delete(id);
      sharedDragging = "";
      toast(error.message);
      renderBoard();
      scheduleRoomSync(0);
    } else {
      updateSharedStatus("연결이 끊겼어요 · 이동을 다시 반영 중", true);
      move.timer = setTimeout(() => sendSharedMove(id), 2000);
    }
  }
}
function selectBoardPerson(id) {
  selectedBoard = id;
  document.querySelectorAll("[data-person]").forEach((el) => {
    el.classList.toggle("selected", el.dataset.person === id);
    el.setAttribute("aria-pressed", String(el.dataset.person === id));
  });
  if (sharedRoom && $("#personInspector"))
    $("#personInspector").innerHTML = personInspectorHtml();
}
function sharedDragFinished() {
  document
    .querySelectorAll(".board-person.dragging")
    .forEach((el) => el.classList.remove("dragging"));
  sharedDragging = "";
  if (sharedRefreshNeeded) {
    sharedRefreshNeeded = false;
    renderBoard();
  } else if (sharedRoom && $("#personInspector"))
    $("#personInspector").innerHTML = personInspectorHtml();
}
async function copyClassroomLink(teacher = false) {
  if (!sharedRoom) return;
  const url =
    location.origin +
    location.pathname +
    (teacher
      ? `#teacher/${sharedRoom.id}/${sharedRoom.token}`
      : `#join/${sharedRoom.id}/${sharedRoom.inviteToken}`);
  try {
    await navigator.clipboard.writeText(url);
    toast(
      teacher
        ? "교사용 링크를 복사했어요."
        : "학생 참여 링크를 복사했어요. 학생들에게 공유해 주세요.",
    );
  } catch {
    openModal(
      teacher ? "교사용 링크" : "학생 참여 링크",
      `<label class="field">링크를 복사해 주세요<input readonly id="shareLink" value="${esc(url)}"></label>`,
    );
    $("#shareLink").select();
  }
}
