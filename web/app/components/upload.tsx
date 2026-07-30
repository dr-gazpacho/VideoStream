import React, { useState } from "react";
import {
  Input,
  BlobSource,
  ALL_FORMATS,
  type AudioCodec,
  type VideoCodec,
} from "mediabunny";
import { useMediaLibrary } from "~/context/media-context";

// Expanded Video Metadata Contract
export interface VideoMetadata {
  input: Input;
  duration: number;
  name: string;
  size: number;
  // Visual & Audio Specs
  dimensions?: { width: number; height: number };
  rotation?: number;
  videoCodec?: VideoCodec | null;
  audioCodec?: AudioCodec | null;
  hasAudio: boolean;
  hasVideo: boolean;
}

interface UploadProps {
  onVideoProcessed: (data: VideoMetadata) => void;
}

export function Upload({ onVideoProcessed }: UploadProps) {
  const [loading, setLoading] = useState(false);
  const { addClip } = useMediaLibrary();

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
      const videoTrack = await input.getPrimaryVideoTrack();

      let dimensions;
      let rotation;
      let videoCodec;

      if (videoTrack) {
        const [width, height] = await Promise.all([
          videoTrack.getDisplayWidth(),
          videoTrack.getDisplayHeight(),
        ]);
        dimensions = { width, height };
        rotation = videoTrack.rotation ?? 0;
        videoCodec = await videoTrack.getCodec();
      }

      // 3. Inspect audio track specs
      const audioTrack = await input.getPrimaryAudioTrack();
      let audioCodec;
      if (audioTrack) {
        audioCodec = await audioTrack.getCodec();
      }

      const processedVideo: VideoMetadata = {
        input,
        duration: videoDuration,
        name: file.name,
        size: file.size,
        dimensions,
        rotation,
        videoCodec,
        audioCodec,
        hasVideo: !!videoTrack,
        hasAudio: !!audioTrack,
      };

      onVideoProcessed(processedVideo);
      addClip(processedVideo);
    } catch (err) {
      console.error("Failed to inspect video metadata:", err);
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
          Analyzing tracks and codecs...
        </p>
      )}
    </div>
  );
}
