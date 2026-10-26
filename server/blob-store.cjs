const { get, put, del, BlobPreconditionFailedError } = require("@vercel/blob");
function blobStore(
  prefix = `classrooms/v1/${process.env.VERCEL_ENV === "preview" ? "preview" : "production"}`,
) {
  const path = (id) => `${prefix}/${id}.json`;
  return {
    async read(id) {
      const result = await get(path(id), {
        access: "private",
        useCache: false,
        abortSignal: AbortSignal.timeout(12000),
      });
      if (!result) return null;
      return {
        data: JSON.parse(await new Response(result.stream).text()),
        etag: result.blob.etag,
      };
    },
    async write(id, data, etag) {
      try {
        return await put(path(id), JSON.stringify(data), {
          access: "private",
          addRandomSuffix: false,
          allowOverwrite: !!etag,
          ...(etag ? { ifMatch: etag } : {}),
          contentType: "application/json",
          abortSignal: AbortSignal.timeout(12000),
        });
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError) error.conflict = true;
        throw error;
      }
    },
    async remove(id) {
      await del(path(id));
    },
  };
}
module.exports = { blobStore };
