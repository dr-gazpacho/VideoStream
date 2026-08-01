import {
  Input,
  BlobSource,
  ALL_FORMATS,
  WebMOutputFormat,
  Mp4OutputFormat,
  MkvOutputFormat,
  OggOutputFormat,
  type AudioCodec,
  type VideoCodec,
} from "mediabunny";
import type { VideoMetadata } from "~/context/media-context";

export async function createVideoMetadataFromFile(
  file: File,
  isConvertedInBrowser: boolean,
): Promise<VideoMetadata> {
  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });

  const duration = await input.computeDuration();
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

  return {
    id: `clip_${Date.now()}_${file.name}`,
    input,
    file,
    duration,
    name: file.name,
    size: file.size,
    dimensions,
    rotation,
    videoCodec,
    audioCodec,
    hasVideo: !!videoTrack,
    hasAudio: !!audioTrack,
    isConvertedInBrowser: isConvertedInBrowser,
  };
}

export const SUPPORTED_OUTPUT_FORMATS = {
  webm: {
    label: "WebM Video (.webm)",
    ext: "webm",
    mime: "video/webm",
    getFormat: () => new WebMOutputFormat(),
  },
  mp4: {
    label: "MP4 Video (.mp4)",
    ext: "mp4",
    mime: "video/mp4",
    getFormat: () => new Mp4OutputFormat(),
  },
  mkv: {
    label: "Matroska Video (.mkv)",
    ext: "mkv",
    mime: "video/x-matroska",
    getFormat: () => new MkvOutputFormat(),
  },
  ogg: {
    label: "Ogg Video (.ogg)",
    ext: "ogg",
    mime: "video/ogg",
    getFormat: () => new OggOutputFormat(),
  },
} as const;

export type OutputFormatKey = keyof typeof SUPPORTED_OUTPUT_FORMATS;
