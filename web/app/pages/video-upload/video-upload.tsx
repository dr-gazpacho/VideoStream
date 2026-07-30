import { useState } from "react";
import { Upload, type VideoMetadata } from "~/components/upload";
import { ReadMetadata } from "~/components/read-metadata";

export default function VideoUploadPage(): React.JSX.Element {
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <Upload onVideoProcessed={(data) => setCurrentVideo(data)} />
      <ReadMetadata metadata={currentVideo} />
    </div>
  );
}
