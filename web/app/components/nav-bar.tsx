import React, { useState } from "react";
import { NavLink } from "react-router";
import type { PathConfig } from "../types";

export const NavBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const paths: PathConfig[] = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Editor", path: "/editor" },
    { label: "Upload", path: "/video-upload" },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="w-full bg-zinc-950 border-b border-zinc-800 text-zinc-100 font-mono select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* logo */}
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 bg-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="font-bold tracking-wider text-xs uppercase text-zinc-200">
              Video // Stream
            </span>
          </div>

          <ul className="hidden md:flex items-center gap-1 h-full">
            {paths.map((item) => (
              <li key={item.path} className="h-full flex items-center">
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive, isPending }) =>
                    [
                      "relative px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-amber-400",
                      isPending
                        ? "text-amber-300 animate-pulse bg-zinc-900"
                        : "",
                      isActive
                        ? "text-zinc-950 bg-amber-500 font-bold shadow-sm"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  {({ isActive, isPending }) => (
                    <span className="flex items-center gap-2">
                      {/* Active Status Indicator Light */}
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full ${
                          isActive
                            ? "bg-zinc-950"
                            : isPending
                              ? "bg-amber-400 animate-ping"
                              : "bg-zinc-700"
                        }`}
                      />
                      {item.label}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle navigation menu"
              className="p-2 rounded-sm bg-zinc-900 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-zinc-900 border-b border-zinc-800 px-2 pt-2 pb-3 space-y-1"
        >
          {paths.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive, isPending }) =>
                [
                  "block px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-colors",
                  isPending ? "text-amber-300 bg-zinc-800 animate-pulse" : "",
                  isActive
                    ? "text-zinc-950 bg-amber-500 font-bold"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};
