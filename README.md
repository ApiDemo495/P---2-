# VoiceSadhana

A self-contained, browser-based Hindi articulation and voice practice studio. It uses vanilla JavaScript ES modules, Canvas, the Web Audio API, and local storage; no runtime packages or backend are required.

## GitHub Codespaces

Open the repository in a Codespace. The checked-in `.devcontainer` configuration runs the test suite during setup, starts the Node static server on container start and attach, and forwards port **4173** to the browser preview. No `npm install` is needed. If you added this configuration to an already-created Codespace, run **Codespaces: Rebuild Container** once; lifecycle hooks take effect after the rebuild. To restart manually, use `npm run dev`.

## What’s included

- Hindi Devanagari phoneme reference data, matra/modifier decomposition, conjunct handling, and lightweight Hinglish transliteration.
- Deterministic, human-profile Canvas anatomy with articulator transitions, plus a polished SVG movement guide that loops smoothly every 30 seconds (no random motion or GIF dependency).
- Optional in-browser microphone meter for approximate pitch and spectral feedback. Audio is not recorded or uploaded.
- Guided breathing, yawn–sigh, humming, siren, straw-style, vowel, reading, and relaxation practices.
- Local practice history, daily articulation + voice goal, partial-day tracking, Monday-start month calendar, honest consecutive-goal streaks, rest tokens, XP, progression, settings, and JSON export.
- Onboarding, responsive navigation, dark theme, adjustable text, and reduced-motion support.

## Test

```bash
npm test
```

> VoiceSadhana is a general practice aid, not a diagnostic tool or substitute for individualized guidance from a licensed speech-language professional. Microphone-derived feedback is experimental and approximate.
