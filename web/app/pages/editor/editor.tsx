import { useMediaLibrary } from "~/context/media-context";
import { ReadMetadata } from "~/components/read-metadata";

export function EditorPage() {
  const { clips } = useMediaLibrary();

  return (
    <div className="p-6">
      <h2 className="text-zinc-100 font-mono text-sm uppercase mb-4">
        Media Library ({clips.length})
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {clips.map((clip) => (
          <ReadMetadata metadata={clip} variant="small" />
        ))}
      </div>
    </div>
  );
}
