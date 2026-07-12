import { useEffect } from "react";

type Handler = (e: KeyboardEvent) => void;

/**
 * Global keyboard shortcut. `combo` examples: "mod+k", "mod+/", "shift+?".
 * `mod` maps to Cmd on macOS and Ctrl elsewhere.
 */
export function useHotkey(combo: string, handler: Handler, deps: unknown[] = []) {
  useEffect(() => {
    const parts = combo.toLowerCase().split("+");
    const needMod = parts.includes("mod");
    const needShift = parts.includes("shift");
    const key = parts[parts.length - 1]!;

    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (needMod && !mod) return;
      if (needShift && !e.shiftKey) return;
      if (e.key.toLowerCase() !== key) return;
      if (key === "escape" && e.key !== "Escape") return;
      handler(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
