import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface CommandContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

export function CommandProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({ open, setOpen, toggle: () => setOpen((o) => !o) }),
    [open]
  );
  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>;
}

export function useCommand() {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error("useCommand must be used within CommandProvider");
  return ctx;
}
