import type { Route } from "./+types/converter";
import { ConverterPage } from "~/pages/converter/converter";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Upload Video" },
    { name: "description", content: "Welcome to Video Upload" },
  ];
}

export default function VideoUpload() {
  return <ConverterPage />;
}
