import { CanvasSink } from "mediabunny";
import { type VideoMetadata } from "~/context/media-context";

export async function getThumbnails(videoMetaData: VideoMetadata) {
  const videoTrack = await videoMetaData.input.getPrimaryVideoTrack();
  if (!videoTrack) return [];

  const decodable = await videoTrack.canDecode();
  if (!decodable) return [];

  const sink = new CanvasSink(videoTrack, {
    width: 320,
  });

  const startTimestamp = await videoTrack.getFirstTimestamp();
  const endTimestamp = await videoTrack.computeDuration();

  // five equally spaced "timestamps" represent percentage of total time
  const timestamps = [0, 0.2, 0.4, 0.6, 0.8].map(
    (timestamp) => startTimestamp + timestamp * (endTimestamp - startTimestamp),
  );

  const results = [];
  for await (const result of sink.canvasesAtTimestamps(timestamps)) {
    if (result) {
      results.push(result);
    }
  }
  return results;
}
