import type { Route } from "./+types/widget";
import WidgetPage from "../pages/widget/widget";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New Widget" },
    { name: "description", content: "Welcome to a generic widget" },
  ];
}

export default function Widget() {
  return <WidgetPage />;
}
