# VideoStream — Implementation Plan

Goal: evolve this minimal-API template into a miniature Cablecast-shaped API, one phase at a
time. Each phase says *what* to build and *why it maps to Cablecast*, with hints rather than
finished code — the typing is yours. Verify each phase before moving on.

---

## Phase 1 — Convert the API routes to controllers

**What "controllers" means:** right now your routes are lambdas registered directly on `app`
(`app.MapGet("/weatherforecast", () => ...)` in `Program.cs`). The controller paradigm moves
each REST resource into its own *class*; the framework discovers those classes at startup and
routes requests to their public methods ("actions"). This is exactly how CablecastAPI is
organized — one class per resource under `Controllers/api.v1/`.

Steps:

1. In `Program.cs`, register controller support with the service container and map the routes:
   - `builder.Services.AddControllers();` before `builder.Build()`
   - `app.MapControllers();` before `app.Run()`
2. Create a `Controllers/` folder with `WeatherForecastController.cs`:
   - class inherits `ControllerBase` (the modern `ApiController`)
   - decorate with `[ApiController]` and `[Route("v1/weatherforecast")]`
   - move the lambda body into a public method: `[HttpGet] public IEnumerable<WeatherForecast> GetAll() { ... }`
3. Move the `WeatherForecast` record out of `Program.cs` into `Models/WeatherForecast.cs`
   (give it a namespace — top-level `Program.cs` types have no namespace and won't be visible).
4. Delete the `app.MapGet(...)` block from `Program.cs`. When you're done, `Program.cs` should
   contain *only* pipeline setup — no endpoint bodies. That's the controller paradigm's core
   promise, and why Cablecast's `Global.asax.cs` is small while its `Controllers/` folder is huge.

Cablecast mapping: `ControllerBase` ↔ `ApiController`; `[Route("v1/...")]` is the same
attribute-routing style as `[Route("v1/channels")]` in `ChannelsController.cs`.

Verify: `dotnet run`, then hit `/v1/weatherforecast` (update `VideoStream.http` — note the
path changed from `/weatherforecast`).

Gotchas to watch for:
- If you get a 404, check that `app.MapControllers()` is actually there and the route
  attribute doesn't have a leading typo.
- `[ApiController]` turns on automatic model validation and inference — try removing it later
  to see what it was doing for you.

## Phase 2 — Video endpoint as a controller

Build `Controllers/VideosController.cs`:

- `[HttpGet("{id}")]` action that returns the video file with range-request support:
  `PhysicalFile(path, "video/mp4", enableRangeProcessing: true)` (on `ControllerBase`, so no
  `Results.` prefix needed).
- Put a sample `.mp4` somewhere *outside* `wwwroot` (e.g. a `videos/` folder) so it only
  streams through your endpoint — that's how Cablecast serves VOD assets, mediated by the API
  rather than as bare static files.
- For now, "id" can just map to a filename. Phase 3 makes it a database lookup.

Verify: `<video controls src="/v1/videos/1">` in `wwwroot/index.html`; scrub the timeline and
watch for `206 Partial Content` responses in devtools' network tab.

## Phase 3 — EF Core + real resources

Add a data layer, the modern version of Cablecast's `TRMS.Cablecast.Database` / `CablecastDB`:

1. Packages: `Microsoft.EntityFrameworkCore.Sqlite` and `Microsoft.EntityFrameworkCore.Design`
   (SQLite = zero-install; Cablecast uses SQL Server but the EF surface is the same).
2. `Models/Show.cs` and `Models/Channel.cs` entities — keep it tiny: a Show has an Id, Title,
   FileName, and a ChannelId; a Channel has an Id and Name.
3. `Data/VideoStreamDb.cs` inheriting `DbContext` with two `DbSet<>`s.
4. Register it in `Program.cs`: `builder.Services.AddDbContext<VideoStreamDb>(...)`.
5. **Constructor-inject it** into a new `ShowsController`:
   `public ShowsController(VideoStreamDb db) { ... }`
   This is the big generational difference to feel: Cablecast controllers do
   `new CablecastDB()` inline (`ChannelsController.cs:30`) because DI came late to that stack.
   Modern code never news up its context.
6. Migrations: `dotnet ef migrations add Initial` + `dotnet ef database update`
   (needs the `dotnet-ef` tool: `dotnet tool install -g dotnet-ef`).
7. Make `VideosController` look up the Show by id and stream its `FileName`. Return
   `NotFound()` for unknown ids.
8. Make the actions `async` (`await db.Shows.ToListAsync()`) — async-by-default is another
   thing the old stack didn't have.

Verify: CRUD a Show via the `.http` file, then play it through the video endpoint.

## Phase 4 — DTOs and mapping

Cablecast never returns EF entities raw — there's a `DTOs/` folder and hand-written `ToDto()`
extension methods (`Extentions/`). Mirror that:

1. `DTOs/ShowDto.cs` — a record with only the fields a client should see (e.g. omit `FileName`,
   expose a computed `VideoUrl` instead).
2. `Extensions/ShowMappingExtensions.cs` — `public static ShowDto ToDto(this Show show)`.
3. Controllers return DTOs, never entities.

Why it matters: entities evolve with the database; DTOs are your public contract. When you add
a column you don't want leaked, the DTO layer is what saves you.

## Phase 5 — Auth filter attribute

Mini version of Cablecast's `[TRMSAuthenticated]`:

1. Write an `Attributes/RequireApiKeyAttribute.cs` implementing `IAuthorizationFilter` —
   check for a header (e.g. `X-Api-Key`) against a value in `appsettings.json`, set
   `context.Result = new UnauthorizedResult()` when missing/wrong.
2. Decorate the mutating actions (POST/PUT/DELETE) with it; leave GETs public.

Note: real modern auth is `AddAuthentication()` + `[Authorize]` policies — the filter version
is worth building once because it's exactly the pattern you'll read in CablecastAPI's
`Filters/` folder.

## Phase 6 — Background work

Cablecast uses Hangfire for jobs (transcodes, thumbnails). The built-in modern primitive is
`BackgroundService`:

1. `Services/FakeTranscodeService.cs` inheriting `BackgroundService` — poll the db every few
   seconds for Shows in a `Pending` state, wait a bit, flip them to `Ready`.
2. Register with `builder.Services.AddHostedService<FakeTranscodeService>()`.
3. Add a `Status` field to Show; make `VideosController` refuse to stream non-`Ready` shows.

Gotcha you'll hit (worth hitting): a `BackgroundService` is a singleton but `DbContext` is
scoped — you must inject `IServiceScopeFactory` and create a scope per poll. Every .NET
developer runs into this exactly once.

## Phase 7 (stretch) — Cablecast-isms

- Response caching: `[ResponseCache]` / output caching middleware — modern `[CacheOutput]`.
- An `?include=` query param that sideloads channels with shows in one response — mirrors
  `SideLoadedBundle` and `[ApiSupportsSideloading]`.
- OpenAPI descriptions on actions — mirrors the XML doc comments Cablecast feeds Swashbuckle.

---

# Part 2 — React Router frontend + HLS bitrate ladder

Checklist format; each item is small enough to finish in a sitting. Hints, not code.
Milestones C–E assume Phases 1–3 from Part 1 are done (controllers + EF); A and B don't.

## Milestone A — two apps, one repo

- [ ] Reshuffle: move the .NET project into `api/` (`mkdir api && git mv *.csproj Program.cs
      Properties appsettings*.json wwwroot VideoStream.http api/` — plus `videos/` if you want
      it inside). Verify `dotnet run` still works from `api/` before touching anything else.
- [ ] Spin up a new React Router app: `npx create-react-router@latest web`.
      When prompted, plain TypeScript template, no deployment adapter.
- [x] Decision made: **SSR mode** (the default, `ssr: true`). The Node server calls the .NET
      API for data — same topology as ccs-remix. Two kinds of traffic follow from this:
      *data* goes browser → Node → .NET (loaders run in Node); *media* goes browser → .NET
      directly (hls.js and `<video>` run in the browser — don't route video bytes through Node).
- [ ] Verify both apps run side by side: `dotnet run` in `api/` (port 5129) and
      `npm run dev` in `web/` (port 5173).
- [ ] Configure the API base URL for server-side fetches: an env var (e.g. `API_URL=http://localhost:5129`
      via `.env`), read with `process.env.API_URL` inside loaders. Server-side fetch has no
      origin, so relative URLs like `/v1/...` don't work there — absolute only.
- [ ] Prove the seam: in a route's `loader` (not `clientLoader` — that's the SPA-mode variant),
      `fetch(`${process.env.API_URL}/v1/weatherforecast`)` and render the result. Concept
      check: view-source on :5173 should show the forecast data already in the HTML — that's
      SSR doing its job before the browser saw anything.
- [ ] CORS on the API for the browser-direct traffic (media, and later uploads):
      `AddCors` + `UseCors` in `Program.cs` with a dev policy allowing `http://localhost:5173`.
      (Alternative for dev only: Vite proxy `/v1` → :5129. CORS is the more transferable
      lesson — you'll need it in prod regardless, since browser and API are different origins.)

## Milestone B — port the drop zone to React

- [ ] Rebuild the drop zone as a component. Everything you learned transfers: same
      `dragover`/`drop` events (as `onDragOver`/`onDrop` props), same `DataTransfer` API.
      Files go in `useState`; object URLs still need revoking (`useEffect` cleanup).
- [ ] Keep the a11y properties of the label+input pattern (keyboard/screen-reader path
      to the file picker), and keep the video sizing lesson — style the preview `<video>`
      from day one.

## Milestone C — upload for real

- [ ] API: `POST /v1/videos` controller action taking `IFormFile`, saving to
      `videos/source/`, inserting a Show row with `Status = Pending`.
      Gotcha: multipart request size limits — you'll hit the ~28 MB default with real
      videos; look up `[RequestSizeLimit]` / `FormOptions.MultipartBodyLengthLimit`.
- [ ] Frontend: on drop, `FormData` + `fetch POST` (you know this part). Decision point in
      SSR mode: post the file from the browser straight to the .NET API (simple, needs the
      CORS setup from Milestone A), or through a React Router `action` that forwards it
      (teaches actions, but streams every upload byte through Node). Start browser-direct.
- [ ] Show the pending/ready state in the UI — a `loader` fetching the show list, revalidated
      after upload.

## Milestone D — single-rung HLS, end to end

Get ONE rendition playing before building the ladder. Every later step is debuggable
only if this works.

- [ ] By hand first: run ffmpeg on a source video to produce HLS —
      one `.m3u8` playlist + `.ts` segments in `videos/hls/<id>/`.
      (Look up `-f hls`, `-hls_time`, `-hls_playlist_type vod`. Inspect the playlist in a
      text editor — it's human-readable and worth actually reading.)
- [ ] Make the fake-transcode `BackgroundService` from Phase 6 real: `Process.Start`
      ffmpeg per Pending show, flip to `Ready` on exit code 0, `Failed` otherwise.
- [ ] Serve the HLS output. Static-file middleware pointed at `videos/hls` works, but the
      defaults don't know HLS types — you need a `FileExtensionContentTypeProvider` with
      `.m3u8` → `application/vnd.apple.mpegurl` and `.ts` → `video/mp2t`.
      (No range processing needed — HLS segments are fetched whole; that's the point.)
- [ ] Frontend player: `npm install hls.js`, wire it to a `<video>` in a player component
      (`new Hls()`, `loadSource(manifestUrl)`, `attachMedia(video)`). Safari quirk: it plays
      HLS natively — check `video.canPlayType("application/vnd.apple.mpegurl")` first.
- [ ] Watch the Network tab while playing: playlist first, then segments trickling in.
      That waterfall IS streaming — make sure it matches your mental model before moving on.

## Milestone E — the bitrate ladder

- [ ] Extend the ffmpeg command to 2–3 rungs (e.g. 1080p/5M, 720p/2.8M, 480p/1.2M) with a
      master playlist. Look up `-var_stream_map` + `-master_pl_name`; expect this command to
      take a few iterations — it's everyone's least favorite ffmpeg incantation.
- [ ] Point hls.js at the master playlist instead of a variant. It reads the rung list and
      switches by measured bandwidth automatically — that's ABR (adaptive bitrate).
- [ ] See it work: devtools → Network → throttle to "Fast 4G" mid-playback and watch the
      segment requests drop to a lower rung.
- [ ] Quality selector UI: hls.js exposes `hls.levels` and `hls.currentLevel` — build a
      small menu (keyboard-accessible) that pins a rung or returns to auto.

## Milestone F (stretch) — distro

SSR mode means production is two processes, not one — the wwwroot single-artifact trick
only works for SPA builds. This mirrors how ccs-remix ships (Node server on Heroku,
services beside it).

- [ ] `npm run build` in `web/`, then run the built output with `npm run start`
      (`react-router-serve ./build/server/index.js`) against a running API — no Vite
      anywhere. `API_URL` must be set in the Node server's environment.
- [ ] Make sure you can narrate the prod request flow: browser hits Node for pages/data,
      .NET for media; nothing in the system serves the other's traffic.
- [ ] (Optional) One command to rule them all: a root-level script (or `Procfile`-style
      runner like `concurrently`) that starts both processes.
