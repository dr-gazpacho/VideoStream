import { useMediaLibrary } from "~/context/media-context";
import { ReadMetadata } from "~/components/read-metadata";

export function ConverterPage() {
  const { clips } = useMediaLibrary();
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div>
        {clips.map((clip) => {
          return (
            <ReadMetadata metadata={clip} withHeader={false} variant="small" />
          );
        })}
      </div>
      {clips.map((clip) => {
        return (
          <ReadMetadata metadata={clip} withHeader={false} variant="large" />
        );
      })}
    </div>
  );
}
