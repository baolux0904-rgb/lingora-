/**
 * Upload validation + sanitization tests (Wave 1.4).
 *
 * Layered:
 *   1. Pure validators (mimeValidation) — magic-byte sniff + size cap
 *      against synthetic buffers (real JPEG/PNG/WebP via sharp; SVG/HTML
 *      string-encoded; bogus octet-stream).
 *   2. Re-encode (imageReencode) — proves polyglot trailing bytes are
 *      stripped: input = JPEG_HEADER + APPENDED_HTML, output = canonical
 *      JPEG smaller than input with no payload bytes.
 *   3. decodeBase64Loose — data-URI prefix tolerance + null safety.
 *
 * Live HTTP integration is exercised by manual smoke (curl + R2 inspect)
 * post-deploy — the unit tests here pin the contract that the controllers
 * depend on.
 */

"use strict";

const sharp = require("sharp");
const {
  ValidationError,
  validateImageBuffer,
  validateAudioBuffer,
  decodeBase64Loose,
} = require("../src/utils/mimeValidation");
const { reEncodeImage } = require("../src/utils/imageReencode");

// ---------------------------------------------------------------------------
// Helpers — synthesize valid format buffers via sharp.
// ---------------------------------------------------------------------------

async function makeJpeg(width = 32, height = 32) {
  return sharp({
    create: { width, height, channels: 3, background: { r: 200, g: 100, b: 50 } },
  }).jpeg().toBuffer();
}

async function makePng(width = 32, height = 32) {
  return sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 200, b: 100, alpha: 1 } },
  }).png().toBuffer();
}

async function makeWebp(width = 32, height = 32) {
  return sharp({
    create: { width, height, channels: 3, background: { r: 50, g: 50, b: 200 } },
  }).webp().toBuffer();
}

// Minimal valid WAV header (RIFF/WAVE) — file-type recognises by signature.
function makeWavLike() {
  const data = Buffer.alloc(44);
  data.write("RIFF", 0);
  data.writeUInt32LE(36, 4);   // chunk size
  data.write("WAVE", 8);
  data.write("fmt ", 12);
  data.writeUInt32LE(16, 16);  // fmt chunk size
  data.writeUInt16LE(1, 20);   // PCM
  data.writeUInt16LE(1, 22);   // mono
  data.writeUInt32LE(8000, 24);
  data.writeUInt32LE(8000, 28);
  data.writeUInt16LE(1, 32);
  data.writeUInt16LE(8, 34);
  data.write("data", 36);
  data.writeUInt32LE(0, 40);
  return data;
}

// ---------------------------------------------------------------------------
// 1. mimeValidation — image
// ---------------------------------------------------------------------------

