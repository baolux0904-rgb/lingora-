/**
 * azureSpeech.js
 *
 * Real Azure Cognitive Services pronunciation assessment provider.
 * Uses the Speech REST API directly — no SDK dependency required.
 * Node 18+ native fetch is used; no extra packages needed.
 *
 * Required env vars:
 *   AZURE_SPEECH_KEY    — Azure subscription key
 *   AZURE_SPEECH_REGION — Azure region (e.g. "eastus", "southeastasia")
 *
 * Interface (matches mockSpeech.js exactly):
 *   assessPronunciation(audioUrl, referenceText, language?) → PronunciationResult
 *
 * Audio format: defaults to audio/webm;codecs=opus (Chrome MediaRecorder default).
 * When Cloudflare R2 is wired in, ensure audio is stored as audio/wav for best results.
 */

const KEY    = process.env.AZURE_SPEECH_KEY;
const REGION = process.env.AZURE_SPEECH_REGION;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect MIME type from the audio URL.
 * Defaults to WebM (Chrome MediaRecorder default) if not detectable.
 */
function detectMimeType(audioUrl) {
  if (audioUrl.includes('.wav'))  return 'audio/wav';
  if (audioUrl.includes('.mp3'))  return 'audio/mpeg';
  if (audioUrl.includes('.ogg'))  return 'audio/ogg;codecs=opus';
  if (audioUrl.includes('.webm')) return 'audio/webm;codecs=opus';
  return 'audio/webm;codecs=opus'; // Chrome MediaRecorder default
}

/**
 * Fetch raw audio bytes from a URL.
 * Works for both mock storage (localhost) and future R2 (https).
 */
async function fetchAudioBuffer(audioUrl) {
  const res = await fetch(audioUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch audio from ${audioUrl}: ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Map Azure REST API response to our PronunciationResult shape.
 * Returns safe defaults for any missing fields.
 */
function mapResult(data) {
  const nbest = data?.NBest?.[0];
  if (!nbest) {
    return {
      overallScore:       0,
      accuracyScore:      0,
      fluencyScore:       0,
      completenessScore:  0,
      pronunciationScore: 0,
      words:              [],
    };
  }

  const pa    = nbest.PronunciationAssessment || {};
  const words = (nbest.Words || []).map((w) => ({
    word:  w.Word || '',
    score: Math.round(w.PronunciationAssessment?.AccuracyScore ?? 0),
    phonemes: (w.Phonemes || []).map((p) => ({
      phoneme:  p.Phoneme || '',
      score:    Math.round(p.PronunciationAssessment?.AccuracyScore ?? 0),
      offset:   p.Offset   ?? 0,
      duration: p.Duration ?? 0,
    })),
  }));

  const pronScore = Math.round(pa.PronScore ?? pa.AccuracyScore ?? 0);

  return {
    overallScore:       pronScore,
    accuracyScore:      Math.round(pa.AccuracyScore      ?? 0),
    fluencyScore:       Math.round(pa.FluencyScore       ?? 0),
    completenessScore:  Math.round(pa.CompletenessScore  ?? 0),
    pronunciationScore: pronScore,
    words,
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * assessPronunciation
 *
 * Downloads audio from audioUrl, sends it to Azure Speech REST API with
 * pronunciation assessment config, and returns detailed phoneme-level scores.
 *
 * @param {string} audioUrl       – URL to audio file (mock or R2)
 * @param {string} referenceText  – expected utterance
 * @param {string} [language]     – BCP-47 code, default "en-US"
 * @returns {Promise<import('./speechProvider').PronunciationResult>}
 */
async function assessPronunciation(audioUrl, referenceText, language = 'en-US') {
  if (!KEY || !REGION) {
    throw new Error(
      'Azure Speech provider requires AZURE_SPEECH_KEY and AZURE_SPEECH_REGION env vars. ' +
      'Set SPEECH_PROVIDER=mock to use the mock provider instead.'
    );
  }

  // Fetch audio buffer
  const audioBuffer = await fetchAudioBuffer(audioUrl);
  const mimeType    = detectMimeType(audioUrl);

  // Build Pronunciation-Assessment header (base64-encoded JSON)
  const assessConfig = Buffer.from(JSON.stringify({
    ReferenceText:  referenceText,
    GradingSystem:  'HundredMark',
    Granularity:    'Phoneme',
    EnableMiscue:   true,
  })).toString('base64');

  // Azure Speech REST endpoint
  const endpoint =
    `https://${REGION}.stt.speech.microsoft.com` +
    `/speech/recognition/conversation/cognitiveservices/v1` +
    `?language=${encodeURIComponent(language)}&format=detailed&profanity=raw`;

  const res = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': KEY,
      'Content-Type':              mimeType,
      'Pronunciation-Assessment':  assessConfig,
      'Accept':                    'application/json',
    },
    body: audioBuffer,
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Azure Speech API error ${res.status}: ${errText}`);
  }

  const data = await res.json();

  if (data.RecognitionStatus && data.RecognitionStatus !== 'Success') {
    throw new Error(`Azure recognition failed: ${data.RecognitionStatus}`);
  }

  return mapResult(data);
}

module.exports = { assessPronunciation };
