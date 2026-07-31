import { useState } from "react";
import { useMediaLibrary, type VideoMetadata } from "~/context/media-context";
import { ReadMetadata } from "~/components/read-metadata";

export function ConverterPage() {
  const { clips } = useMediaLibrary();

  const [selectedMetadata, setSelectedMetadata] =
    useState<VideoMetadata | null>(null);

  console.log(selectedMetadata);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div>
        {clips.map((clip) => {
          return (
            <ReadMetadata
              metadata={clip}
              withHeader={false}
              variant="small"
              handleClick={setSelectedMetadata}
            />
          );
        })}
      </div>
      {selectedMetadata && (
        <ReadMetadata
          metadata={selectedMetadata}
          withHeader={false}
          variant="large"
        />
      )}
    </div>
  );
}
