#!/usr/bin/env node
/**
 * verify_audio.js — Verify the cam13/cam14 audio is what we think.
 *
 * Strategy: cheapest first.
 *   1. ffprobe ID3 tags — if album says "Cambridge IELTS N", we're done.
 *   2. Fallback: trim first 30s with ffmpeg + Whisper transcribe → check intro
 *      ("Cambridge IELTS N" is always spoken at the start of every test).
 *
 * Budget: <$0.05 (Whisper @ $0.006/min × ≤2 calls × 0.5min ≈ $0.006).
 */

"use strict";

require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });

const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawnSync } = require("child_process");

const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");
const SOURCE = path.join(REPO_ROOT, "listening_source");
const REPORT_PATH = path.join(__dirname, "_audio_verify_report.md");

// ---------------------------------------------------------------------------
// Probe ID3 tags
// ---------------------------------------------------------------------------

function probeTags(file) {
  const r = spawnSync("ffprobe", ["-v", "quiet", "-show_format", "-show_streams", file], { encoding: "utf8" });
  const out = r.stdout || "";
  const tags = {};
  for (const line of out.split(/\r?\n/)) {
    const m = line.match(/^TAG:(\w+)=(.*)$/);
    if (m) tags[m[1].toLowerCase()] = m[2];
  }
  const dur = (out.match(/^duration=([\d.]+)/m) || [])[1];
  const br = (out.match(/^bit_rate=(\d+)/m) || [])[1];
  return { tags, durationSec: dur ? parseFloat(dur) : null, bitrate: br ? parseInt(br, 10) : null };
}

