import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/empty-state";
import { useHotkey } from "@/hooks/use-hotkey";
import { aiService, type AIResult } from "@/services/ai.service";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: AIResult["citations"];
  pending?: boolean;
  at: number;
}

const SUGGESTIONS = [
  "Who has Dell Latitude 7440?",
  "Show overdue assets",
  "Generate utilization report",
  "Book Conference Room A tomorrow at 3 PM",
];

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi, I'm your AssetFlow Copilot. Ask me about assets, allocations, bookings, or reports — or try a suggestion below.",
      at: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useHotkey("mod+j", (e) => {
    e.preventDefault();
    setOpen((o) => !o);
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: trimmed, at: Date.now() };
    const pendingMsg: Message = { id: crypto.randomUUID(), role: "assistant", text: "", pending: true, at: Date.now() };
    setMessages((m) => [...m, userMsg, pendingMsg]);
    setInput("");
    try {
      const result = await aiService.ask(trimmed);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? { ...msg, text: result.response, citations: result.citations, pending: false }
            : msg
        )
      );
    } catch {
      setMessages((m) =>
        m.map((msg) => (msg.id === pendingMsg.id ? { ...msg, text: "Something went wrong. Please try again.", pending: false } : msg))
      );
    }
  }

  return (
    <>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-glow"
        aria-label="Open AI Copilot"
      >
        <span className="absolute inset-0 -z-10 rounded-2xl bg-primary/60 animate-pulse-ring" />
        <Bot className="size-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 flex h-[560px] w-[400px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border glass-strong shadow-glow"
          >
            <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-xl gradient-primary text-white">
                <Sparkles className="size-4.5" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">AssetFlow Copilot</p>
                <p className="text-[10px] text-muted-foreground">Online · Function-calling enabled</p>
              </div>
              <div className="ml-auto flex items-center gap-1">
                <Kbd>⌘J</Kbd>
                <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close">
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
            </div>

            <div className="border-t border-border p-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-1.5"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  className="h-8 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <Button type="submit" size="icon-sm" disabled={!input.trim()}>
                  <Send className="size-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-secondary text-foreground" : "gradient-primary text-white"
        )}
      >
        {isUser ? <span className="text-xs font-semibold">You</span> : <Bot className="size-4" />}
      </div>
      <div className={cn("max-w-[80%] space-y-1.5", isUser && "items-end text-right")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground"
          )}
        >
          {message.pending ? (
            <span className="flex gap-1 py-1">
              <Dot delay={0} />
              <Dot delay={0.15} />
              <Dot delay={0.3} />
            </span>
          ) : (
            message.text.split("\n").map((line, i) => (
              <p key={i} className={line.startsWith("•") ? "flex gap-1" : ""}>
                {line}
              </p>
            ))
          )}
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c) => (
              <span key={c.label} className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {c.label}
              </span>
            ))}
          </div>
        )}
        <p className="px-1 text-[10px] text-muted-foreground">{relativeTime(new Date(message.at))}</p>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="size-1.5 rounded-full bg-current"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 1, repeat: Infinity, delay }}
    />
  );
}
