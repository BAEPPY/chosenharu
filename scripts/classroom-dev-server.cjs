const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash, randomUUID } = require("node:crypto");
const { createService } = require("../server/classroom-service.cjs");
const { handler } = require("../server/classroom-handler.cjs");
// Development-only durable adapter; production always uses private Blob storage.
function fileStore(dir) {
  const filename = (id) => path.join(dir, id + ".json");
  async function read(id) {
    try {
      const raw = await fs.readFile(filename(id), "utf8");
      return {
        data: JSON.parse(raw),
        etag: createHash("sha256").update(raw).digest("hex"),
      };
    } catch (e) {
      if (e.code === "ENOENT") return null;
      throw e;
    }
  }
  return {
    read,
    async write(id, data, etag) {
      await fs.mkdir(dir, { recursive: true });
      const lock = filename(id) + ".lock";
      let handle;
      for (let i = 0; i < 100; i++) {
        try {
          handle = await fs.open(lock, "wx");
          break;
        } catch (e) {
          if (e.code !== "EEXIST") throw e;
          await new Promise((r) => setTimeout(r, 5));
        }
      }
      if (!handle) throw Error("File lock timeout");
      try {
        const current = await read(id);
        if ((current?.etag || null) !== etag)
          throw Object.assign(Error("Conflict"), { conflict: true });
        const temp = filename(id) + "." + randomUUID() + ".tmp";
        await fs.writeFile(temp, JSON.stringify(data));
        await fs.rename(temp, filename(id));
      } finally {
        await handle.close();
        await fs.unlink(lock);
      }
    },
    async remove(id) {
      await fs.rm(filename(id), { force: true });
    },
  };
}
function server(options = {}) {
  const root = path.resolve(__dirname, "..");
  const store =
    options.store || fileStore(options.dir || "/tmp/joseon-classroom-dev");
  const api = handler(createService(store));
  return http.createServer(async (req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/api/classrooms") return api(req, res);
    try {
      const file = path.resolve(
        root,
        "." + decodeURIComponent(pathname === "/" ? "/index.html" : pathname),
      );
      if (
        !file.startsWith(root + path.sep) ||
        /^\/(?:\.git|\.env|node_modules|server)\b/.test(pathname)
      ) {
        res.writeHead(404);
        res.end();
        return;
      }
      const data = await fs.readFile(file);
      res.setHeader(
        "Content-Type",
        {
          ".html": "text/html",
          ".js": "application/javascript",
          ".css": "text/css",
          ".json": "application/json",
          ".webp": "image/webp",
          ".png": "image/png",
          ".svg": "image/svg+xml",
          ".woff2": "font/woff2",
        }[path.extname(file)] || "application/octet-stream",
      );
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
}
module.exports = { fileStore, server };
if (require.main === module) {
  const port = Number(process.env.PORT || 4190);
  server().listen(port, "127.0.0.1", () =>
    console.log("Classroom development server: http://127.0.0.1:" + port),
  );
}
