# Listening Audio Verification Report

Generated: 2026-04-25T19:54:53.500Z

## Summary

- ❌ **cam13/test1_part1.mp3** — MISMATCH (claimed cam13, detected cam12). ID3 tag indicates "Cambridge IELTS 12"
- ✅ **cam14/test1_part1.mp3** — VERIFIED (claimed cam14, detected cam14). Spoken intro says "Cambridge IELTS 14" (matched in transcript)

## cam13/test1_part1.mp3

- **Verdict:** MISMATCH
- **Method:** id3
- **Claimed book:** Cambridge IELTS 13
- **Detected book:** 12
- **Evidence:** ID3 tag indicates "Cambridge IELTS 12"
- **Duration:** 500.440816 sec
- **Bitrate:** 192000
- **ID3 tags:** `{"encoded_by":"Pro Tools","originator_reference":"riginator_refere","album":"Cambridge IELTS 12","time_reference":"i","encoder":"Lavf57.41.100","date":"2016"}`

## cam14/test1_part1.mp3

- **Verdict:** VERIFIED
- **Method:** whisper
- **Claimed book:** Cambridge IELTS 14
- **Detected book:** 14
- **Evidence:** Spoken intro says "Cambridge IELTS 14" (matched in transcript)
- **Duration:** 523.199002 sec
- **Bitrate:** 64002
- **ID3 tags:** `{"language":"und","handler_name":"SoundHandler","vendor_id":"[0][0][0][0]","major_brand":"M4A ","minor_version":"1","compatible_brands":"isomiso2M4A mp42","encoder":"Lavf57.41.100"}`
- **Transcribed first 30s:**

  > IELTS 14, Tests 1 to 4 Published by Cambridge University Press and Uccles 2019. This recording is copyright. Test 1. You will hear a number of different recordings and you will have to answer questions on what you hear. There will be time for you to...

## Recommendations

- **cam13:** Detected as Cambridge IELTS 12. The auto-remap (CAM12 zip's "Test 5-8" → cam13/test1-4) was based on file naming alone; ID3 confirms these files are actually Cambridge IELTS 12 content. Action: `rm -rf listening_source/cam13/audio` and treat Cam 13 audio as missing. Re-source from a clean Cam 13 audio pack.
  - Bonus: those same files may be the *real* cam12 audio (we currently have no cam12 audio). If `Cambridge IELTS 12` matches our missing cam12 slot, copy them into cam12/audio under the canonical names instead of deleting.
