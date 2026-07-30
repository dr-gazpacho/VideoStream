import type { Route } from "./+types/editor";
import { EditorPage } from "~/pages/editor/editor";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Widget" },
    { name: "description", content: "Welcome to a generic editor" },
  ];
}

export default function Widget() {
  return <EditorPage />;
}
