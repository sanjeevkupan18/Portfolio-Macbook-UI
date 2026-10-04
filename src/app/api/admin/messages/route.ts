import type { Filter } from "mongodb";
import { handle, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { messagesCollection, type MessageDoc } from "@/lib/db";
import { toDTO, getStats } from "@/lib/messages";
import type { MessageStatus } from "@/types/message";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: Request) {
  return handle(async () => {
    await requireAdmin();
    const url = new URL(request.url);
    const status = url.searchParams.get("status") ?? "all";
    const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20));

    const filter: Filter<MessageDoc> = {};
    if (status === "unread" || status === "read" || status === "archived") filter.status = status as MessageStatus;
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ name: rx }, { email: rx }, { subject: rx }, { message: rx }];
    }

    const col = await messagesCollection();
    const [docs, total, stats] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      col.countDocuments(filter),
      getStats(),
    ]);
    return ok({ messages: docs.map(toDTO), stats, total, page, limit, hasMore: page * limit < total });
  });
}
