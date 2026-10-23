# Reliability update 1.1

## Changes

- Upload every selected media file through Flow, including audio. Never create a fake remote ID after upload failure. Voice slots reject images and invalid legacy local IDs.
- Send a chosen voice reference to video generation or display the error. Do not silently retry without that voice or at a different resolution.
- Build prompts around the actual product name, supplied information and visual references. Keep brand names and quoted dialogue intact. AI script errors produce a clearly labelled neutral draft, with exactly five scenes required for successful AI output.
- Keep V2V as V2V. Image-based simulation is a separate explicit choice. Outfit-fitting failure stops the motion pipeline rather than substituting the original outfit.
- Prevent duplicate image/video requests for a scene, reject excessively long dialogue, bound waiting time, and prevent late scene responses from changing a newly imported project. Switching workspace tabs preserves running pipelines.
- Reject nonzero FFmpeg exit codes. Preserve the selected portrait/landscape ratio, reset input timestamps, report worker/download failures, bound worker execution, and release workers and Blob URLs. Missing-audio errors remain visible so users can explicitly choose a silent export.
- Validate project imports before applying state. Save review settings, inputs and scene assets to IndexedDB. Export/import these fields through versioned JSON, rebuild previews from media bytes, reset interrupted generation states, and avoid overwriting an unreadable autosave.
- Fix modal hook order and missing TypeScript exports/imports. Add a local SDK declaration, locked development dependencies, regression tests and CI checks.

## Validation and limits

`npm run typecheck` checks all source files against the local Flow SDK contract. Tests exercise upload failures, voice propagation through React, product prompts, V2V failure behavior, FFmpeg worker errors, timeout cleanup, modal lifecycle and project persistence/import/export. Flow calls, worker responses and IndexedDB are simulated in the tests.

Actual audio-upload support, generation options, output quality, quota use and real FFmpeg WASM execution still require verification inside the Google Flow host. A timeout ends the local wait; it does not cancel a Flow job because the available SDK contract exposes no cancellation operation. Check the Flow gallery before retrying a timed-out job.

The browser saves the review project, including media bytes. Its storage quota may be insufficient for large projects, and the UI reports save failure; JSON export remains the portable backup. The original Flow export and its hashes remain available at commit `4870e02`.
