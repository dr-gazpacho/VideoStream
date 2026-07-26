import type { PathConfig } from "../types";
import { NavLink } from "react-router";

export const NavBar: React.FC = () => {
  const paths: PathConfig[] = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Widget", path: "/widget" },
  ];

  return (
    <nav>
      {paths.map((path) => {
        return (
          <NavLink to={path.path} key={path.label}>
            {path.label}
          </NavLink>
        );
      })}
    </nav>
  );
};
