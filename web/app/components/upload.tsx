import React, { useState } from "react";
import {
  Input,
  BlobSource,
  ALL_FORMATS,
  type AudioCodec,
  type VideoCodec,
} from "mediabunny";
import { useMediaLibrary, type VideoMetadata } from "~/context/media-context";

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
      let videoCodec: VideoCodec | null = null;

      if (videoTrack) {
        const [width, height] = await Promise.all([
          videoTrack.getDisplayWidth(),
          videoTrack.getDisplayHeight(),
        ]);
        dimensions = { width, height };
        rotation = videoTrack.rotation ?? 0;
        videoCodec = await videoTrack.getCodec();
      }

      const audioTrack = await input.getPrimaryAudioTrack();
      let audioCodec: AudioCodec | null = null;
      if (audioTrack) {
        audioCodec = await audioTrack.getCodec();
      }

      const id = `clip_${Date.now()}_${file.name}`;

      const processedVideo: VideoMetadata = {
        id,
        input,
        file,
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

      addClip(processedVideo);
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
        className="block w-full text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xs file:border-0 file:text-xs file:font-bold file:uppercase file:bg-amber-500 file:text-zinc-950 hover:file:bg-amber-400 cursor-pointer disabled:opacity-50"
      />
      {loading && (
        <p className="mt-2 text-xs text-amber-400 animate-pulse flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          Analyzing tracks...
        </p>
      )}
    </div>
  );
}
