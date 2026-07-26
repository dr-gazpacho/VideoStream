import type { Route } from "./+types/about";
import AboutPage from "../pages/about/about";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "About page" },
    { name: "description", content: "Description for the about page" },
  ];
}

export default function About() {
  return <AboutPage />;
}
