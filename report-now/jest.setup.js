const path = require("path");
const dotenv = require("dotenv");
const { Blob } = require("buffer");
const { TextEncoder, TextDecoder } = require("util");

dotenv.config({
  path: path.resolve(__dirname, ".env.test"),
  quiet: true,
});

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
  global.TextDecoder = TextDecoder;
}

if (typeof global.File === "undefined") {
  class PolyfillFile extends Blob {
    constructor(chunks, name, options = {}) {
      super(chunks, options);
      this.name = name;
      this.lastModified = options.lastModified || Date.now();
      this.type = options.type || "";
    }
  }
  global.File = PolyfillFile;
}

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
});
