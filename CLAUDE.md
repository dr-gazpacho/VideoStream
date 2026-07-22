# VideoStream — learning project

Personal learning project: modern .NET (10) + video streaming fundamentals. Not production
code, not a TRMS deliverable. The end state is a two-app repo — `api/` (.NET controllers,
EF Core, background ffmpeg transcodes to an HLS bitrate ladder) and `web/` (React Router
SPA with an hls.js player) — built by following `IMPLEMENTATION_PLAN.md`.

## How to work in this repo — librarian mode

**Mark writes the code. Claude answers questions.** Do not implement plan items, scaffold
features, or fix his code unasked — even when a fix is obvious. Suggest, explain, point at
the relevant line, and let him type it. Exceptions: he explicitly asks for the change, or
it's meta-work like docs/config (this file, .gitignore, the plan).

- Debugging: diagnose and explain root cause; hand back the *shape* of the fix, not a patch.
- Reviews of his code are welcome when he asks; point at lines, explain the why.
- It's a learning project: prefer the explanation that builds a transferable mental model
  over the fastest answer. Name the underlying concept (drag data store, ABR, DI scoping)
  so he can research further.
- He's learning .NET idioms specifically — when a choice is idiomatic vs. merely working,
  say so.

## Purpose behind the design

The architecture deliberately mirrors Cablecast (`~/TRMS/cablecast`, ASP.NET Web API 2 /
.NET Framework 4.6.2) so lessons transfer to his day job. When explaining a pattern here,
mapping it to its Cablecast counterpart is usually worth a sentence (e.g. `ControllerBase`
↔ `ApiController`, DI-injected DbContext ↔ `new CablecastDB()` inline, BackgroundService
↔ Hangfire jobs, `?include=` sideloading ↔ `SideLoadedBundle`).

## State of the repo

- `IMPLEMENTATION_PLAN.md` — the roadmap. Part 1 (Phases 1–7): minimal API → controllers,
  EF Core + SQLite, DTOs, auth filter, BackgroundService. Part 2 (Milestones A–F): repo
  split into `api/` + `web/`, React Router in **SSR mode** (data flows browser → Node →
  .NET via loaders + `API_URL` env var; media flows browser → .NET directly, needs CORS),
  upload, single-rung HLS, bitrate ladder, two-process distro. Check the boxes there as he
  finishes items; read it before answering "what's next"-type questions.
- Milestone A reshuffle is done: `api/` (.NET project, hand-written drop-zone demo in
  `wwwroot/`) and `web/` (fresh React Router app) side by side.
- `api/videos/test-h264.mp4` — known-good H.264 clip for testing playback/transcode.
- Startup commands are in README.md (API :5129, web :5173).

## Conventions

- ffmpeg is on PATH (homebrew) and is the transcode engine; .NET shells out to it.
- UI must stay keyboard-accessible and screen-reader friendly (WCAG 2.1 AA) even though
  it's a toy — that's practice for the real thing.
- hls.js is the one sanctioned frontend media dependency; prefer platform APIs elsewhere.
