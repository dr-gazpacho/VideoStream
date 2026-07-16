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