// Parse "Cambridge IELTS NN" out of any tag value.
function extractBookFromTags(tags) {
  for (const v of Object.values(tags)) {
    const m = String(v).match(/cambridge\s*ielts\s*(\d{1,2})/i);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Whisper fallback
// ---------------------------------------------------------------------------

async function transcribeFirst30Seconds(srcMp3) {
  const tmpFile = path.join(os.tmpdir(), `verify_${Date.now()}.mp3`);
  // -t 30 = 30 seconds; -ac 1 -ar 16000 = mono 16kHz to keep upload tiny
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-i", srcMp3, "-t", "30", "-ac", "1", "-ar", "16000", "-codec:a", "libmp3lame", "-b:a", "32k", tmpFile],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    throw new Error(`ffmpeg trim failed: ${r.stderr?.slice(0, 500)}`);
  }
  const buf = fs.readFileSync(tmpFile);
  console.log(`  trimmed clip: ${buf.length} bytes`);
  const { transcribeAudio } = require("../../src/providers/ai/openaiWhisper");
  const result = await transcribeAudio(buf, "en");
  fs.unlinkSync(tmpFile);
  return result.transcript;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function verify(targetBook, file) {
  const label = `cam${String(targetBook).padStart(2, "0")}/${path.basename(file)}`;
  console.log(`\n=== Verifying ${label} (claimed Cambridge IELTS ${targetBook}) ===`);

  const probe = probeTags(file);
  console.log("  duration:", probe.durationSec, "sec");
  console.log("  bitrate: ", probe.bitrate);
  console.log("  tags:    ", JSON.stringify(probe.tags));

  const bookFromTags = extractBookFromTags(probe.tags);
  if (bookFromTags !== null) {
    const ok = bookFromTags === targetBook;
    return {
      label,
      targetBook,
      method: "id3",
      bookDetected: bookFromTags,
      verdict: ok ? "VERIFIED" : "MISMATCH",
      evidence: `ID3 tag indicates "Cambridge IELTS ${bookFromTags}"`,
      transcript: null,
      probe,
    };
  }

  console.log("  (no book in ID3 tags — falling back to Whisper)");
  let transcript = "";
  try {
    transcript = await transcribeFirst30Seconds(file);
  } catch (err) {
    return {
      label, targetBook, method: "whisper-failed",
      bookDetected: null, verdict: "INCONCLUSIVE",
      evidence: `Whisper transcription failed: ${err.message}`,
      transcript: null, probe,
    };
  }
  console.log("  transcript:", JSON.stringify(transcript.slice(0, 220)));
  // Match either "Cambridge IELTS NN" or just "IELTS NN" (Whisper sometimes
  // splits the spoken intro across pauses and we only get "IELTS 14" in the
  // first 30s before the "Cambridge University Press" attribution arrives).
  const m =
    transcript.match(/cambridge\s*(?:ielts\s*)?(\d{1,2})/i) ||
    transcript.match(/\bielts\s*(\d{1,2})\b/i);
  if (!m) {
    return {
      label, targetBook, method: "whisper",
      bookDetected: null, verdict: "INCONCLUSIVE",
      evidence: "Whisper returned a transcript but no 'Cambridge IELTS N' phrase found in first 30s.",
      transcript, probe,
    };
  }
  const bookFromVoice = parseInt(m[1], 10);
  return {
    label, targetBook, method: "whisper",
    bookDetected: bookFromVoice,
    verdict: bookFromVoice === targetBook ? "VERIFIED" : "MISMATCH",
    evidence: `Spoken intro says "Cambridge IELTS ${bookFromVoice}" (matched in transcript)`,
    transcript, probe,
  };
}

(async () => {
  const cam13File = path.join(SOURCE, "cam13", "audio", "test1_part1.mp3");
  const cam14File = path.join(SOURCE, "cam14", "audio", "test1_part1.mp3");

  if (!fs.existsSync(cam13File)) throw new Error(`missing ${cam13File}`);
  if (!fs.existsSync(cam14File)) throw new Error(`missing ${cam14File}`);

  const r13 = await verify(13, cam13File);
  const r14 = await verify(14, cam14File);

  // ---- Report ----
  const lines = [];
  lines.push("# Listening Audio Verification Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  for (const r of [r13, r14]) {
    const icon = r.verdict === "VERIFIED" ? "✅" : r.verdict === "MISMATCH" ? "❌" : "⚠️";
    lines.push(`- ${icon} **${r.label}** — ${r.verdict} (claimed cam${r.targetBook}, detected cam${r.bookDetected ?? "?"}). ${r.evidence}`);
  }
  lines.push("");
  for (const r of [r13, r14]) {
    lines.push(`## ${r.label}`);
    lines.push("");
    lines.push(`- **Verdict:** ${r.verdict}`);
    lines.push(`- **Method:** ${r.method}`);
    lines.push(`- **Claimed book:** Cambridge IELTS ${r.targetBook}`);
    lines.push(`- **Detected book:** ${r.bookDetected ?? "(unknown)"}`);
    lines.push(`- **Evidence:** ${r.evidence}`);
    lines.push(`- **Duration:** ${r.probe.durationSec} sec`);
    lines.push(`- **Bitrate:** ${r.probe.bitrate}`);
    lines.push(`- **ID3 tags:** \`${JSON.stringify(r.probe.tags)}\``);
    if (r.transcript) {
      lines.push("- **Transcribed first 30s:**");
      lines.push("");
      lines.push("  > " + r.transcript.replace(/\n+/g, " "));
    }
    lines.push("");
  }
  if (r13.verdict === "MISMATCH" || r14.verdict === "MISMATCH") {
    lines.push("## Recommendations");
    lines.push("");
    if (r13.verdict === "MISMATCH") {
      lines.push(`- **cam13:** Detected as Cambridge IELTS ${r13.bookDetected}. The auto-remap (CAM12 zip's "Test 5-8" → cam13/test1-4) was based on file naming alone; ID3 confirms these files are actually Cambridge IELTS ${r13.bookDetected} content. Action: \`rm -rf listening_source/cam13/audio\` and treat Cam 13 audio as missing. Re-source from a clean Cam 13 audio pack.`);
      lines.push(`  - Bonus: those same files may be the *real* cam12 audio (we currently have no cam12 audio). If \`Cambridge IELTS 12\` matches our missing cam12 slot, copy them into cam12/audio under the canonical names instead of deleting.`);
    }
    if (r14.verdict === "MISMATCH") {
      lines.push(`- **cam14:** Detected as Cambridge IELTS ${r14.bookDetected}. Re-classify accordingly.`);
    }
    lines.push("");
  }

  fs.writeFileSync(REPORT_PATH, lines.join("\n"));

  console.log("\n" + "=".repeat(60));
  console.log(`cam13 verdict: ${r13.verdict} (detected book ${r13.bookDetected ?? "?"})`);
  console.log(`cam14 verdict: ${r14.verdict} (detected book ${r14.bookDetected ?? "?"})`);
  console.log(`report: ${REPORT_PATH}`);
})().catch((err) => {
  console.error("FATAL:", err.message);
  console.error(err.stack);
  process.exit(1);
});
