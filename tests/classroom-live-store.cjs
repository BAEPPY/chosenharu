// Run during Vercel builds against the connected private store. No credentials or links are printed.
const { blobStore } = require("../server/blob-store.cjs");
const { exercise } = require("./classroom-service.cjs");
(async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID)
    throw Error("Private classroom store is not connected");
  await exercise(blobStore("classrooms/verification"));
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
