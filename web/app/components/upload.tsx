import React, { useState } from "react";
import { useMediaLibrary, type VideoMetadata } from "~/context/media-context";
import { createVideoMetadataFromFile } from "~/utils/metadata.util"; // Import your helper

interface UploadProps {
  onVideoProcessed: (data: VideoMetadata) => void;
}

export function Upload({ onVideoProcessed }: UploadProps) {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const processedVideo = await createVideoMetadataFromFile(file, false);

      onVideoProcessed(processedVideo);
    } catch (err) {
      console.error("Failed to inspect video metadata:", err);
    } finally {
      setLoading(false);
      // Reset input value so user can upload the same file again if purged
      event.target.value = "";
    }
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-sm font-mono">
      <label className="block text-xs uppercase text-zinc-400 mb-2 font-bold tracking-wider">
        // Select Video File
      </label>
      <input
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileUpload}
        disabled={loading}
        className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-bold file:uppercase file:bg-lime-500 file:text-zinc-950 hover:file:bg-lime-400 cursor-pointer disabled:opacity-50"
      />
      {loading && (
        <p className="mt-2 text-xs text-lime-400 animate-pulse flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
          Analyzing tracks...
        </p>
      )}
    </div>
  );
}
