import React, { useState } from "react";
import { Input, BlobSource, ALL_FORMATS } from "mediabunny";

export interface VideoMetadata {
  file: File;
  duration: number;
  name: string;
}

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
      const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      });

      const videoDuration = await input.computeDuration();

      // Pass the extracted metadata & original file up to parent
      onVideoProcessed({
        file,
        duration: videoDuration,
        name: file.name,
      });
    } catch (err) {
      console.error("Failed to inspect video:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md">
      <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
        Select Video File
      </label>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileUpload}
        className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-zinc-950 hover:file:bg-amber-400 cursor-pointer"
      />
      {loading && (
        <p className="mt-2 text-xs text-amber-400 animate-pulse font-mono">
          Analyzing video track...
        </p>
      )}
    </div>
  );
}
