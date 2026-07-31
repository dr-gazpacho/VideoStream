import type { Route } from "./+types/converter";
import { ConverterPage } from "~/pages/converter/converter";
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Video Converter" },
    { name: "description", content: "Convert one container/codec to another" },
  ];
}

export default function VideoUpload() {
  return <ConverterPage />;
}
