import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/empty-state";
import { useHotkey } from "@/hooks/use-hotkey";
import { aiService, type AIResult } from "@/services/ai.service";
import { cn } from "@/lib/cn";
import { relativeTime } from "@/lib/format";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: AIResult["citations"];
  pending?: boolean;
  at: number;
}

const SUGGESTIONS = [
  { q: "Who has Dell Latitude 7440?", label: "Find an asset holder" },
  { q: "Show overdue assets", label: "Overdue returns" },
  { q: "Allocate AF-1042 to Riya", label: "Allocate an asset" },
  { q: "Book Conference Room A tomorrow at 3 PM", label: "Book a resource" },
  { q: "Show maintenance due next week", label: "Maintenance due" },
  { q: "Generate utilization report", label: "Utilization report" },
];

export function CopilotPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm your AssetFlow Copilot. I understand natural language and can act on your fleet using function calling. Ask me anything, or tap a suggestion below.",
      at: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useHotkey("mod+k", (e) => { e.preventDefault(); (document.querySelector("input[placeholder*='Ask']") as HTMLInputElement)?.focus(); });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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
        m.map((msg) => (msg.id === pendingMsg.id ? { ...msg, text: result.response, citations: result.citations, pending: false } : msg))
      );
    } catch {
      setMessages((m) => m.map((msg) => (msg.id === pendingMsg.id ? { ...msg, text: "Something went wrong. Please try again.", pending: false } : msg)));
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-3xl flex-col">
      <PageHeader
        title="AI Copilot"
        description="Natural language control plane for your entire asset fleet."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Back to dashboard <ArrowRight className="size-3.5" />
          </Button>
        }
      />

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-xl gradient-primary text-white">
            <Sparkles className="size-4.5" />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">AssetFlow Copilot</p>
            <p className="text-[10px] text-muted-foreground">Online · Function-calling engine</p>
          </div>
        </div>

        <div ref={scrollRef} className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((m) => (
            <ChatBubble key={m.id} message={m} onCitation={(href) => navigate(href)} />
          ))}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.q}
                onClick={() => send(s.q)}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {s.label}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-1.5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything — e.g. Who has AF-1042?"
              className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Kbd>⌘J</Kbd>
            <Button type="submit" size="icon" disabled={!input.trim()}>
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message, onCitation }: { message: Message; onCitation: (href: string) => void }) {
  const isUser = message.role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", isUser ? "bg-secondary text-foreground" : "gradient-primary text-white")}>
        {isUser ? <span className="text-xs font-semibold">You</span> : <Bot className="size-4" />}
      </div>
      <div className={cn("max-w-[85%] space-y-1.5", isUser && "items-end text-right")}>
        <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed", isUser ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-foreground")}>
          {message.pending ? (
            <span className="flex gap-1 py-1">
              <Dot delay={0} /><Dot delay={0.15} /><Dot delay={0.3} />
            </span>
          ) : (
            message.text.split("\n").map((line, i) => <p key={i}>{line}</p>)
          )}
        </div>
        {message.citations && message.citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.citations.map((c) => (
              <button
                key={c.label}
                onClick={() => onCitation(c.href)}
                className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20"
              >
                {c.label} <ArrowRight className="size-3" />
              </button>
            ))}
          </div>
        )}
        <p className="px-1 text-[10px] text-muted-foreground">{relativeTime(message.at)}</p>
      </div>
    </motion.div>
  );
}

function Dot({ delay }: { delay: number }) {
  return <motion.span className="size-1.5 rounded-full bg-current" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay }} />;
}
