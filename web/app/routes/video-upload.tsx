import type { Route } from "./+types/video-upload";
import VideoUploadPage from "../pages/video-upload/video-upload";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upload Video" },
    { name: "description", content: "Welcome to Video Upload" },
  ];
}

export default function VideoUpload() {
  return <VideoUploadPage />;
}
