const {
  randomBytes,
  createHash,
  createHmac,
  timingSafeEqual,
} = require("node:crypto");
const wardrobe = require("../js/data/wardrobe-policy.js");
const secret = () => randomBytes(24).toString("base64url");
const hash = (value) => createHash("sha256").update(value).digest("hex");
const equal = (a, b) =>
  typeof a === "string" &&
  typeof b === "string" &&
  a.length === b.length &&
  timingSafeEqual(Buffer.from(a), Buffer.from(b));
class RoomError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new RoomError(status, message);
};
const text = (value, max) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const id = (value) =>
  typeof value === "string" && /^[a-zA-Z0-9_-]{8,100}$/.test(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value)));
const positions = [
  ...Array.from({ length: 5 }, (_, i) => ({ x: 350 + i * 130, y: 130 })),
  ...Array.from({ length: 6 }, (_, i) => ({ x: 250 + i * 130, y: 245 })),
  ...Array.from({ length: 7 }, (_, i) => ({ x: 50 + i * 130, y: 360 })),
  ...Array.from({ length: 8 }, (_, i) => ({ x: 10 + i * 125, y: 475 })),
];
function character(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    fail(400, "인물 내용을 확인해 주세요.");
  const result = {};
  for (const key of [
    "id",
    "status",
    "gender",
    "figure",
    "role",
    "outfit",
    "pose",
    "hair",
    "cloth",
    "emotion",
    "scene",
    "scenePose",
  ]) {
    const value = text(raw[key], 100);
    if (value && !/^[a-zA-Z0-9_-]+$/.test(value))
      fail(400, "인물 선택값이 올바르지 않아요.");
    result[key] = value;
  }
  for (const [key, max] of [
    ["name", 24],
    ["place", 60],
    ["story", 600],
    ["imagination", 600],
  ])
    result[key] = text(raw[key], max);
  if (
    !id(result.id) ||
    !["royal", "yangban", "technical", "common", "low"].includes(
      result.status,
    ) ||
    !result.name ||
    !result.story
  )
    fail(400, "이름과 신분, 하루 이야기를 먼저 완성해 주세요.");
  for (const key of ["top", "bottom", "layer", "hairColor"]) {
    if (!/^#[0-9a-f]{6}$/i.test(raw[key] || ""))
      fail(400, "인물 색상을 확인해 주세요.");
    result[key] = raw[key];
  }
  result.skin =
    Number.isInteger(raw.skin) && raw.skin >= 0 && raw.skin < 5 ? raw.skin : 2;
  result.poseConfirmed = true;
  result.outfitVersion = 1;
  if (
    !wardrobe.allows("outfit", result.outfit, result) ||
    !wardrobe.allows("hair", result.hair, result)
  )
    fail(
      400,
      "왕실 전용 의복과 관모는 신분과 역할에 맞는 인물만 착용할 수 있어요.",
    );
  return result;
}
function actor(room, token) {
  if (typeof token !== "string" || token.length > 200)
    fail(403, "교실 참여 링크로 다시 들어와 주세요.");
  if (token.startsWith("t.") && equal(hash(token), room.teacherHash))
    return { id: "teacher", role: "teacher" };
  const parts = token.split(".");
  if (parts.length === 3 && parts[0] === "s" && id(parts[1])) {
    const signature = createHmac("sha256", room.signingSecret)
      .update(parts[1])
      .digest("base64url");
    if (equal(signature, parts[2])) return { id: parts[1], role: "student" };
  }
  fail(403, "이 교실에 참여할 권한이 없어요. 참여 링크를 확인해 주세요.");
}
function snapshot(room, who) {
  return {
    id: room.id,
    title: room.title,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    revision: room.revision,
    paused: room.paused,
    role: who.role,
    actorId: who.id,
    inviteToken: who.role === "teacher" ? room.inviteToken : undefined,
    records: room.items.map((item) => {
      const c = wardrobe.repair(item.character);
      if (who.role !== "teacher" && item.ownerId !== who.id) {
        c.place = "";
        c.story = "";
        c.imagination = "";
      }
      return c;
    }),
    board: room.items.map(
      ({ character, ownerId, x, y, locked, updatedAt }) => ({
        id: character.id,
        ownerId,
        x,
        y,
        locked,
        updatedAt,
      }),
    ),
  };
}
function apply(room, who, op) {
  if (!op || !id(op.opId)) fail(400, "변경 요청을 확인해 주세요.");
  if (room.operations.some((x) => x === who.id + ":" + op.opId)) return false;
  const teacher = who.role === "teacher";
  if (!teacher && room.paused) fail(423, "선생님이 학생 이동을 잠시 잠갔어요.");
  const item = room.items.find((x) => x.character.id === op.id);
  const owns = item && (teacher || item.ownerId === who.id);
  if (["move", "remove", "lock"].includes(op.action) && !owns)
    fail(403, "자신이 만든 인물만 옮기거나 뺄 수 있어요.");
  switch (op.action) {
    case "add": {
      const c = character(op.character),
        existing = room.items.find((x) => x.character.id === c.id);
      if (existing) {
        if (!teacher && existing.ownerId !== who.id)
          fail(403, "다른 학생의 인물을 바꿀 수 없어요.");
        existing.character = c;
        existing.updatedAt = Date.now();
      } else {
        if (room.items.length >= 26)
          fail(409, "한 교실에는 인물을 26명까지 넣을 수 있어요.");
        room.items.push({
          character: c,
          ownerId: who.id,
          ...positions[room.items.length],
          locked: false,
          updatedAt: Date.now(),
        });
      }
      break;
    }
    case "move":
      if (item.locked) fail(423, "이 인물의 위치가 고정되어 있어요.");
      if (!Number.isFinite(op.x) || !Number.isFinite(op.y))
        fail(400, "인물 위치가 올바르지 않아요.");
      item.x = clamp(op.x, 0, 900);
      item.y = clamp(op.y, 45, 475);
      item.updatedAt = Date.now();
      break;
    case "remove":
      room.items = room.items.filter((x) => x !== item);
      break;
    case "lock":
      if (!teacher) fail(403, "위치 고정은 선생님만 바꿀 수 있어요.");
      item.locked = !!op.locked;
      break;
    case "arrange":
      if (!teacher) fail(403, "자리 정돈은 선생님만 할 수 있어요.");
      room.items.forEach((p, i) => {
        if (!p.locked) Object.assign(p, positions[i]);
      });
      break;
    case "pause":
      if (!teacher) fail(403, "수업 관리는 선생님만 할 수 있어요.");
      room.paused = !!op.paused;
      break;
    default:
      fail(400, "지원하지 않는 변경 요청이에요.");
  }
  room.operations.push(who.id + ":" + op.opId);
  room.operations = room.operations.slice(-256);
  room.revision++;
  room.updatedAt = Date.now();
  return true;
}
function createService(store) {
  const pending = new Map();
  async function load(roomId) {
    if (!id(roomId)) fail(404, "교실을 찾지 못했어요.");
    const found = await store.read(roomId);
    if (!found) fail(404, "교실을 찾지 못했어요. 참여 링크를 확인해 주세요.");
    return found;
  }
  async function batch(roomId, requests) {
    for (let attempt = 0; attempt < 14; attempt++) {
      const { data, etag } = await load(roomId),
        results = [];
      let changed = false;
      for (const request of requests) {
        try {
          const who = actor(data, request.token);
          changed = apply(data, who, request.op) || changed;
          results.push({ request, who });
        } catch (error) {
          results.push({ request, error });
        }
      }
      try {
        if (changed) await store.write(roomId, data, etag);
        for (const result of results)
          result.error
            ? result.request.reject(result.error)
            : result.request.resolve(snapshot(data, result.who));
        return;
      } catch (error) {
        if (!error.conflict) throw error;
        await new Promise((r) => setTimeout(r, 15 + Math.random() * 50));
      }
    }
    fail(409, "여러 변경을 반영 중이에요. 잠시 후 다시 시도해 주세요.");
  }
  async function drain(roomId, queue) {
    await new Promise((r) => setTimeout(r, 30));
    while (queue.length) {
      const requests = queue.splice(0);
      try {
        await batch(roomId, requests);
      } catch (error) {
        requests.forEach((r) => r.reject(error));
      }
    }
    pending.delete(roomId);
  }
  return {
    async create(title) {
      const roomId = secret(),
        teacherToken = "t." + secret();
      const room = {
        id: roomId,
        title: text(title, 40) || "우리 반 풍속화",
        teacherHash: hash(teacherToken),
        inviteToken: "j." + secret(),
        signingSecret: secret(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        revision: 1,
        paused: false,
        items: [],
        operations: [],
      };
      await store.write(roomId, room, null);
      return {
        ...snapshot(room, { role: "teacher", id: "teacher" }),
        token: teacherToken,
      };
    },
    async join(roomId, invite) {
      const { data } = await load(roomId);
      if (!equal(data.inviteToken, invite))
        fail(403, "학생 참여 링크가 올바르지 않아요.");
      const member = secret(),
        signature = createHmac("sha256", data.signingSecret)
          .update(member)
          .digest("base64url");
      return {
        ...snapshot(data, { id: member, role: "student" }),
        token: `s.${member}.${signature}`,
      };
    },
    async read(roomId, token) {
      const { data } = await load(roomId);
      return snapshot(data, actor(data, token));
    },
    change(roomId, token, op) {
      if (!id(roomId))
        return Promise.reject(new RoomError(404, "교실을 찾지 못했어요."));
      return new Promise((resolve, reject) => {
        let queue = pending.get(roomId);
        if (!queue) {
          queue = [];
          pending.set(roomId, queue);
          void drain(roomId, queue);
        }
        queue.push({ token, op, resolve, reject });
      });
    },
  };
}
module.exports = { createService, RoomError };