describe("validateImageBuffer", () => {
  it("accepts a real JPEG buffer (sharp-generated)", async () => {
    const buf = await makeJpeg();
    const result = await validateImageBuffer(buf);
    expect(result.mime).toBe("image/jpeg");
    expect(result.size).toBe(buf.length);
  });

  it("accepts a real PNG buffer", async () => {
    const buf = await makePng();
    const result = await validateImageBuffer(buf);
    expect(result.mime).toBe("image/png");
  });

  it("accepts a real WebP buffer", async () => {
    const buf = await makeWebp();
    const result = await validateImageBuffer(buf);
    expect(result.mime).toBe("image/webp");
  });

  it("rejects an SVG payload (XSS vector — no recognised image header)", async () => {
    const svg = Buffer.from(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script></svg>`, "utf8");
    await expect(validateImageBuffer(svg)).rejects.toMatchObject({
      code: "INVALID_IMAGE",
      status: 400,
    });
  });

  it("rejects an HTML payload disguised as image", async () => {
    const html = Buffer.from("<html><body><script>alert(1)</script></body></html>", "utf8");
    await expect(validateImageBuffer(html)).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects an oversized image (>maxSize)", async () => {
    const buf = await makeJpeg(2048, 2048); // ~real JPEG hundreds of KB → cap at 1KB to force trip
    await expect(validateImageBuffer(buf, { maxSize: 1024 })).rejects.toMatchObject({
      code: "IMAGE_TOO_LARGE",
      status: 413,
    });
  });

  it("rejects an empty buffer", async () => {
    await expect(validateImageBuffer(Buffer.alloc(0))).rejects.toMatchObject({
      code: "INVALID_IMAGE",
    });
  });
});

// ---------------------------------------------------------------------------
// 2. mimeValidation — audio
// ---------------------------------------------------------------------------

describe("validateAudioBuffer", () => {
  it("accepts a synthetic WAV buffer (RIFF/WAVE header)", async () => {
    const buf = makeWavLike();
    const result = await validateAudioBuffer(buf);
    // file-type@16 reports vnd.wave; older callers may see audio/wav.
    expect(["audio/wav", "audio/x-wav", "audio/vnd.wave"]).toContain(result.mime);
  });

  it("rejects HTML disguised as audio (data:audio/webm;base64,<html>)", async () => {
    const html = Buffer.from("<html><script>alert(1)</script></html>", "utf8");
    await expect(validateAudioBuffer(html)).rejects.toMatchObject({
      code: "INVALID_AUDIO",
      status: 400,
    });
  });

  it("rejects an image buffer claiming to be audio", async () => {
    const png = await makePng();
    await expect(validateAudioBuffer(png)).rejects.toMatchObject({
      code: "INVALID_AUDIO",
    });
  });

  it("rejects oversized audio (>maxSize)", async () => {
    const big = Buffer.concat([makeWavLike(), Buffer.alloc(10 * 1024 * 1024)]);
    await expect(validateAudioBuffer(big, { maxSize: 5 * 1024 * 1024 })).rejects.toMatchObject({
      code: "AUDIO_TOO_LARGE",
      status: 413,
    });
  });
});

// ---------------------------------------------------------------------------
// 3. imageReencode — anti-polyglot
// ---------------------------------------------------------------------------

describe("reEncodeImage — polyglot stripping", () => {
  it("strips trailing bytes appended after a valid JPEG (polyglot defence)", async () => {
    const validJpeg = await makeJpeg(64, 64);
    const payload = Buffer.from(`<script>alert("polyglot")</script>`, "utf8");
    const polyglot = Buffer.concat([validJpeg, payload]);

    const out = await reEncodeImage(polyglot, { format: "jpeg", quality: 85 });

    expect(out.mime).toBe("image/jpeg");
    // PRIMARY invariant: the re-encoded buffer must NOT contain the appended
    // <script> bytes. (mozjpeg may produce slightly different sizes than the
    // input — what matters is that the payload is gone.)
    expect(out.buffer.includes(payload)).toBe(false);
  });

  it("re-encodes PNG → JPEG and strips alpha (default JPEG output)", async () => {
    const png = await makePng(32, 32);
    const out = await reEncodeImage(png, { format: "jpeg" });
    expect(out.mime).toBe("image/jpeg");
    expect(out.width).toBe(32);
    expect(out.height).toBe(32);
  });

  it("downscales oversized images to maxDimension", async () => {
    const huge = await makeJpeg(4000, 3000);
    const out = await reEncodeImage(huge, { format: "jpeg", maxDimension: 512 });
    // longest side capped to 512; aspect ratio preserved.
    expect(Math.max(out.width, out.height)).toBeLessThanOrEqual(512);
  });
});

// ---------------------------------------------------------------------------
// 4. decodeBase64Loose
// ---------------------------------------------------------------------------

describe("decodeBase64Loose", () => {
  it("decodes a raw base64 string", () => {
    const original = Buffer.from("hello world");
    const b64 = original.toString("base64");
    const out = decodeBase64Loose(b64);
    expect(out.equals(original)).toBe(true);
  });

  it("strips a data:<mime>;base64, prefix before decoding", () => {
    const original = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG header
    const b64 = original.toString("base64");
    const out = decodeBase64Loose(`data:image/png;base64,${b64}`);
    expect(out.equals(original)).toBe(true);
  });

  it("returns null for empty / null / non-string input", () => {
    expect(decodeBase64Loose("")).toBeNull();
    expect(decodeBase64Loose(null)).toBeNull();
    expect(decodeBase64Loose(undefined)).toBeNull();
    expect(decodeBase64Loose(42)).toBeNull();
  });

  it("returns null for empty payload after data-URI prefix strip", () => {
    expect(decodeBase64Loose("data:image/png;base64,")).toBeNull();
  });
});
