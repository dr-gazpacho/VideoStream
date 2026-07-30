import { route, type RouteConfig, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("about", "./routes/about.tsx"),
  route("editor", "./routes/editor.tsx"),
  route("video-upload", "./routes/video-upload.tsx"),
  route(".well-known/*", "./routes/well-known.ts"),
] satisfies RouteConfig;
