import "server-only";
import type { ContactMessageDTO, MessageStats } from "@/types/message";
import { messagesCollection, type MessageDoc } from "@/lib/db";

export function toDTO(doc: MessageDoc): ContactMessageDTO {
  return {
    id: doc._id.toHexString(),
    name: doc.name,
    email: doc.email,
    subject: doc.subject,
    message: doc.message,
    status: doc.status,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function getStats(): Promise<MessageStats> {
  const rows = await (await messagesCollection()).aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]).toArray();
  const by = Object.fromEntries(rows.map((r) => [r._id, r.n])) as Record<string, number>;
  const unread = by.unread ?? 0;
  const read = by.read ?? 0;
  const archived = by.archived ?? 0;
  return { total: unread + read + archived, unread, read, archived };
}
