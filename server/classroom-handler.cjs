const { RoomError } = require("./classroom-service.cjs");
function handler(service) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    const respond = (status, data) => {
      res.statusCode = status;
      res.end(data ? JSON.stringify(data) : "");
    };
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "GET" && url.searchParams.has("health"))
        return respond(200, { ok: true, sharedClassrooms: true });
      const token = (req.headers.authorization || "").replace(/^Bearer /, "");
      if (req.method === "GET") {
        const result = await service.read(url.searchParams.get("room"), token);
        if (url.searchParams.get("since") === String(result.revision))
          return respond(204);
        return respond(200, result);
      }
      if (req.method !== "POST") {
        res.setHeader("Allow", "GET, POST");
        return respond(405, { error: "지원하지 않는 요청이에요." });
      }
      const origin = req.headers.origin;
      if (origin && new URL(origin).host !== req.headers.host)
        throw new RoomError(403, "이 사이트에서만 교실을 편집할 수 있어요.");
      let body = req.body;
      if (body === undefined) {
        let raw = "";
        for await (const chunk of req) {
          raw += chunk;
          if (Buffer.byteLength(raw) > 16384)
            throw new RoomError(413, "요청 내용이 너무 커요.");
        }
        body = JSON.parse(raw || "{}");
      } else if (typeof body === "string") body = JSON.parse(body);
      if (
        !body ||
        Array.isArray(body) ||
        Buffer.byteLength(JSON.stringify(body)) > 16384
      )
        throw new RoomError(400, "요청 내용을 확인해 주세요.");
      let result;
      if (body.action === "create") result = await service.create(body.title);
      else if (body.action === "join")
        result = await service.join(body.room, body.invite);
      else result = await service.change(body.room, token, body);
      respond(200, result);
    } catch (error) {
      const status =
        error instanceof RoomError
          ? error.status
          : error instanceof SyntaxError
            ? 400
            : 503;
      if (status === 503)
        console.error("Classroom storage request failed:", error.name);
      respond(status, {
        error:
          status === 503
            ? "교실 연결이 잠시 끊겼어요. 다시 연결하고 있어요."
            : error.message,
      });
    }
  };
}
module.exports = { handler };
