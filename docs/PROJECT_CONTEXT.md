# manganarrator_frontend: project context

Source review: 2026-10-21. Baseline commit: `e46caeecb30d7ffc2484ff4c89f7b2dcd52c2f97`.
For later sessions, compare relevant paths against that commit; avoid re-auditing unrelated services.

## Purpose and boundaries

Next.js manga workbench. This is separate from the React/Vite Audio and Story Studio in manganarrator_video.

Uses @manganarrator/contracts. NEXT_PUBLIC_BACKEND_API, NEXT_PUBLIC_TTS_API and NEXT_PUBLIC_VIDEO_API select services. Preserve manga image/bbox editing; do not implement a second Story Studio here.

## Code map

app/(manga_narrator)/manga_narrator/page.tsx; client/ (workbench state); components/narrationWorkBench/ (dialogue/bbox editor); server/ (HTTP clients); scripts/sync-contracts.mjs

## Setup and checks

`npm ci`; `npm run dev` (port 4000, predev refreshes contracts); `npm run build`; `npx tsc --noEmit`. The checked-in `lint` script invokes `next lint`; verify compatibility before treating it as a gate. No automated test suite is declared.

## Known details and gaps

README is the original starter README and says port 3000; package.json specifies 4000. Both npm and pnpm lockfiles exist; avoid incidental lockfile churn. Directory names contain parentheses: quote shell paths.

## Current state / next work

This note was grounded in source inspection at the baseline above. Runtime verification for this service is recorded below only when actually executed. Documentation-only edits do not establish that GPU inference, external APIs, or the complete distributed manga pipeline work in this environment.

For story production, first inspect [Story Studio in the video service](https://github.com/whenigetout/manganarrator_video/blob/main/docs/STORY_STUDIO.md). The first slice uses imported segment audio; OCR and Paddle are unchanged. Native story TTS is a later adapter, not an image-shaped workaround.

## Related repositories

[Central ecosystem map](https://github.com/whenigetout/manganarrator/blob/main/docs/ECOSYSTEM.md) owns service responsibilities and the cross-repo task routing table. Consult it only for work crossing a service boundary.
