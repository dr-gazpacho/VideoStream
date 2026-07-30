import { useMediaLibrary } from "~/context/media-context";

export function EditorPage() {
  const { clips } = useMediaLibrary();

  return (
    <div className="p-6">
      <h2 className="text-zinc-100 font-mono text-sm uppercase mb-4">
        Media Library ({clips.length})
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {clips.map((clip) => (
          <div
            key={clip.name}
            draggable
            className="p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-300"
          >
            <p className="font-bold text-amber-500 truncate">{clip.name}</p>
            <p className="text-zinc-500">{clip.duration.toFixed(1)}s</p>
          </div>
        ))}
      </div>
    </div>
  );
}
