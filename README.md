# VoiceSadhana

A self-contained, browser-based Hindi articulation and voice practice studio. It uses vanilla JavaScript ES modules, Canvas, the Web Audio API, and local storage; no runtime packages or backend are required.

## GitHub Codespaces

Open the repository in a Codespace. The checked-in `.devcontainer` configuration runs the test suite during setup, starts the static app when the container starts, and forwards port **4173** with the browser preview opened automatically. No `npm install` step is needed. To restart it manually, use `npm run dev`.

## What’s included

- Hindi Devanagari phoneme reference data, matra/modifier decomposition, conjunct handling, and lightweight Hinglish transliteration.
- Animated Canvas sagittal mouth illustration, playback controls, slow/natural timing, mirror view, airflow and aspirated release cues.
- Optional in-browser microphone meter for approximate pitch and spectral feedback. Audio is not recorded or uploaded.
- Guided breathing, yawn–sigh, humming, siren, straw-style, vowel, reading, and relaxation practices.
- Local practice history, daily articulation + voice goal with self-report, streak/calendar, rest tokens, XP, progression, settings, and JSON export.
- Onboarding, responsive navigation, dark theme, adjustable text, and reduced-motion support.

## Test

```bash
npm test
```

> VoiceSadhana is a general practice aid, not a diagnostic tool or substitute for individualized guidance from a licensed speech-language professional. Microphone-derived feedback is experimental and approximate.
