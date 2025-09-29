"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export type MobileNavItem = { label: string; href: string };

export default function MobileNav({ items = [] as MobileNavItem[] }: { items?: MobileNavItem[] }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="md:hidden relative">
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors"
      >
        {/* Hamburger / Close icon */}
        <svg
          className={`w-5 h-5 transition-transform ${open ? "rotate-90" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M3 6h18" />
              <path d="M3 12h18" />
              <path d="M3 18h18" />
            </>
          )}
        </svg>
      </button>

      {/* Overlay panel */}
      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              key="panel"
              className="fixed top-14 right-3 left-3 z-[9999] rounded-xl border border-white/10 bg-[rgba(11,10,16,0.98)] shadow-xl"
              initial={{ opacity: 0, y: 8, x: 24 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 8, x: 24 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
            >
              <nav className="flex flex-col divide-y divide-white/10">
                {items.map((it) => (
                  <Link
                    key={it.href + it.label}
                    href={it.href}
                    className="px-4 py-3 text-white/90 hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    {it.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
