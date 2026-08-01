import {
  Input,
  BlobSource,
  ALL_FORMATS,
  type AudioCodec,
  type VideoCodec,
} from "mediabunny";
import type { VideoMetadata } from "~/context/media-context";

export async function createVideoMetadataFromFile(
  file: File,
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
  };
}
