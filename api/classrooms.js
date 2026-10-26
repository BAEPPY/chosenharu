const { createService } = require("../server/classroom-service.cjs");
const { blobStore } = require("../server/blob-store.cjs");
const { handler } = require("../server/classroom-handler.cjs");
module.exports = handler(createService(blobStore()));
