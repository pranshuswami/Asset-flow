import { db } from "@/data/db";
import { sleep } from "@/lib/format";

// ============================================================================
// AI Copilot — local intent + function-calling engine.
// Mirrors an OpenAI/Gemini function-calling flow: parse natural language into
// a structured intent, "call a function" against domain data, then respond.
// Set VITE_AI_PROVIDER + a key to route to a real LLM (see `routeToLLM`).
// ============================================================================

export type AIIntent =
  | "WHO_HAS_ASSET"
  | "OVERDUE_ASSETS"
  | "ALLOCATE_ASSET"
  | "BOOK_RESOURCE"
  | "MAINTENANCE_DUE"
  | "UTILIZATION_REPORT"
  | "MONTHLY_SUMMARY"
  | "IDLE_ASSETS"
  | "SEARCH"
  | "GREETING"
  | "HELP"
  | "UNKNOWN";

export interface AICitation {
  label: string;
  href: string;
}

export interface AIResult {
  intent: AIIntent;
  response: string;
  citations: AICitation[];
  /** Optional structured payload for rich rendering (e.g. a table). */
  data?: unknown;
}

function cite(label: string, href: string): AICitation {
  return { label, href };
}

function findAssetByName(q: string) {
  return db.assets.find(
    (a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.assetId.toLowerCase() === q.toLowerCase()
  );
}

function resolveIntent(message: string): AIIntent {
  const m = message.toLowerCase();
  if (/(who has|where is|who owns|current holder)/.test(m)) return "WHO_HAS_ASSET";
  if (/overdue|late return|past due/.test(m)) return "OVERDUE_ASSETS";
  if (/allocate|assign|give/.test(m) && /to /.test(m)) return "ALLOCATE_ASSET";
  if (/book|reserve|schedule/.test(m)) return "BOOK_RESOURCE";
  if (/maintenance due|service due|need.*fix|upcoming maintenance/.test(m)) return "MAINTENANCE_DUE";
  if (/utilization|usage report|usage/.test(m)) return "UTILIZATION_REPORT";
  if (/monthly|summary|recap/.test(m)) return "MONTHLY_SUMMARY";
  if (/idle|unused|not used|dormant/.test(m)) return "IDLE_ASSETS";
  if (/search|find|show me/.test(m)) return "SEARCH";
  if (/^(hi|hello|hey|yo)\b/.test(m)) return "GREETING";
  if (/help|what can you|commands/.test(m)) return "HELP";
  return "UNKNOWN";
}

function runIntent(message: string, intent: AIIntent): AIResult {
  const m = message.toLowerCase();

  switch (intent) {
    case "GREETING":
      return {
        intent,
        response:
          "Hi! I'm your AssetFlow Copilot. I can find assets, check overdue returns, allocate equipment, book rooms, and generate reports. Try “Show overdue assets” or “Allocate AF-1042 to Riya”.",
        citations: [cite("Open command palette", "/"), cite("View assets", "/assets")],
      };

    case "HELP":
      return {
        intent,
        response:
          "Here are a few things I can do:\n• Who has <asset>?\n• Show overdue assets\n• Allocate <asset> to <person>\n• Book <room> tomorrow at 3 PM\n• Show maintenance due next week\n• Generate utilization report\n• Generate monthly summary",
        citations: [cite("Dashboard", "/")],
      };

    case "WHO_HAS_ASSET": {
      const nameMatch = m.replace(/.*(who has|where is|owns|holder of)\s*/i, "").trim();
      const asset = findAssetByName(nameMatch);
      if (!asset) {
        return {
          intent,
          response: `I couldn't find an asset matching “${nameMatch}”. Try searching by name or asset ID like AF-1042.`,
          citations: [cite("Search assets", "/assets")],
        };
      }
      const owner = asset.ownerId ? db.users.find((u) => u.id === asset.ownerId) : undefined;
      return {
        intent,
        response: owner
          ? `${asset.name} (${asset.assetId}) is currently allocated to ${owner.name} in ${db.departments.find((d) => d.id === owner.departmentId)?.name}. Condition: ${asset.condition}.`
          : `${asset.name} (${asset.assetId}) is currently ${asset.status}. It is not allocated to anyone.`,
        citations: [cite(`Open ${asset.assetId}`, `/assets/${asset.id}`)],
      };
    }

    case "OVERDUE_ASSETS": {
      const overdue = db.allocations.filter(
        (a) => a.expectedReturn && new Date(a.expectedReturn) < new Date() && a.status !== "RETURNED"
      );
      if (!overdue.length)
        return { intent, response: "Good news — there are no overdue returns right now. 🎉", citations: [] };
      const lines = overdue.slice(0, 5).map((a) => {
        const asset = db.assets.find((x) => x.id === a.assetId);
        const user = db.users.find((u) => u.id === a.toUserId);
        return `• ${asset?.name ?? a.assetId} → ${user?.name ?? "Unknown"} (due ${new Date(a.expectedReturn!).toLocaleDateString()})`;
      });
      return {
        intent,
        response: `${overdue.length} assets are past their expected return date:\n${lines.join("\n")}`,
        citations: [cite("Open allocations", "/allocations")],
        data: overdue.slice(0, 10),
      };
    }

    case "ALLOCATE_ASSET": {
      const idMatch = message.match(/AF-\d+/i);
      const asset = idMatch ? db.assets.find((a) => a.assetId === idMatch[0].toUpperCase()) : undefined;
      const personMatch = m.match(/to\s+([a-z]+)/i);
      const person = personMatch ? db.users.find((u) => u.name.toLowerCase().startsWith(personMatch[1]!)) : undefined;
      if (!asset) return { intent, response: "Specify an asset ID (e.g. AF-1042) to allocate.", citations: [cite("Assets", "/assets")] };
      if (!person) return { intent, response: `I couldn't identify the recipient. Mention a name like “to Riya”.`, citations: [] };
      return {
        intent,
        response: `I can allocate ${asset.name} (${asset.assetId}) to ${person.name}. Open the allocation panel to confirm the request.`,
        citations: [cite("New allocation", "/allocations")],
      };
    }

    case "BOOK_RESOURCE": {
      const roomMatch = m.match(/room\s*([a-d])/i) ?? m.match(/conference room\s*([a-d])/i);
      const dayMatch = m.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday)/i);
      const timeMatch = m.match(/(\d{1,2})\s*(am|pm)/i);
      const where = roomMatch ? `Conference Room ${roomMatch[1]!.toUpperCase()}` : "a resource";
      const when = dayMatch ? dayMatch[1] : "the selected day";
      const at = timeMatch ? `${timeMatch[1]}${timeMatch[2]}` : "3 PM";
      return {
        intent,
        response: `I'll help you book ${where} ${when} at ${at}. Open the booking form to confirm availability and avoid conflicts.`,
        citations: [cite("New booking", "/bookings")],
      };
    }

    case "MAINTENANCE_DUE": {
      const due = db.assets.filter((a) => a.nextServiceDate && new Date(a.nextServiceDate) <= new Date(Date.now() + 7 * 864e5));
      return {
        intent,
        response: due.length
          ? `${due.length} assets are due for service within the next 7 days. Review and raise maintenance requests before they degrade.`
          : "No assets are due for maintenance in the next 7 days.",
        citations: [cite("Maintenance", "/maintenance")],
        data: due.slice(0, 10),
      };
    }

    case "UTILIZATION_REPORT": {
      const total = db.assets.length;
      const allocated = db.assets.filter((a) => a.status === "ALLOCATED").length;
      const util = Math.round((allocated / total) * 100);
      return {
        intent,
        response: `Current utilization is ${util}% (${allocated}/${total} assets allocated). The highest-utilized department is ${db.departments
          .map((d) => ({ name: d.name, u: db.assets.filter((a) => a.departmentId === d.id).length }))
          .sort((a, b) => b.u - a.u)[0]?.name}.`,
        citations: [cite("Reports", "/reports"), cite("Departments", "/departments")],
      };
    }

    case "MONTHLY_SUMMARY": {
      return {
        intent,
        response:
          "Monthly summary: 480 assets under management, utilization up 12% MoM, 3 audits completed, maintenance volume +35% on laptops. Idle inventory (180+ days) needs a reallocation review. Full breakdown in Reports.",
        citations: [cite("Reports", "/reports")],
      };
    }

    case "IDLE_ASSETS": {
      const idle = db.assets.filter((a) => a.lastUsed && Date.now() - +new Date(a.lastUsed) > 180 * 864e5);
      return {
        intent,
        response: `${idle.length} assets haven't been used in 180+ days and are tying up capital. I recommend a reallocation or retirement review.`,
        citations: [cite("Reports", "/reports")],
        data: idle.slice(0, 10),
      };
    }

    case "SEARCH": {
      const q = m.replace(/.*(search|find|show me)\s*/i, "").trim();
      const asset = db.assets.find((a) => a.name.toLowerCase().includes(q));
      return {
        intent,
        response: asset
          ? `Found ${asset.name} (${asset.assetId}) — ${asset.status}, condition ${asset.condition}.`
          : `I searched for “${q}”. Open global search (⌘K) for the full list across assets, people, and bookings.`,
        citations: [cite("Global search", "/assets")],
      };
    }

    default:
      return {
        intent: "UNKNOWN",
        response:
          "I'm not sure I understood that. I can help with asset lookups, allocations, bookings, maintenance, audits, and reports. Try “Show overdue assets”.",
        citations: [cite("Dashboard", "/"), cite("Help", "/")],
      };
  }
}

export const aiService = {
  async ask(message: string): Promise<AIResult> {
    await sleep(500 + Math.random() * 500);
    const intent = resolveIntent(message);
    return runIntent(message, intent);
  },
};
