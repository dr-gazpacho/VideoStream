# VideoStream

- API: `cd api && dotnet run` → http://localhost:5129
- Web: `cd web && npm run dev` → http://localhost:5173

to do:

- allow for download or add to working media lib
- selective "add to media lib or download"
- add a nice header or title or something to explain whats happening, maybe placeholders
- more transcoding/compressing/processing options (read the docs)
- thumbnails
  - add to VideoMetadata ( as new URL? how does media bunny do it...)
- add some sort of playback on cavas element

## 8/1

You can upload a file from disk and then convert it into another format. The converted file currently only lives in browser memory. It is stupid long term probably, but it is convenient right now
