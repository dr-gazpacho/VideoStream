# VideoStream

- API: `cd api && dotnet run` → http://localhost:5129
- Web: `cd web && npm run dev` → http://localhost:5173

to do:

- selective "download" - might be hard... start with streams api
- add a nice header or title or something to explain whats happening, maybe placeholders
- more transcoding/compressing/processing options (read the docs)
- thumbnails
  - add to VideoMetadata ( as new URL? add the canvas? how does media bunny do it...)
  - allow to pick thumbnail when you add to library?
- add some sort of playback on cavas element (GONNA BE HARD)
- add some sort of state to converter runs so that when one is done the progress flips to done and (if you add the media or start a new transcode) the trancode clears

## 8/1

You can upload a file from disk and then convert it into another format. The converted file currently only lives in browser memory. It is stupid long term probably, but it is convenient right now
