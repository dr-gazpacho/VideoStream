# VideoStream

- API: `cd api && dotnet run` → http://localhost:5129
- Web: `cd web && npm run dev` → http://localhost:5173

to do:

- create more robust conversion options
- show "percentage complete"
- allow for download or add to working media lib
- move function defs into utils so the whole "make an input" and "convert" can be more portable

## 8/1

You can upload a file from disk and then convert it into another format. The converted file currently only lives in browser memory. It is stupid long term probably, but it is convenient right now
