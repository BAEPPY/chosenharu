// Run during Vercel builds against the connected private store. No credentials or links are printed.
const { blobStore } = require("../server/blob-store.cjs");
const { exercise } = require("./classroom-service.cjs");
const { randomUUID } = require("node:crypto");
const assert = require("node:assert/strict");
(async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
    throw Error("Private classroom store is not connected");
  const store = blobStore("classrooms/verification"),
    probe = randomUUID();
  try {
    const created = await store.write(probe, { revision: 1 }, null);
    const read = await store.read(probe);
    console.log(
      "Blob ETag parity:",
      JSON.stringify({
        equal: created.etag === read.etag,
        uploadLength: created.etag?.length,
        readLength: read.etag?.length,
        readWeak: read.etag?.startsWith("W/"),
      }),
    );
    await store.write(probe, { revision: 2 }, read.etag);
    await assert.rejects(
      store.write(probe, { revision: 3 }, read.etag),
      (e) => e.conflict,
    );
    assert.equal((await store.read(probe)).data.revision, 2);
    console.log("PASS: actual conditional write and stale-write rejection.");
  } finally {
    await store.remove(probe);
  }
  const trace = [];
  const record = (entry) => {
    trace.push(entry);
    if (trace.length > 50) trace.shift();
  };
  try {
    await exercise({
      async read(id) {
        const value = await store.read(id);
        record({ read: value?.data.revision, etag: value?.etag });
        return value;
      },
      async write(id, data, etag) {
        try {
          const result = await store.write(id, data, etag);
          record({
            write: data.revision,
            count: data.items?.length,
            etag,
            result: result.etag,
          });
          return result;
        } catch (error) {
          record({
            conflict: !!error.conflict,
            revision: data.revision,
            count: data.items?.length,
            etag,
            error: error.name,
          });
          throw error;
        }
      },
      remove: store.remove,
    });
  } catch (error) {
    console.error("Storage verification trace:", JSON.stringify(trace));
    throw error;
  }
  console.log(
    "PASS: connected Blob store, 26 concurrent participants across independent service instances, atomic moves, permissions and cleanup.",
  );
})().catch((error) => {
  console.error(
    "Shared classroom storage verification failed:",
    error.name,
    error.status || "",
  );
  process.exitCode = 1;
});
